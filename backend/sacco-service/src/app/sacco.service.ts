import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

// ─── Trip Split & Waterfall Engine ────────────────────────────────────────────

export interface VoluntaryDeductionInput {
    serviceType: string; // 'Sacco' | 'INSURANCE_HEALTH' | 'INSURANCE_VEHICLE' | 'INSURANCE_LIFE' | 'INVESTMENT_MMF' | 'PENSION' | string;
    partnerId?: string;
    partnerName?: string;
    requestedPct: number; // e.g. 0.02 = 2%
}

export interface ItemizedDeduction {
    serviceType: string;
    partnerId?: string;
    partnerName?: string;
    priorityTier: number; // 1: Commission, 2: Core Sacco, 3: Insurance, 4: Investment/Wealth
    requestedPct: number;
    appliedPct: number;
    amount: number;
    isCapped: boolean;
}

export interface DriverSaccoSummary {
    driverProfileId: string;
    enrolled: boolean;
    saccoName: string;
    membershipNumber: string;
    totalSavings: number;
    availableWithdrawal: number;
    currentSavingsRate: number; // e.g. 2.0 (2%)
    isAutoSavingsEnabled: boolean;
    dailyWelfareContribution: number;
    isWelfareEnabled: boolean;
    walletBufferThreshold: number; // -5000 KES (Option A)
    joiningIncentiveActive: boolean;
    incentivePct: number; // 3.0 (3%)
    recentTransactionsCount: number;
}

export interface UpdateDriverSavingsSettingsDto {
    savingsRate?: number;
    isAutoSavingsEnabled?: boolean;
    isWelfareEnabled?: boolean;
    dailyWelfareAmount?: number;
}

export interface TripSplitInput {
    fare: number;
    driverEnrolled: boolean;
    incentiveActive: boolean;
    mandatoryRemittancePct?: number;       // default 0.02 (2%)
    incentivePct?: number;                  // default 0.03 (3%) — comes from Cabi's commission
    cabiCommissionPct?: number;             // default 0.18 (18%)
    maxVoluntaryDeductionPct?: number;      // default 0.15 (15% cap across all voluntary services)
    minDriverTakeHomePct?: number;          // default 0.65 (guaranteed minimum 65% take-home)
    voluntaryDeductions?: VoluntaryDeductionInput[];
}

export interface TripSplitResult {
    driverAmount: number;
    saccoAmount: number;
    cabiAmount: number;
    totalVoluntaryDeductionAmount: number;
    itemizedDeductions: ItemizedDeduction[];
    breakdown: {
        driverPct: number;
        saccoPct: number;
        cabiPct: number;
        totalVoluntaryDeductionsPct: number;
        incentiveActive: boolean;
        isDeductionCapped: boolean;
        minTakeHomeGuaranteed: boolean;
    };
}

/**
 * Pure function — computes how a trip fare is split based on:
 * 1. Priority 1: Cabi Commission (18% - active 3% stackable incentive when qualified).
 * 2. Priority 2: Core Sacco Contribution (2% driver contribution + 3% Cabi incentive -> Sacco gets 5%).
 * 3. Priority 3: Essential Protection (Insurance: Health, Vehicle, Personal Accident).
 * 4. Priority 4: Voluntary Wealth & Savings (Investments, MMF, Pension).
 * 
 * Safety Ceiling: Total voluntary deductions from driver earnings are capped at 15% (0.15),
 * guaranteeing driver net take-home is ALWAYS at least 65% of gross fare.
 */
