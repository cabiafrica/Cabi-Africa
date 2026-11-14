import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface CreatePartnerDto {
    name: string;
    contactEmail: string;
    serviceCategory: 'SACCO' | 'INSURANCE_HEALTH' | 'INSURANCE_VEHICLE' | 'INSURANCE_LIFE' | 'INVESTMENT_MMF' | 'PENSION' | 'CUSTOM';
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    optOutNoticeMonths?: number; // 1, 3, 6, 12 months
    testMode?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}

export interface UpdatePartnerDto {
    name?: string;
    contactEmail?: string;
    serviceCategory?: 'SACCO' | 'INSURANCE_HEALTH' | 'INSURANCE_VEHICLE' | 'INSURANCE_LIFE' | 'INVESTMENT_MMF' | 'PENSION' | 'CUSTOM';
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType?: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    optOutNoticeMonths?: number; // 1, 3, 6, 12 months
    testMode?: boolean;
    isActive?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}


@Injectable()
export class FinancialPartnerService {
    private readonly logger = new Logger(FinancialPartnerService.name);

    constructor(private readonly prisma: PrismaService) {}

    async listPartners(category?: string): Promise<any[]> {
        return this.prisma.saccoPartner.findMany({
            where: {
                ...(category ? { serviceCategory: category as any } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { enrolledDrivers: true }
                }
            }
        });
    }

