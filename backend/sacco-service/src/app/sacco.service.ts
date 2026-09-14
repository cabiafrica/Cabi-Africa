import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

// ─── Trip Split Engine ────────────────────────────────────────────────────────

export interface TripSplitInput {
    fare: number;
    driverEnrolled: boolean;
    incentiveActive: boolean;
    mandatoryRemittancePct: number;  // e.g. 0.02 (2%)
    incentivePct: number;             // e.g. 0.03 (3%) — from Cabi's commission
    cabiCommissionPct: number;        // e.g. 0.18 (18%)
}

export interface TripSplitResult {
    driverAmount: number;
    saccoAmount: number;
    cabiAmount: number;
    breakdown: {
        driverPct: number;
        saccoPct: number;
        cabiPct: number;
        incentiveActive: boolean;
    };
}

/**
 * Pure function — computes how a trip fare is split.
 *
 * Business rules:
 *   Not enrolled:           driver=82%, sacco=0%,  cabi=18%
 *   Enrolled (no incentive): driver=80%, sacco=2%,  cabi=18%
 *   Enrolled + incentive:   driver=80%, sacco=5%,  cabi=15%
 *   (the 3% incentive comes FROM cabi's commission, never extra)
 */
export function computeTripSplit(input: TripSplitInput): TripSplitResult {
    const { fare, driverEnrolled, incentiveActive, mandatoryRemittancePct, incentivePct, cabiCommissionPct } = input;

    if (!driverEnrolled) {
        const driverPct = 1 - cabiCommissionPct;
        return {
            driverAmount: fare * driverPct,
            saccoAmount: 0,
            cabiAmount: fare * cabiCommissionPct,
            breakdown: { driverPct, saccoPct: 0, cabiPct: cabiCommissionPct, incentiveActive: false }
        };
    }

    // Driver always gets (1 - cabiCommissionPct - mandatoryRemittancePct)
    const driverPct = 1 - cabiCommissionPct - mandatoryRemittancePct;

    if (incentiveActive) {
        // The extra incentivePct comes out of cabi's share
        const saccoPct = mandatoryRemittancePct + incentivePct;
        const cabiPct = cabiCommissionPct - incentivePct;
        return {
            driverAmount: fare * driverPct,
            saccoAmount: fare * saccoPct,
            cabiAmount: fare * cabiPct,
            breakdown: { driverPct, saccoPct, cabiPct, incentiveActive: true }
        };
    }

    return {
        driverAmount: fare * driverPct,
        saccoAmount: fare * mandatoryRemittancePct,
        cabiAmount: fare * cabiCommissionPct,
        breakdown: { driverPct, saccoPct: mandatoryRemittancePct, cabiPct: cabiCommissionPct, incentiveActive: false }
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
            'SACCO_MANDATORY_REMITTANCE_PCT',
            'CABI_COMMISSION_PCT',
            'SACCO_JOINING_INCENTIVE_ENABLED',
            'SACCO_JOINING_INCENTIVE_PCT',
            'SACCO_JOINING_INCENTIVE_DURATION_DAYS',
        ];

        const settings = await this.prisma.systemSettings.findMany({ where: { key: { in: keys } } });
        const get = (k: string, def: string) => settings.find(s => s.key === k)?.value ?? def;

        return {
            mandatoryRemittancePct: parseFloat(get('SACCO_MANDATORY_REMITTANCE_PCT', '0.02')),
            cabiCommissionPct: parseFloat(get('CABI_COMMISSION_PCT', '0.18')),
            joiningIncentiveEnabled: get('SACCO_JOINING_INCENTIVE_ENABLED', 'false') === 'true',
            joiningIncentivePct: parseFloat(get('SACCO_JOINING_INCENTIVE_PCT', '0.03')),
            joiningIncentiveDurationDays: parseInt(get('SACCO_JOINING_INCENTIVE_DURATION_DAYS', '90')),
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
            upsert('SACCO_MANDATORY_REMITTANCE_PCT', String(dto.mandatoryRemittancePct)),
            upsert('CABI_COMMISSION_PCT', String(dto.cabiCommissionPct)),
            upsert('SACCO_JOINING_INCENTIVE_ENABLED', String(dto.joiningIncentiveEnabled)),
            upsert('SACCO_JOINING_INCENTIVE_PCT', String(dto.joiningIncentivePct)),
            upsert('SACCO_JOINING_INCENTIVE_DURATION_DAYS', String(dto.joiningIncentiveDurationDays)),
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
                type: 'SACCO_REMITTANCE',
                relatedTripId: tripId,
            }
        });
    }

    async getRemittanceHistory(driverId: string): Promise<any[]> {
        return this.prisma.saccoLedger.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getTotalRemitted(driverId: string): Promise<number> {
        const result = await this.prisma.saccoLedger.aggregate({
            _sum: { amount: true },
            where: { driverId }
        });
        return result._sum.amount ? Number(result._sum.amount) : 0;
    }

    // ── Split Preview (for admin calculator) ─────────────────────────────────

    async previewSplit(fare: number, enrolled: boolean, incentiveOverride?: boolean): Promise<TripSplitResult> {
        const config = await this.getFinancialConfig();
        const incentiveActive = incentiveOverride ?? config.joiningIncentiveEnabled;

        return computeTripSplit({
            fare,
            driverEnrolled: enrolled,
            incentiveActive,
            mandatoryRemittancePct: config.mandatoryRemittancePct,
            incentivePct: config.joiningIncentivePct,
            cabiCommissionPct: config.cabiCommissionPct,
        });
    }
}