export function computeTripSplit(input: TripSplitInput): TripSplitResult {
    const {
        fare,
        driverEnrolled,
        incentiveActive,
        mandatoryRemittancePct = 0.02,
        incentivePct = 0.03,
        cabiCommissionPct = 0.18,
        maxVoluntaryDeductionPct = 0.15,
        minDriverTakeHomePct = 0.65,
        voluntaryDeductions = [],
    } = input;

    // 1. Cabi Commission Calculation (Priority 1)
    // If incentive is active and driver is in Sacco, the 3% incentive is deducted from Cabi's 18% share (Cabi gets 15%)
    let effectiveCabiPct = cabiCommissionPct;
    let appliedIncentivePct = 0;

    if (driverEnrolled && incentiveActive) {
        appliedIncentivePct = Math.min(incentivePct, cabiCommissionPct);
        effectiveCabiPct = cabiCommissionPct - appliedIncentivePct;
    }

    const cabiAmount = fare * effectiveCabiPct;

    // 2. Track remaining voluntary deduction capacity under the 15% cap
    let remainingDeductionCapacity = maxVoluntaryDeductionPct;
    let anyDeductionCapped = false;
    const itemized: ItemizedDeduction[] = [];

    // 3. Priority 2: Core Sacco Contribution (2% driver deduction)
    let saccoDriverDeductionPct = 0;
    if (driverEnrolled) {
        saccoDriverDeductionPct = Math.min(mandatoryRemittancePct, remainingDeductionCapacity);
        remainingDeductionCapacity -= saccoDriverDeductionPct;

        itemized.push({
            serviceType: 'Sacco',
            priorityTier: 2,
            requestedPct: mandatoryRemittancePct,
            appliedPct: saccoDriverDeductionPct,
            amount: fare * saccoDriverDeductionPct,
            isCapped: saccoDriverDeductionPct < mandatoryRemittancePct,
        });
    }

    // 4. Sort other voluntary deductions into Priority 3 (Insurance) and Priority 4 (Investment/Savings)
    const insuranceDeductions: VoluntaryDeductionInput[] = [];
    const investmentDeductions: VoluntaryDeductionInput[] = [];

    for (const vd of voluntaryDeductions) {
        if (vd.serviceType === 'Sacco') {
            // Already handled via core Sacco enrollment
            continue;
        }
        if (vd.serviceType.toUpperCase().startsWith('INSURANCE')) {
            insuranceDeductions.push(vd);
        } else {
            investmentDeductions.push(vd);
        }
    }

    // Priority 3: Insurance
    for (const ins of insuranceDeductions) {
        const requested = Math.max(0, ins.requestedPct);
        const applied = Math.min(requested, Math.max(0, remainingDeductionCapacity));
        if (applied < requested) anyDeductionCapped = true;
        remainingDeductionCapacity -= applied;

        itemized.push({
            serviceType: ins.serviceType,
            partnerId: ins.partnerId,
            partnerName: ins.partnerName,
            priorityTier: 3,
            requestedPct: requested,
            appliedPct: applied,
            amount: fare * applied,
            isCapped: applied < requested,
        });
    }

    // Priority 4: Investments / MMF / Pension / Wealth
    for (const inv of investmentDeductions) {
        const requested = Math.max(0, inv.requestedPct);
        const applied = Math.min(requested, Math.max(0, remainingDeductionCapacity));
        if (applied < requested) anyDeductionCapped = true;
        remainingDeductionCapacity -= applied;

        itemized.push({
            serviceType: inv.serviceType,
            partnerId: inv.partnerId,
            partnerName: inv.partnerName,
            priorityTier: 4,
            requestedPct: requested,
            appliedPct: applied,
            amount: fare * applied,
            isCapped: applied < requested,
        });
    }

    // Total voluntary deduction percentage from driver
    const totalVoluntaryDeductionsPct = itemized.reduce((sum, it) => sum + it.appliedPct, 0);
    const totalVoluntaryDeductionAmount = fare * totalVoluntaryDeductionsPct;

    // Sacco Total Remittance = Driver's Sacco contribution + Cabi's 3% incentive
    const saccoAmount = (fare * saccoDriverDeductionPct) + (fare * appliedIncentivePct);
    const saccoTotalPct = saccoDriverDeductionPct + appliedIncentivePct;

    // Driver Take-Home Pay = Fare - Cabi Commission - Total Driver Deductions
    const driverPct = 1 - effectiveCabiPct - totalVoluntaryDeductionsPct;
    const driverAmount = fare * driverPct;

    return {
        driverAmount,
        saccoAmount,
        cabiAmount,
        totalVoluntaryDeductionAmount,
        itemizedDeductions: itemized,
        breakdown: {
            driverPct,
            saccoPct: saccoTotalPct,
            cabiPct: effectiveCabiPct,
            totalVoluntaryDeductionsPct,
            incentiveActive: appliedIncentivePct > 0,
            isDeductionCapped: anyDeductionCapped,
            minTakeHomeGuaranteed: driverPct >= minDriverTakeHomePct,
        }
    };
}