    async getPartnerById(id: string): Promise<any> {
        const partner = await this.prisma.saccoPartner.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrolledDrivers: true }
                }
            }
        });

        if (!partner) {
            throw new HttpException(`Financial partner with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }

        return partner;
    }

    async createPartner(dto: CreatePartnerDto): Promise<any> {
        this.logger.log(`Registering new financial partner: ${dto.name} (${dto.serviceCategory})`);

        return this.prisma.saccoPartner.create({
            data: {
                name: dto.name,
                contactEmail: dto.contactEmail,
                serviceCategory: (dto.serviceCategory as any) ?? 'SACCO',
                apiBaseUrl: dto.apiBaseUrl ?? null,
                apiKey: dto.apiKey ?? null,
                connectorType: dto.connectorType ?? 'REST_API',
                optOutNoticeMonths: dto.optOutNoticeMonths ?? 1,
                testMode: dto.testMode ?? true,
                isActive: false, // Admin must explicitly verify and activate
                logoUrl: dto.logoUrl ?? null,
                description: dto.description ?? null,
                website: dto.website ?? null,
                updatedAt: new Date(),
            }
        });
    }


    async updatePartner(id: string, dto: UpdatePartnerDto): Promise<any> {
        this.logger.log(`Updating financial partner: ${id}`);
        await this.getPartnerById(id);

        return this.prisma.saccoPartner.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.serviceCategory ? { serviceCategory: dto.serviceCategory as any } : {}),
                updatedAt: new Date(),
            }
        });
    }

    async deletePartner(id: string): Promise<{ success: boolean; message: string }> {
        this.logger.log(`Deleting financial partner: ${id}`);
        await this.getPartnerById(id);

        await this.prisma.saccoPartner.delete({
            where: { id }
        });

        return { success: true, message: `Partner ${id} removed successfully` };
    }

    /**
     * Curated catalog of admin-approved wealth creation programs.
     * Returns database partners if active, or comprehensive platform defaults.
     */
    async getDriverWealthPrograms(): Promise<any[]> {
        let adminPrograms: any[] = [];
        try {
            adminPrograms = await (this.prisma as any).wealthProgram?.findMany({
                where: { isActive: true },
                include: {
                    requiredBadge: { select: { id: true, code: true, name: true, tier: true } },
                    badgeIncentives: {
                        where: { isActive: true },
                        include: { badge: { select: { id: true, code: true, name: true, tier: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }) ?? [];
        } catch (e: any) {
            this.logger.warn(`Could not fetch WealthProgram records: ${e?.message}`);
        }

        const mappedAdminPrograms = adminPrograms.map((wp) => ({
            id: wp.id,
            code: wp.code,
            name: wp.name,
            serviceCategory: wp.category,
            description: wp.description ?? '',
            providerName: wp.providerName,
            logoUrl: wp.logoUrl,
            minPct: wp.minPct ?? 0.02,
            maxPct: wp.maxPct ?? 0.20,
            defaultPct: wp.defaultPct ?? 0.05,
            dividendOrYield: wp.dividendOrYield,
            isDriverSelectable: wp.isDriverSelectable ?? true,
            requiredBadge: wp.requiredBadge ?? null,
            platformBonusPct: wp.platformBonusPct ?? 0,
            badgeIncentives: wp.badgeIncentives ?? [],
        }));

        let partners: any[] = [];
        try {
            partners = await this.prisma.saccoPartner.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            });
        } catch (e: any) {
            this.logger.warn(`Could not fetch partners from DB, serving defaults: ${e?.message}`);
        }

        if (mappedAdminPrograms.length > 0 || (partners && partners.length > 0)) {
            const mappedPartners = partners.map(p => ({
                id: p.id,
                name: p.name,
                serviceCategory: p.serviceCategory,
                description: p.description ?? '',
                logoUrl: p.logoUrl,
                minPct: 0.02,
                maxPct: p.serviceCategory === 'SACCO' ? 0.20 : 0.15,
                defaultPct: p.serviceCategory === 'SACCO' ? 0.10 : 0.05,
                dividendOrYield: p.serviceCategory === 'SACCO' ? '11.2% Projected Annual Dividend' :
                                 p.serviceCategory === 'INVESTMENT_MMF' ? '13.5% Daily Compound Yield' :
                                 p.serviceCategory === 'PENSION' ? 'Government Tax-Exempt Retirement Scheme' :
                                 'KES 500,000 Comprehensive Medical & Accident Cover',
                isDriverSelectable: true,
            }));
            return [...mappedAdminPrograms, ...mappedPartners];
        }

        // Standard Admin Curated Wealth Programs
        return [
            {
                id: 'sacco-capital-stima',
                name: 'Stima DT / Boda PSV SACCO',
                serviceCategory: 'SACCO',
                description: 'Build capital shares, qualify for 3x loan multiples, and earn up to 11.2% annual dividend.',
                minPct: 0.02,
                maxPct: 0.20,
                defaultPct: 0.10,
                dividendOrYield: '11.2% Projected Annual Dividend',
            },
            {
                id: 'insurance-cic-medical',
                name: 'CIC / Jubilee PSV & Family Health',
                serviceCategory: 'INSURANCE_HEALTH',
                description: 'Full outpatient and inpatient medical coverage for driver, spouse, and up to 3 children.',
                minPct: 0.02,
                maxPct: 0.10,
                defaultPct: 0.05,
                dividendOrYield: 'KES 500,000 Comprehensive Medical Underwriting',
            },
            {
                id: 'mmf-britam-yield',
                name: 'Britam High-Yield Money Market Fund',
                serviceCategory: 'INVESTMENT_MMF',
                description: 'Liquid wealth creation with daily interest compounding and instant emergency access.',
                minPct: 0.02,
                maxPct: 0.15,
                defaultPct: 0.05,
                dividendOrYield: '13.5% Daily Compound Yield',
            },
            {
                id: 'pension-octagon-tier2',
                name: 'Octagon / NSSF Driver Retirement Scheme',
                serviceCategory: 'PENSION',
                description: 'Long-term retirement annuity with compound pension growth and government tax relief.',
                minPct: 0.02,
                maxPct: 0.10,
                defaultPct: 0.05,
                dividendOrYield: 'Tax-Exempt Compounded Retirement Fund',
            },
        ];
    }

    /**
     * Gets a driver's active enrolled wealth allocations and remaining 30% limit.
     */
    async getDriverAllocations(driverProfileId: string): Promise<any> {
        const MAX_LIMIT = 0.30; // 30% maximum total deduction
        let consents: any[] = [];

        try {
            consents = await (this.prisma as any).driverFinancialConsent?.findMany({
                where: {
                    driverProfileId,
                    status: 'ACTIVE',
                },
                include: { partner: true }
            }) ?? [];
        } catch (e: any) {
            this.logger.warn(`Could not load consents from DB: ${e?.message}`);
        }

        const totalDeductionPct = consents.reduce((sum, c) => sum + Number(c.deductionPct || 0), 0);
        const remainingLimit = Math.max(0, MAX_LIMIT - totalDeductionPct);

        return {
            driverProfileId,
            maxDeductionLimit: MAX_LIMIT,
            maxDeductionLimitFormatted: '30%',
            totalDeductionPct,
            totalDeductionFormatted: `${(totalDeductionPct * 100).toFixed(1)}%`,
            remainingLimit,
            remainingLimitFormatted: `${(remainingLimit * 100).toFixed(1)}%`,
            isAtLimit: totalDeductionPct >= MAX_LIMIT,
            allocations: consents.map(c => ({
                id: c.id,
                partnerId: c.partnerId,
                serviceType: c.serviceType,
                partnerName: c.partner?.name ?? c.serviceType,
                deductionPct: Number(c.deductionPct),
                deductionFormatted: `${(Number(c.deductionPct) * 100).toFixed(1)}%`,
                status: c.status,
            }))
        };
    }

    /**
     * Updates driver's chosen wealth programs and percentage allocations.
     * Enforces the hard 30% maximum deduction cap.
     */
    async updateDriverAllocations(
        driverProfileId: string,
        allocations: Array<{
            partnerId: string;
            serviceType: string;
            deductionPct: number; // e.g. 0.05 for 5%
            isConsented: boolean;
        }>
    ): Promise<any> {
        const MAX_LIMIT = 0.30; // 30%

        // Calculate total requested deduction
        const activeAllocations = allocations.filter(a => a.isConsented && a.deductionPct > 0);
        const totalRequested = activeAllocations.reduce((sum, a) => sum + Number(a.deductionPct), 0);

        // HARD LIMIT ENFORCEMENT
        if (totalRequested > MAX_LIMIT + 0.0001) {
            throw new HttpException(
                `Total deduction of ${(totalRequested * 100).toFixed(1)}% exceeds the maximum allowed limit of 30.0%. Please reduce your percentages.`,
                HttpStatus.BAD_REQUEST
            );
        }

        this.logger.log(`Updating wealth allocations for driver ${driverProfileId}: total ${(totalRequested * 100).toFixed(1)}% across ${activeAllocations.length} services`);

        // Save consents
        for (const item of allocations) {
            try {
                if (item.isConsented && item.deductionPct > 0) {
                    await (this.prisma as any).driverFinancialConsent?.upsert({
                        where: {
                            driverProfileId_partnerId: {
                                driverProfileId,
                                partnerId: item.partnerId,
                            }
                        },
                        update: {
                            serviceType: item.serviceType,
                            deductionPct: item.deductionPct,
                            isConsented: true,
                            status: 'ACTIVE',
                            updatedAt: new Date(),
                        },
                        create: {
                            driverProfileId,
                            partnerId: item.partnerId,
                            serviceType: item.serviceType,
                            deductionPct: item.deductionPct,
                            isConsented: true,
                            termsVersion: 'v1.0',
                            status: 'ACTIVE',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }
                    });
                } else {
                    // Deactivate or remove consent
                    await (this.prisma as any).driverFinancialConsent?.deleteMany({
                        where: {
                            driverProfileId,
                            partnerId: item.partnerId,
                        }
                    });
                }
            } catch (err: any) {
                this.logger.warn(`Could not save consent for ${item.partnerId}: ${err?.message}`);
            }
        }

        return this.getDriverAllocations(driverProfileId);
    }
}
