import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { BadgeTier } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { WelfareService, WelfareDeductionResult } from '../welfare/welfare.service';

export class TripPayoutInput {
    baseFare: number;
    driverProfileId: string;
    tripId?: string;
}

export interface TripPayoutResult {
    baseFare: number;
    platformCommission: number;
    platformNet: number;
    saccoAdminFee: number;
    badgeBonusActive: boolean;
    badgeBonusAmount: number;
    personalSavingsAmount: number;
    pensionDeduction: number;
    housingDeduction: number;
    totalWelfareDeductions: number;
    driverShare: number;
    driverNetTakeHome: number;
    totalSaccoDeposit: number;
    commissionRebate: number;
    isFlagged: boolean;
    flagReason?: string;
}

interface BadgePrivileges {
    hasPriorityDispatch: boolean;
    hasZoneSelection: boolean;
    commissionRebatePercent: number;
    saccoBonusPercent: number;
    saccoMatchPercent: number;
    maxCreditLimit: number;
    loanRateReduction: number;
}

const BADGE_TIER_WEIGHTS: Record<BadgeTier, number> = {
    ROOKIE: 25,
    STAR_DRIVER: 50,
    ROAD_MASTER: 75,
    ELITE: 100,
    BRONZE: 0,
    SILVER: 0,
    GOLD: 0,
    PLATINUM: 0,
    DIAMOND: 0,
};

const COMMISSION_REBATES: Record<BadgeTier, number> = {
    ROOKIE: 0,
    STAR_DRIVER: 1,
    ROAD_MASTER: 2,
    ELITE: 3,
    BRONZE: 0,
    SILVER: 0,
    GOLD: 0,
    PLATINUM: 0,
    DIAMOND: 0,
};

const GRACE_PERIOD_TRIPS = 50;

@Injectable()
export class CommissionService {
    private readonly logger = new Logger(CommissionService.name);

    constructor(
        private prisma: PrismaService,
        private welfareService: WelfareService,
    ) { }

    async calculateTripPayout(input: TripPayoutInput): Promise<TripPayoutResult> {
        const { baseFare, driverProfileId, tripId } = input;

        const driverProfile = await this.prisma.driverProfile.findUnique({
            where: { id: driverProfileId },
            include: {
                badgeStatus: true,
                savingsPreference: true,
            },
        });

        if (!driverProfile) {
            throw new Error(`Driver profile not found: ${driverProfileId}`);
        }

        const highestActiveBadge = this.getHighestActiveBadge(driverProfile.badgeStatus);
        const privileges = this.calculatePrivileges(highestActiveBadge, driverProfile.totalRidesCompleted);
        const personalSavingRate = driverProfile.savingsPreference?.personalSavingRate ?? 0;

        const fare = new Decimal(baseFare);
        const platformCommissionRate = 0.20;
        const saccoAdminRate = 0.02;
        const badgeBonusRate = 0.03;
        const personalSavingCap = 0.30;

        const platformCommission = fare.times(platformCommissionRate);
        const saccoAdminFee = fare.times(saccoAdminRate);

        let badgeBonusAmount = new Decimal(0);
        let badgeBonusActive = false;

        if (privileges.saccoBonusPercent > 0 || this.isInGracePeriod(driverProfile.totalRidesCompleted)) {
            badgeBonusActive = true;
            badgeBonusAmount = fare.times(badgeBonusRate);
        }

        const commissionRebate = fare.times(privileges.commissionRebatePercent / 100);
        const platformNet = platformCommission.minus(saccoAdminFee).minus(badgeBonusAmount).minus(commissionRebate);

        const driverShare = fare.times(0.80);
        const personalSavingsAmount = driverShare.times(Math.min(personalSavingRate / 100, personalSavingCap));

        const totalSaccoDeposit = saccoAdminFee.plus(badgeBonusAmount).plus(personalSavingsAmount);
        let driverNetTakeHome = driverShare.minus(personalSavingsAmount);

        // ─── Welfare Deductions (Pension & Housing) ────────────────
        let pensionDeduction = new Decimal(0);
        let housingDeduction = new Decimal(0);

        try {
            const welfareDeductions = await this.welfareService.calculateWelfareDeductions(
                driverProfileId,
                tripId,
            );

            for (const wd of welfareDeductions) {
                if (wd.schemeType === 'PENSION') {
                    pensionDeduction = pensionDeduction.plus(wd.amount);
                } else if (wd.schemeType === 'HOUSING') {
                    housingDeduction = housingDeduction.plus(wd.amount);
                }
            }

            const totalWelfare = pensionDeduction.plus(housingDeduction);

            // Enforce 50% cap: total deductions (platform + savings + welfare) must not exceed 50%
            const totalDeductionRate = platformCommissionRate
                + (personalSavingRate / 100)
                + totalWelfare.dividedBy(fare).toNumber();

            if (totalDeductionRate > 0.50) {
                // Skip welfare deductions if they breach the cap
                this.logger.warn(
                    `Welfare deductions skipped for driver ${driverProfileId}: total deductions would be ${(totalDeductionRate * 100).toFixed(1)}%`,
                );
                pensionDeduction = new Decimal(0);
                housingDeduction = new Decimal(0);
            } else {
                driverNetTakeHome = driverNetTakeHome.minus(totalWelfare);

                // Record the welfare deductions in the welfare ledger
                await this.welfareService.recordDeductions(
                    driverProfileId,
                    tripId,
                    welfareDeductions,
                );
            }
        } catch (error) {
            this.logger.error(`Failed to calculate welfare deductions: ${error}`);
        }

        const totalWelfareDeductions = pensionDeduction.plus(housingDeduction);

        const totalDeductionRate = platformCommissionRate
            + (personalSavingRate / 100)
            + totalWelfareDeductions.dividedBy(fare).toNumber();
        let isFlagged = false;
        let flagReason: string | undefined;

        if (totalDeductionRate > 0.50) {
            isFlagged = true;
            flagReason = `Total deductions (${(totalDeductionRate * 100).toFixed(1)}%) exceed 50% cap`;
        }

        const result: TripPayoutResult = {
            baseFare: baseFare,
            platformCommission: platformCommission.toNumber(),
            platformNet: platformNet.toNumber(),
            saccoAdminFee: saccoAdminFee.toNumber(),
            badgeBonusActive,
            badgeBonusAmount: badgeBonusAmount.toNumber(),
            personalSavingsAmount: personalSavingsAmount.toNumber(),
            pensionDeduction: pensionDeduction.toNumber(),
            housingDeduction: housingDeduction.toNumber(),
            totalWelfareDeductions: totalWelfareDeductions.toNumber(),
            driverShare: driverShare.toNumber(),
            driverNetTakeHome: driverNetTakeHome.toNumber(),
            totalSaccoDeposit: totalSaccoDeposit.toNumber(),
            commissionRebate: commissionRebate.toNumber(),
            isFlagged,
            flagReason,
        };

        await this.recordTransaction({
            tripId,
            driverProfileId,
            ...result,
        });

        return result;
    }

