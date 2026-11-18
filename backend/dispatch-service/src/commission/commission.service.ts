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
    wealthProgramDeductions?: number;
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
        const platformCommissionRate = 0.18; // 18% base platform commission (unenrolled driver keeps 82%)
        const saccoSavingsRate = 0.02;        // 2% driver contribution
        const badgeBonusRate = 0.03;          // 3% Cabi incentive match
        const personalSavingCap = 0.30;

        const platformCommission = fare.times(platformCommissionRate);

        // ─── 1. Sacco Savings & 3% Incentive Match Logic ───────────────────
        // Unenrolled driver takes 82% (platform takes 18%, Sacco gets 0%).
        // Enrolled driver saves 2% to Sacco -> driver takes 80% (0.82 - 0.02).
        // If qualified (new driver or top badge), Cabi funds 3% from its 18% commission -> Cabi gets 15%, Sacco gets 5% (2% + 3%).
        const isSaccoEnrolled = Boolean(driverProfile.saccoEnrolled);

        let driverSaccoFee = new Decimal(0);
        let badgeBonusAmount = new Decimal(0);
        let badgeBonusActive = false;

        if (isSaccoEnrolled) {
            // Driver contributes 2% of gross fare to the presented Sacco
            driverSaccoFee = fare.times(saccoSavingsRate);

            // Incentive eligibility check:
            // 1. New driver in grace period (< 50 trips)
            // 2. Or maintains an admin-designated top badge (ELITE, ROAD_MASTER, or privileges.saccoBonusPercent > 0)
            const hasTopBadge = highestActiveBadge === 'ELITE' ||
                highestActiveBadge === 'ROAD_MASTER' ||
                (privileges && privileges.saccoBonusPercent > 0);
            const isNewDriver = this.isInGracePeriod(driverProfile.totalRidesCompleted);

            if (isNewDriver || hasTopBadge) {
                badgeBonusActive = true;
                badgeBonusAmount = fare.times(badgeBonusRate); // 3% paid from Cabi's 18% commission
            }
        }

        const commissionRebate = fare.times(privileges.commissionRebatePercent / 100);

        // Cabi Platform Net Commission:
        // Platform keeps 18% base commission MINUS the 3% platform match (if qualified) MINUS commission rebate.
        // The driver's 2% is paid by the driver, so it is NOT deducted from platform net.
        const platformNet = platformCommission.minus(badgeBonusAmount).minus(commissionRebate);

        // Driver Share:
        // Base gross driver share is 82% (0.82)
        const driverShare = fare.times(0.82);
        const personalSavingsAmount = driverShare.times(Math.min(personalSavingRate / 100, personalSavingCap));

        // Total Sacco Deposit:
        // Driver's 2% + Cabi's 3% match + any optional personal savings
        const totalSaccoDeposit = driverSaccoFee.plus(badgeBonusAmount).plus(personalSavingsAmount);

        // Driver Net Take-Home:
        // Unenrolled: 82% - 0 = 82% (KES 820 on KES 1,000)
        // Enrolled: 82% - 2% = 80% (KES 800 on KES 1,000)
        let driverNetTakeHome = driverShare.minus(driverSaccoFee).minus(personalSavingsAmount);

        // ─── Welfare Deductions (Compulsory Pension 10/- & Housing) ─────────
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

            // COMPULSORY: 10/- per trip deduction is compulsory for every driver on every trip (short or long)
            if (pensionDeduction.lessThan(10)) {
                pensionDeduction = new Decimal(10);
            }

            const totalWelfare = pensionDeduction.plus(housingDeduction);

            // Enforce 50% cap: total deductions (platform + savings + welfare) must not exceed 50%
            const totalDeductionRate = platformCommissionRate
                + (personalSavingRate / 100)
                + (isSaccoEnrolled ? saccoSavingsRate : 0)
                + totalWelfare.dividedBy(fare).toNumber();

            if (totalDeductionRate > 0.50) {
                // In extreme caps, retain compulsory 10/- pension but skip voluntary housing
                this.logger.warn(
                    `Housing deduction skipped for driver ${driverProfileId}: total deductions would be ${(totalDeductionRate * 100).toFixed(1)}%`,
                );
                housingDeduction = new Decimal(0);
                driverNetTakeHome = driverNetTakeHome.minus(pensionDeduction);
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
            // Fallback: Compulsory Ksh. 10 pension still applies
            pensionDeduction = new Decimal(10);
            driverNetTakeHome = driverNetTakeHome.minus(pensionDeduction);
        }

        const totalWelfareDeductions = pensionDeduction.plus(housingDeduction);

        // ─── Voluntary Wealth Program Deductions (Sacco, Insurance, MMF, Pension) ───
        // In accordance with 60-day policy: deductions continue normally while ACTIVE or PENDING_CANCELLATION
        // until staff effects the termination.
        let wealthProgramDeductions = new Decimal(0);
        try {
            const [consents, wealthEnrollments] = await Promise.all([
                (this.prisma as any).driverFinancialConsent?.findMany({
                    where: {
                        driverProfileId,
                        status: { in: ['ACTIVE', 'PENDING_CANCELLATION', 'PENDING_OPT_OUT'] },
                        isConsented: true,
                    }
                }).catch(() => []),
                (this.prisma as any).driverWealthEnrollment?.findMany({
                    where: {
                        driverProfileId,
                        status: { in: ['ACTIVE', 'PENDING_CANCELLATION'] },
                    },
                    include: { program: true },
                }).catch(() => [])
            ]);

            let totalVoluntaryPct = 0;

            if (consents && consents.length > 0) {
                for (const c of consents) {
                    // Avoid double-counting core Sacco deduction already processed above
                    if (c.serviceType === 'Sacco' && isSaccoEnrolled) continue;
                    totalVoluntaryPct += Number(c.deductionPct || 0);
                }
            }

            if (wealthEnrollments && wealthEnrollments.length > 0) {
                for (const we of wealthEnrollments) {
                    if (we.program?.category === 'Sacco' && isSaccoEnrolled) continue;
                    totalVoluntaryPct += Number(we.deductionPct || 0);
                }
            }

            if (totalVoluntaryPct > 0) {
                const effectivePct = Math.min(totalVoluntaryPct, 0.30); // 30% cap
                wealthProgramDeductions = driverShare.times(effectivePct);
                driverNetTakeHome = driverNetTakeHome.minus(wealthProgramDeductions);
            }
        } catch (consentErr: any) {
            this.logger.warn(`Could not compute voluntary wealth deductions: ${consentErr?.message}`);
        }

        const totalDeductionRate = platformCommissionRate
            + (personalSavingRate / 100)
            + (isSaccoEnrolled ? saccoSavingsRate : 0)
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
            saccoAdminFee: driverSaccoFee.toNumber(),
            badgeBonusActive,
            badgeBonusAmount: badgeBonusAmount.toNumber(),
            personalSavingsAmount: personalSavingsAmount.toNumber(),
            pensionDeduction: pensionDeduction.toNumber(),
            housingDeduction: housingDeduction.toNumber(),
            totalWelfareDeductions: totalWelfareDeductions.toNumber(),
            driverShare: driverShare.toNumber(),
            wealthProgramDeductions: wealthProgramDeductions.toNumber(),
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