// ─── DTOs ─────────────────────────────────────────────────────────────────────

export class CreateSaccoPartnerDto {
    name: string;
    contactEmail: string;
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    testMode?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}

export class UpdateSaccoPartnerDto {
    name?: string;
    contactEmail?: string;
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType?: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    testMode?: boolean;
    isActive?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}

export class SaccoFinancialConfigDto {
    mandatoryRemittancePct: number;
    cabiCommissionPct: number;
    joiningIncentiveEnabled: boolean;
    joiningIncentivePct: number;
    joiningIncentiveDurationDays: number;
    maxVoluntaryDeductionPct: number; // default 0.15 (15%)
    minDriverTakeHomePct: number;     // default 0.65 (65%)
    optOutNoticeMonths: number;       // default 1 (next month cycle), or 3 (3 months), 6 (6 months), 12 (1 year)
}

// ─── Main Service ─────────────────────────────────────────────────────────────

@Injectable()
export class SaccoService {
    private readonly logger = new Logger(SaccoService.name);

    constructor(private readonly prisma: PrismaService) {}

    async getHealth() {
        return { status: 'OK', service: 'sacco-service', timestamp: new Date() };
    }

    // ── Partner Management ────────────────────────────────────────────────────

    async createPartner(dto: CreateSaccoPartnerDto): Promise<any> {
        this.logger.log(`Creating external Sacco partner: ${dto.name}`);
        return this.prisma.saccoPartner.create({
            data: {
                name: dto.name,
                contactEmail: dto.contactEmail,
                apiBaseUrl: dto.apiBaseUrl ?? null,
                apiKey: dto.apiKey ?? null,
                connectorType: dto.connectorType,
                testMode: dto.testMode ?? true,
                isActive: false, // Admin must explicitly activate
                logoUrl: dto.logoUrl ?? null,
                description: dto.description ?? null,
                website: dto.website ?? null,
                updatedAt: new Date(),
            }
        });
    }

    async updatePartner(id: string, dto: UpdateSaccoPartnerDto): Promise<any> {
        this.logger.log(`Updating Sacco partner: ${id}`);
        const partner = await this.prisma.saccoPartner.findUnique({ where: { id } });
        if (!partner) throw new Error('Sacco partner not found');
        return this.prisma.saccoPartner.update({
            where: { id },
            data: { ...dto, updatedAt: new Date() }
        });
    }