    private getHighestActiveBadge(badgeStatuses: { badgeTier: BadgeTier; isActive: boolean }[]): BadgeTier | null {
        const activeBadges = badgeStatuses
            .filter(b => b.isActive)
            .sort((a, b) => BADGE_TIER_WEIGHTS[b.badgeTier] - BADGE_TIER_WEIGHTS[a.badgeTier]);

        return activeBadges.length > 0 ? activeBadges[0].badgeTier : null;
    }

    private isInGracePeriod(totalRides: number): boolean {
        return totalRides < GRACE_PERIOD_TRIPS;
    }

    private calculatePrivileges(badgeTier: BadgeTier | null, totalRides: number): BadgePrivileges {
        if (this.isInGracePeriod(totalRides)) {
            return {
                hasPriorityDispatch: false,
                hasZoneSelection: false,
                commissionRebatePercent: 0,
                saccoBonusPercent: 3,
                saccoMatchPercent: 0,
                maxCreditLimit: 50000,
                loanRateReduction: 0,
            };
        }

        if (!badgeTier) {
            return {
                hasPriorityDispatch: false,
                hasZoneSelection: false,
                commissionRebatePercent: 0,
                saccoBonusPercent: 0,
                saccoMatchPercent: 0,
                maxCreditLimit: 50000,
                loanRateReduction: 0,
            };
        }

        const privileges: BadgePrivileges = {
            hasPriorityDispatch: false,
            hasZoneSelection: false,
            commissionRebatePercent: COMMISSION_REBATES[badgeTier] || 0,
            saccoBonusPercent: 3,
            saccoMatchPercent: 0,
            maxCreditLimit: 50000,
            loanRateReduction: 0,
        };

        switch (badgeTier) {
            case BadgeTier.ROOKIE:
                privileges.saccoBonusPercent = 3;
                break;
            case BadgeTier.STAR_DRIVER:
                privileges.commissionRebatePercent = 1;
                privileges.saccoBonusPercent = 3;
                privileges.saccoMatchPercent = 10;
                privileges.maxCreditLimit = 100000;
                privileges.loanRateReduction = 2;
                break;
            case BadgeTier.ROAD_MASTER:
                privileges.hasPriorityDispatch = true;
                privileges.hasZoneSelection = true;
                privileges.commissionRebatePercent = 2;
                privileges.saccoBonusPercent = 3;
                privileges.saccoMatchPercent = 20;
                privileges.maxCreditLimit = 250000;
                privileges.loanRateReduction = 4;
                break;
            case BadgeTier.ELITE:
                privileges.hasPriorityDispatch = true;
                privileges.hasZoneSelection = true;
                privileges.commissionRebatePercent = 3;
                privileges.saccoBonusPercent = 3;
                privileges.saccoMatchPercent = 30;
                privileges.maxCreditLimit = 500000;
                privileges.loanRateReduction = 6;
                break;
        }

        return privileges;
    }

    async getDriverPrivileges(driverProfileId: string): Promise<BadgePrivileges> {
        const driverProfile = await this.prisma.driverProfile.findUnique({
            where: { id: driverProfileId },
            include: {
                badgeStatus: true,
            },
        });

        if (!driverProfile) {
            throw new Error(`Driver profile not found: ${driverProfileId}`);
        }

        const highestActiveBadge = this.getHighestActiveBadge(driverProfile.badgeStatus);
        return this.calculatePrivileges(highestActiveBadge, driverProfile.totalRidesCompleted);
    }

    async getBadgeTierWeight(driverProfileId: string): Promise<number> {
        const driverProfile = await this.prisma.driverProfile.findUnique({
            where: { id: driverProfileId },
            include: {
                badgeStatus: true,
            },
        });

        if (!driverProfile) {
            return 0;
        }

        const highestActiveBadge = this.getHighestActiveBadge(driverProfile.badgeStatus);
        return highestActiveBadge ? BADGE_TIER_WEIGHTS[highestActiveBadge] : 0;
    }

    private async recordTransaction(data: {
        tripId?: string;
        driverProfileId: string;
        baseFare: number;
        platformCommission: number;
        platformNet: number;
        saccoAdminFee: number;
        badgeBonusActive: boolean;
        badgeBonusAmount: number;
        personalSavingsAmount: number;
        pensionDeduction: number;
        housingDeduction: number;
        driverShare: number;
        driverNetTakeHome: number;
        totalSaccoDeposit: number;
        commissionRebate: number;
        isFlagged: boolean;
        flagReason?: string;
    }): Promise<void> {
        try {
            await this.prisma.transactionLedger.create({
                data: {
                    tripId: data.tripId,
                    driverProfileId: data.driverProfileId,
                    baseFare: data.baseFare,
                    platformCommission: data.platformCommission,
                    platformNet: data.platformNet,
                    saccoAdminFee: data.saccoAdminFee,
                    badgeBonusActive: data.badgeBonusActive,
                    badgeBonusAmount: data.badgeBonusAmount,
                    personalSavingsAmount: data.personalSavingsAmount,
                    pensionDeduction: data.pensionDeduction,
                    housingDeduction: data.housingDeduction,
                    driverShare: data.driverShare,
                    driverNetTakeHome: data.driverNetTakeHome,
                    totalSaccoDeposit: data.totalSaccoDeposit,
                    commissionRebate: data.commissionRebate,
                    isFlagged: data.isFlagged,
                    flagReason: data.flagReason,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to record transaction: ${error}`);
        }
    }

    async getTransactionHistory(
        driverProfileId: string,
        limit = 50,
        offset = 0
    ) {
        return this.prisma.transactionLedger.findMany({
            where: { driverProfileId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    }

    async getSaccoSummary(driverProfileId: string) {
        const transactions = await this.prisma.transactionLedger.findMany({
            where: { driverProfileId },
            select: {
                saccoAdminFee: true,
                badgeBonusAmount: true,
                personalSavingsAmount: true,
                totalSaccoDeposit: true,
                createdAt: true,
            },
        });

        const totalSaccoDeposits = transactions.reduce((sum, t) => sum + t.totalSaccoDeposit.toNumber(), 0);
        const totalBadgeBonuses = transactions.reduce((sum, t) => sum + t.badgeBonusAmount.toNumber(), 0);
        const totalPersonalSavings = transactions.reduce((sum, t) => sum + t.personalSavingsAmount.toNumber(), 0);

        return {
            totalTransactions: transactions.length,
            totalSaccoDeposits,
            totalBadgeBonuses,
            totalPersonalSavings,
            transactions: transactions.slice(0, 10),
        };
    }

    async getOrCreateSavingsPreference(driverProfileId: string) {
        let preference = await this.prisma.driverSavingsPreference.findUnique({
            where: { driverProfileId },
        });

        if (!preference) {
            preference = await this.prisma.driverSavingsPreference.create({
                data: {
                    driverProfileId,
                    personalSavingRate: 0,
                    isAutoSavingsEnabled: false,
                },
            });
        }

        return preference;
    }

    async updateSavingsPreference(
        driverProfileId: string,
        data: {
            personalSavingRate?: number;
            isAutoSavingsEnabled?: boolean;
            preferredZoneIds?: string[];
        }
    ) {
        const current = await this.getOrCreateSavingsPreference(driverProfileId);

        if (data.personalSavingRate !== undefined) {
            if (data.personalSavingRate < 0 || data.personalSavingRate > 30) {
                throw new Error('Personal saving rate must be between 0 and 30');
            }
        }

        return this.prisma.driverSavingsPreference.update({
            where: { driverProfileId },
            data: {
                ...(data.personalSavingRate !== undefined && { personalSavingRate: data.personalSavingRate }),
                ...(data.isAutoSavingsEnabled !== undefined && { isAutoSavingsEnabled: data.isAutoSavingsEnabled }),
                ...(data.preferredZoneIds !== undefined && { preferredZoneIds: data.preferredZoneIds }),
            },
        });
    }
}