    async listPartners(): Promise<any[]> {
        return this.prisma.saccoPartner.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { enrolledDrivers: true } } }
        });
    }

    async getPartnerById(id: string): Promise<any> {
        return this.prisma.saccoPartner.findUnique({
            where: { id },
            include: { _count: { select: { enrolledDrivers: true } } }
        });
    }

    async getActivePartner(): Promise<any> {
        return this.prisma.saccoPartner.findFirst({ where: { isActive: true } });
    }

    // ── Financial Config ──────────────────────────────────────────────────────

    async getFinancialConfig(): Promise<SaccoFinancialConfigDto> {
        const keys = [
            'Sacco_MANDATORY_REMITTANCE_PCT',
            'CABI_COMMISSION_PCT',
            'Sacco_JOINING_INCENTIVE_ENABLED',
            'Sacco_JOINING_INCENTIVE_PCT',
            'Sacco_JOINING_INCENTIVE_DURATION_DAYS',
            'MAX_VOLUNTARY_DEDUCTION_PCT',
            'MIN_DRIVER_TAKE_HOME_PCT',
            'FINANCIAL_OPTOUT_NOTICE_MONTHS',
        ];

        const settings = await this.prisma.systemSettings.findMany({ where: { key: { in: keys } } });
        const get = (k: string, def: string) => settings.find(s => s.key === k)?.value ?? def;

        return {
            mandatoryRemittancePct: parseFloat(get('Sacco_MANDATORY_REMITTANCE_PCT', '0.02')),
            cabiCommissionPct: parseFloat(get('CABI_COMMISSION_PCT', '0.18')),
            joiningIncentiveEnabled: get('Sacco_JOINING_INCENTIVE_ENABLED', 'true') === 'true',
            joiningIncentivePct: parseFloat(get('Sacco_JOINING_INCENTIVE_PCT', '0.03')),
            joiningIncentiveDurationDays: parseInt(get('Sacco_JOINING_INCENTIVE_DURATION_DAYS', '365')),
            maxVoluntaryDeductionPct: parseFloat(get('MAX_VOLUNTARY_DEDUCTION_PCT', '0.15')),
            minDriverTakeHomePct: parseFloat(get('MIN_DRIVER_TAKE_HOME_PCT', '0.65')),
            optOutNoticeMonths: parseInt(get('FINANCIAL_OPTOUT_NOTICE_MONTHS', '1')),
        };
    }

    async updateFinancialConfig(dto: SaccoFinancialConfigDto): Promise<SaccoFinancialConfigDto> {
        this.logger.log('Updating Sacco financial config');

        const upsert = async (key: string, value: string) => {
            await this.prisma.systemSettings.upsert({
                where: { key },
                update: { value, updatedAt: new Date() },
                create: { key, value, description: `Sacco config: ${key}`, updatedAt: new Date() }
            });
        };

        await Promise.all([
            upsert('Sacco_MANDATORY_REMITTANCE_PCT', String(dto.mandatoryRemittancePct)),
            upsert('CABI_COMMISSION_PCT', String(dto.cabiCommissionPct)),
            upsert('Sacco_JOINING_INCENTIVE_ENABLED', String(dto.joiningIncentiveEnabled)),
            upsert('Sacco_JOINING_INCENTIVE_PCT', String(dto.joiningIncentivePct)),
            upsert('Sacco_JOINING_INCENTIVE_DURATION_DAYS', String(dto.joiningIncentiveDurationDays)),
            upsert('MAX_VOLUNTARY_DEDUCTION_PCT', String(dto.maxVoluntaryDeductionPct ?? 0.15)),
            upsert('MIN_DRIVER_TAKE_HOME_PCT', String(dto.minDriverTakeHomePct ?? 0.65)),
            upsert('FINANCIAL_OPTOUT_NOTICE_MONTHS', String(dto.optOutNoticeMonths ?? 1)),
        ]);

        return this.getFinancialConfig();
    }



    // ── Driver Enrollment ─────────────────────────────────────────────────────

    async enrollDriver(driverId: string, partnerId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} enrolling in Sacco partner ${partnerId}`);

        const partner = await this.prisma.saccoPartner.findUnique({ where: { id: partnerId } });
        if (!partner || !partner.isActive) throw new Error('Sacco partner is not active or does not exist');

        const profile = await this.prisma.driverProfile.findUnique({ where: { userId: driverId } });
        if (!profile) throw new Error('Driver profile not found');

        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: {
                saccoEnrolled: true,
                saccoPartnerId: partnerId,
                saccoEnrolledAt: new Date(),
            }
        });
    }

    async unenrollDriver(driverId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} unenrolling from Sacco`);
        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: {
                saccoEnrolled: false,
                saccoPartnerId: null,
                saccoEnrolledAt: null,
            }
        });
    }

    async getEnrolledDrivers(partnerId?: string): Promise<any[]> {
        return this.prisma.driverProfile.findMany({
            where: {
                saccoEnrolled: true,
                ...(partnerId ? { saccoPartnerId: partnerId } : {})
            },
            include: {
                user: { select: { fullName: true, phone: true, email: true } }
            },
            orderBy: { saccoEnrolledAt: 'desc' }
        });
    }

    async getDriverEnrollmentStatus(driverId: string): Promise<any> {
        const profile = await this.prisma.driverProfile.findUnique({
            where: { userId: driverId },
            select: {
                saccoEnrolled: true,
                saccoPartnerId: true,
                saccoEnrolledAt: true,
            }
        });

        if (!profile?.saccoEnrolled) {
            return { enrolled: false, partner: null, enrolledAt: null, incentiveActive: false, incentiveDaysRemaining: 0 };
        }

        const config = await this.getFinancialConfig();
        let incentiveActive = false;
        let incentiveDaysRemaining = 0;

        if (config.joiningIncentiveEnabled && profile.saccoEnrolledAt) {
            const msSinceEnrollment = Date.now() - profile.saccoEnrolledAt.getTime();
            const daysSinceEnrollment = msSinceEnrollment / (1000 * 60 * 60 * 24);
            incentiveDaysRemaining = Math.max(0, config.joiningIncentiveDurationDays - Math.floor(daysSinceEnrollment));
            incentiveActive = incentiveDaysRemaining > 0;
        }

        const partner = profile.saccoPartnerId
            ? await this.prisma.saccoPartner.findUnique({ where: { id: profile.saccoPartnerId } })
            : null;

        return {
            enrolled: true,
            partner: partner ? { id: partner.id, name: partner.name, logoUrl: partner.logoUrl } : null,
            enrolledAt: profile.saccoEnrolledAt,
            incentiveActive,
            incentiveDaysRemaining,
            config: {
                mandatoryRemittancePct: config.mandatoryRemittancePct,
                incentivePct: config.joiningIncentivePct,
            }
        };
    }

    // ── Remittance Ledger (per-trip) ──────────────────────────────────────────

    async recordRemittance(driverId: string, tripId: string, amount: number, partnerId: string): Promise<any> {
        this.logger.log(`Recording Sacco remittance for driver ${driverId}, trip ${tripId}, amount ${amount}`);
        return this.prisma.saccoLedger.create({
            data: {
                driverId,
                amount,
                type: 'Sacco_REMITTANCE',
                relatedTripId: tripId,
            }
        });
    }

    async getRemittanceHistory(driverId: string): Promise<any[]> {
        const profile = await this.prisma.driverProfile.findFirst({
            where: {
                OR: [{ id: driverId }, { userId: driverId }],
            },
        });
        const targetId = profile ? profile.id : driverId;
        return this.prisma.saccoLedger.findMany({
            where: { driverId: targetId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getTotalRemitted(driverId: string): Promise<number> {
        const profile = await this.prisma.driverProfile.findFirst({
            where: {
                OR: [{ id: driverId }, { userId: driverId }],
            },
        });
        const targetId = profile ? profile.id : driverId;
        const result = await this.prisma.saccoLedger.aggregate({
            _sum: { amount: true },
            where: { driverId: targetId }
        });
        return result._sum.amount ? Number(result._sum.amount) : 0;
    }

    async getDriverSaccoSummary(idOrUserId: string): Promise<DriverSaccoSummary> {
        const profile = await this.prisma.driverProfile.findFirst({
            where: {
                OR: [{ id: idOrUserId }, { userId: idOrUserId }],
            },
            include: {
                saccoPartner: true,
                savingsPreference: true,
                user: true,
                welfareEnrollments: {
                    where: { isActive: true },
                    include: { scheme: true },
                },
            },
        });

        if (!profile) {
            return {
                driverProfileId: idOrUserId,
                enrolled: false,
                saccoName: 'CABI Sacco',
                membershipNumber: 'SACCO-PENDING',
                totalSavings: 0,
                availableWithdrawal: 0,
                currentSavingsRate: 2.0,
                isAutoSavingsEnabled: true,
                dailyWelfareContribution: 50,
                isWelfareEnabled: true,
                walletBufferThreshold: -5000,
                joiningIncentiveActive: true,
                incentivePct: 3.0,
                recentTransactionsCount: 0,
            };
        }

        const totalRemitted = await this.getTotalRemitted(profile.id);
        const count = await this.prisma.saccoLedger.count({
            where: { driverId: profile.id },
        });

        const activeWelfare = profile.welfareEnrollments?.[0];
        const isWelfare = Boolean(activeWelfare && activeWelfare.isActive);
        const welfareAmount = activeWelfare?.customAmount ? Number(activeWelfare.customAmount) : 50;

        let rateFraction = profile.savingsPreference?.personalSavingRate ?? 0;
        if (rateFraction === 0 && profile.saccoEnrolled) {
            rateFraction = 0.02;
        } else if (rateFraction === 0 && !profile.savingsPreference) {
            rateFraction = 0.02; // default 2%
        }
        const currentRatePct = Math.round(rateFraction * 1000) / 10;

        const incentiveEval = await this.evaluateStackableIncentives(profile.id);

        const partnerName = profile.saccoPartner?.name || 'CABI Sacco';
        const partnerCode = (profile.saccoPartner?.name ?? 'CABI').replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const memberNum = `SACCO-${partnerCode}-${profile.id.substring(0, 6).toUpperCase()}`;

        return {
            driverProfileId: profile.id,
            enrolled: Boolean(profile.saccoEnrolled),
            saccoName: partnerName,
            membershipNumber: memberNum,
            totalSavings: totalRemitted,
            availableWithdrawal: Math.round(totalRemitted * 0.3 * 100) / 100,
            currentSavingsRate: currentRatePct,
            isAutoSavingsEnabled: profile.savingsPreference?.isAutoSavingsEnabled ?? true,
            dailyWelfareContribution: welfareAmount,
            isWelfareEnabled: isWelfare,
            walletBufferThreshold: -5000, // Option A: negative wallet balance permitted up to 5,000 KES
            joiningIncentiveActive: incentiveEval.incentiveActive,
            incentivePct: Math.round(incentiveEval.totalIncentivePct * 1000) / 10,
            recentTransactionsCount: count,
        };
    }

    async updateDriverSavingsSettings(
        idOrUserId: string,
        dto: UpdateDriverSavingsSettingsDto
    ): Promise<DriverSaccoSummary> {
        const profile = await this.prisma.driverProfile.findFirst({
            where: {
                OR: [{ id: idOrUserId }, { userId: idOrUserId }],
            },
        });

        if (!profile) {
            throw new Error(`Driver profile not found: ${idOrUserId}`);
        }

        let rateFraction = dto.savingsRate !== undefined ? dto.savingsRate : 0.02;
        if (rateFraction > 1) {
            rateFraction = rateFraction / 100;
        }
        if (rateFraction < 0) rateFraction = 0;
        if (rateFraction > 0.30) rateFraction = 0.30;

        await this.prisma.driverSavingsPreference.upsert({
            where: { driverProfileId: profile.id },
            create: {
                driverProfileId: profile.id,
                personalSavingRate: rateFraction,
                isAutoSavingsEnabled: dto.isAutoSavingsEnabled ?? true,
            },
            update: {
                personalSavingRate: rateFraction,
                isAutoSavingsEnabled: dto.isAutoSavingsEnabled ?? true,
            },
        });

        if (rateFraction > 0 && !profile.saccoEnrolled) {
            await this.prisma.driverProfile.update({
                where: { id: profile.id },
                data: {
                    saccoEnrolled: true,
                    saccoEnrolledAt: profile.saccoEnrolledAt ?? new Date(),
                },
            });
        }

        return this.getDriverSaccoSummary(profile.id);
    }

    // ── Stackable Incentive Rule Evaluator ─────────────────────────────────────

    /**
     * Evaluates stackable incentive rules for a driver.
     * Rules can include:
     * - TENURE_DURATION (e.g., new drivers <= 365 days)
     * - BADGE_TIER (e.g., GOLD, PLATINUM, ROAD_MASTER)
     * - TRIP_COUNT (e.g., driver completed >= 30 trips)
     *
     * Returns whether the driver qualifies for the 3% incentive (or combined stackable incentive).
     */
    async evaluateStackableIncentives(
        driverProfileId: string,
        context?: { completedTrips?: number; fareAmount?: number }
    ): Promise<{
        incentiveActive: boolean;
        totalIncentivePct: number;
        qualifyingRules: Array<{ ruleId: string; name: string; ruleType: string; incentivePct: number }>;
    }> {
        const config = await this.getFinancialConfig();
        if (!config.joiningIncentiveEnabled) {
            return { incentiveActive: false, totalIncentivePct: 0, qualifyingRules: [] };
        }

        const profile = await this.prisma.driverProfile.findUnique({
            where: { id: driverProfileId },
            include: {
                user: true,
                badgeStatus: true,
            }
        });

        if (!profile) {
            return { incentiveActive: false, totalIncentivePct: 0, qualifyingRules: [] };
        }

        const qualifyingRules: Array<{ ruleId: string; name: string; ruleType: string; incentivePct: number }> = [];

        // 1. Default Tenure Evaluation (New drivers within duration, e.g. 1 year / 365 days)
        const enrolledAt = profile.saccoEnrolledAt ?? profile.user.createdAt;
        const daysSinceEnrollment = (Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceEnrollment <= config.joiningIncentiveDurationDays) {
            qualifyingRules.push({
                ruleId: 'DEFAULT_TENURE_RULE',
                name: `New Driver Welcome (${config.joiningIncentiveDurationDays} days)`,
                ruleType: 'TENURE_DURATION',
                incentivePct: config.joiningIncentivePct,
            });
        }

        // 2. Fetch custom stackable rules from database if present
        try {
            const rules = await (this.prisma as any).financialIncentiveRule?.findMany({
                where: { isActive: true }
            }) ?? [];

            for (const rule of rules) {
                if (rule.ruleType === 'BADGE_TIER') {
                    const requiredBadge = (rule.criteria as any)?.badgeTier;
                    const hasBadge = profile.badgeStatus.some(b => b.badgeTier === requiredBadge && b.isActive);
                    if (hasBadge) {
                        qualifyingRules.push({
                            ruleId: rule.id,
                            name: rule.name,
                            ruleType: rule.ruleType,
                            incentivePct: Number(rule.incentivePct),
                        });
                    }
                } else if (rule.ruleType === 'TENURE_DURATION') {
                    const maxDays = (rule.criteria as any)?.maxTenureDays ?? 365;
                    if (daysSinceEnrollment <= maxDays) {
                        qualifyingRules.push({
                            ruleId: rule.id,
                            name: rule.name,
                            ruleType: rule.ruleType,
                            incentivePct: Number(rule.incentivePct),
                        });
                    }
                } else if (rule.ruleType === 'TRIP_COUNT') {
                    const minTrips = (rule.criteria as any)?.minTrips ?? 50;
                    const trips = context?.completedTrips ?? profile.totalRidesCompleted;
                    if (trips >= minTrips) {
                        qualifyingRules.push({
                            ruleId: rule.id,
                            name: rule.name,
                            ruleType: rule.ruleType,
                            incentivePct: Number(rule.incentivePct),
                        });
                    }
                }
            }
        } catch {
            // Fallback gracefully if table not yet migrated
        }

        // Incentive applies if any rule qualifies
        const incentiveActive = qualifyingRules.length > 0;
        const totalIncentivePct = incentiveActive
            ? Math.max(config.joiningIncentivePct, ...qualifyingRules.map(r => r.incentivePct))
            : 0;

        return {
            incentiveActive,
            totalIncentivePct,
            qualifyingRules,
        };
    }

    // ── Split Preview (for admin calculator) ─────────────────────────────────

    async previewSplit(
        fare: number,
        enrolled: boolean,
        incentiveOverride?: boolean,
        voluntaryDeductions?: VoluntaryDeductionInput[]
    ): Promise<TripSplitResult> {
        const config = await this.getFinancialConfig();
        const incentiveActive = incentiveOverride ?? config.joiningIncentiveEnabled;

        return computeTripSplit({
            fare,
            driverEnrolled: enrolled,
            incentiveActive,
            mandatoryRemittancePct: config.mandatoryRemittancePct,
            incentivePct: config.joiningIncentivePct,
            cabiCommissionPct: config.cabiCommissionPct,
            maxVoluntaryDeductionPct: config.maxVoluntaryDeductionPct,
            minDriverTakeHomePct: config.minDriverTakeHomePct,
            voluntaryDeductions,
        });
    }
}

