import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { WelfareSchemeType, WelfareDeductionMode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateSchemeDto {
    name: string;
    type: WelfareSchemeType;
    deductionMode: WelfareDeductionMode;
    amount: number;
    minAmount?: number;
    maxAmount?: number;
    description?: string;
    providerName?: string;
    providerAccount?: string;
}

export interface UpdateSchemeDto {
    name?: string;
    amount?: number;
    minAmount?: number;
    maxAmount?: number;
    description?: string;
    providerName?: string;
    providerAccount?: string;
    isActive?: boolean;
}

export interface EnrollDriverDto {
    driverProfileId: string;
    schemeId: string;
    customAmount?: number;
}

export interface WelfareDeductionResult {
    schemeId: string;
    schemeName: string;
    schemeType: WelfareSchemeType;
    amount: number;
}

@Injectable()
export class WelfareService {
    private readonly logger = new Logger(WelfareService.name);

    constructor(private prisma: PrismaService) {}

    // ─── Scheme CRUD (Admin) ───────────────────────────────────────

    async getActiveSchemes() {
        return this.prisma.welfareScheme.findMany({
            where: { isActive: true },
            include: { _count: { select: { enrollments: { where: { isActive: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAllSchemes() {
        return this.prisma.welfareScheme.findMany({
            include: { _count: { select: { enrollments: { where: { isActive: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getSchemeById(id: string) {
        const scheme = await this.prisma.welfareScheme.findUnique({
            where: { id },
            include: { _count: { select: { enrollments: { where: { isActive: true } } } } },
        });
        if (!scheme) throw new NotFoundException(`Scheme ${id} not found`);
        return scheme;
    }

    async createScheme(dto: CreateSchemeDto) {
        return this.prisma.welfareScheme.create({
            data: {
                name: dto.name,
                type: dto.type,
                deductionMode: dto.deductionMode,
                amount: dto.amount,
                minAmount: dto.minAmount,
                maxAmount: dto.maxAmount,
                description: dto.description,
                providerName: dto.providerName,
                providerAccount: dto.providerAccount,
            },
        });
    }

    async updateScheme(id: string, dto: UpdateSchemeDto) {
        await this.getSchemeById(id);
        return this.prisma.welfareScheme.update({
            where: { id },
            data: dto,
        });
    }

    // ─── Driver Enrollment ─────────────────────────────────────────

    async enrollDriver(dto: EnrollDriverDto) {
        const scheme = await this.getSchemeById(dto.schemeId);
        if (!scheme.isActive) {
            throw new ConflictException('Cannot enroll in an inactive scheme');
        }

        // Validate custom amount for housing schemes
        if (scheme.type === 'HOUSING' && dto.customAmount !== undefined) {
            if (scheme.minAmount && dto.customAmount < scheme.minAmount.toNumber()) {
                throw new ConflictException(
                    `Amount must be at least KSH ${scheme.minAmount}`,
                );
            }
            if (scheme.maxAmount && dto.customAmount > scheme.maxAmount.toNumber()) {
                throw new ConflictException(
                    `Amount cannot exceed KSH ${scheme.maxAmount}`,
                );
            }
        }

        // Upsert: re-activate if previously unenrolled
        return this.prisma.welfareEnrollment.upsert({
            where: {
                driverProfileId_schemeId: {
                    driverProfileId: dto.driverProfileId,
                    schemeId: dto.schemeId,
                },
            },
            update: {
                isActive: true,
                unenrolledAt: null,
                customAmount: dto.customAmount,
            },
            create: {
                driverProfileId: dto.driverProfileId,
                schemeId: dto.schemeId,
                customAmount: dto.customAmount,
                isActive: true,
            },
            include: { scheme: true },
        });
    }

    async unenrollDriver(driverProfileId: string, schemeId: string) {
        const enrollment = await this.prisma.welfareEnrollment.findUnique({
            where: {
                driverProfileId_schemeId: { driverProfileId, schemeId },
            },
        });

        if (!enrollment || !enrollment.isActive) {
            throw new NotFoundException('Active enrollment not found');
        }

        return this.prisma.welfareEnrollment.update({
            where: { id: enrollment.id },
            data: { isActive: false, unenrolledAt: new Date() },
        });
    }

    async getDriverEnrollments(driverProfileId: string) {
        return this.prisma.welfareEnrollment.findMany({
            where: { driverProfileId, isActive: true },
            include: { scheme: true },
        });
    }

    // ─── Deduction Calculation (called by CommissionService) ───────

    async getOrCreateDefaultPensionScheme(): Promise<any> {
        let scheme = await this.prisma.welfareScheme.findFirst({
            where: { type: 'PENSION', deductionMode: 'PER_TRIP', isActive: true },
        });

        if (!scheme) {
            scheme = await this.prisma.welfareScheme.create({
                data: {
                    name: 'Compulsory Driver Pension Scheme',
                    type: 'PENSION',
                    deductionMode: 'PER_TRIP',
                    amount: 10.00,
                    minAmount: 10.00,
                    maxAmount: 10.00,
                    description: 'Compulsory Ksh. 10 per-trip retirement contribution remitted to pension company',
                    providerName: 'Octagon / NSSF Pension Partner',
                    isActive: true,
                },
            });
        }

        return scheme;
    }

    async calculateWelfareDeductions(
        driverProfileId: string,
        tripId?: string,
    ): Promise<WelfareDeductionResult[]> {
        const enrollments = await this.prisma.welfareEnrollment.findMany({
            where: { driverProfileId, isActive: true, scheme: { isActive: true } },
            include: { scheme: true },
        });

        const results: WelfareDeductionResult[] = [];
        let hasPension = false;

        for (const enrollment of enrollments) {
            const scheme = enrollment.scheme;
            let deductionAmount = 0;

            if (scheme.deductionMode === 'PER_TRIP') {
                deductionAmount = scheme.amount.toNumber();
                if (scheme.type === 'PENSION') {
                    hasPension = true;
                    // Enforce compulsory minimum of Ksh. 10 per trip
                    deductionAmount = Math.max(10, deductionAmount);
                }
            } else if (scheme.deductionMode === 'PER_DAY') {
                // Housing: driver's daily target. Check how much already deducted today.
                const dailyTarget = enrollment.customAmount
                    ? enrollment.customAmount.toNumber()
                    : scheme.amount.toNumber();

                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const todayDeductions = await this.prisma.welfareDeduction.aggregate({
                    where: {
                        driverProfileId,
                        schemeId: scheme.id,
                        createdAt: { gte: todayStart },
                    },
                    _sum: { amount: true },
                });

                const alreadyDeducted = todayDeductions._sum.amount
                    ? todayDeductions._sum.amount.toNumber()
                    : 0;
                const remaining = dailyTarget - alreadyDeducted;

                if (remaining > 0) {
                    deductionAmount = remaining;
                }
            }

            if (deductionAmount > 0) {
                results.push({
                    schemeId: scheme.id,
                    schemeName: scheme.name,
                    schemeType: scheme.type,
                    amount: deductionAmount,
                });
            }
        }

        // COMPULSORY PENSION DEDUCTION:
        // Ksh. 10 per trip deduction is compulsory for every driver on every trip (short or long).
        // If not already covered by an existing active enrollment, automatically apply the compulsory pension.
        if (!hasPension) {
            const defaultPensionScheme = await this.getOrCreateDefaultPensionScheme();
            results.push({
                schemeId: defaultPensionScheme.id,
                schemeName: defaultPensionScheme.name,
                schemeType: 'PENSION',
                amount: 10,
            });
        }

        return results;
    }

    async recordDeductions(
        driverProfileId: string,
        tripId: string | undefined,
        deductions: WelfareDeductionResult[],
    ) {
        if (deductions.length === 0) return;

        await this.prisma.welfareDeduction.createMany({
            data: deductions.map((d) => ({
                driverProfileId,
                schemeId: d.schemeId,
                tripId,
                amount: d.amount,
            })),
        });
    }

    // ─── Summary & Reports ─────────────────────────────────────────

    async getDriverWelfareSummary(driverProfileId: string) {
        const enrollments = await this.prisma.welfareEnrollment.findMany({
            where: { driverProfileId },
            include: { scheme: true },
        });

        const summaries = await Promise.all(
            enrollments.map(async (enrollment) => {
                const totals = await this.prisma.welfareDeduction.aggregate({
                    where: { driverProfileId, schemeId: enrollment.schemeId },
                    _sum: { amount: true },
                    _count: true,
                });

                // Today's deductions for daily schemes
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayTotal = await this.prisma.welfareDeduction.aggregate({
                    where: {
                        driverProfileId,
                        schemeId: enrollment.schemeId,
                        createdAt: { gte: todayStart },
                    },
                    _sum: { amount: true },
                });

                return {
                    schemeId: enrollment.schemeId,
                    schemeName: enrollment.scheme.name,
                    schemeType: enrollment.scheme.type,
                    isActive: enrollment.isActive,
                    customAmount: enrollment.customAmount?.toNumber() ?? null,
                    totalContributed: totals._sum.amount?.toNumber() ?? 0,
                    totalDeductions: totals._count,
                    todayContributed: todayTotal._sum.amount?.toNumber() ?? 0,
                    enrolledAt: enrollment.enrolledAt,
                };
            }),
        );

        return summaries;
    }

    async getSchemeReport(schemeId: string) {
        const scheme = await this.getSchemeById(schemeId);

        const totalCollected = await this.prisma.welfareDeduction.aggregate({
            where: { schemeId },
            _sum: { amount: true },
            _count: true,
        });

        const enrolledDrivers = await this.prisma.welfareEnrollment.findMany({
            where: { schemeId, isActive: true },
            include: {
                driverProfile: {
                    include: { user: { select: { fullName: true, phone: true } } },
                },
            },
        });

        return {
            scheme,
            totalCollected: totalCollected._sum.amount?.toNumber() ?? 0,
            totalDeductions: totalCollected._count,
            enrolledDrivers: enrolledDrivers.map((e) => ({
                driverProfileId: e.driverProfileId,
                driverName: e.driverProfile.user.fullName,
                phone: e.driverProfile.user.phone,
                customAmount: e.customAmount?.toNumber() ?? null,
                enrolledAt: e.enrolledAt,
            })),
        };
    }

    // ─── Pension Ledger & Pension Company Integration ─────────────

    /**
     * Retrieves itemized compulsory Ksh. 10 per trip pension deductions.
     */
    async getPensionLedger(filters?: {
        driverProfileId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Math.max(1, filters?.page ?? 1);
        const limit = Math.max(1, Math.min(100, filters?.limit ?? 50));
        const skip = (page - 1) * limit;

        const where: any = {
            scheme: { type: 'PENSION' },
        };

        if (filters?.driverProfileId) {
            where.driverProfileId = filters.driverProfileId;
        }

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        const [total, deductions] = await Promise.all([
            this.prisma.welfareDeduction.count({ where }),
            this.prisma.welfareDeduction.findMany({
                where,
                include: {
                    scheme: { select: { name: true, providerName: true, providerAccount: true } },
                    driverProfile: {
                        include: {
                            user: { select: { fullName: true, phone: true, idNumber: true, email: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        const totalAmountAgg = await this.prisma.welfareDeduction.aggregate({
            where,
            _sum: { amount: true },
        });

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalAccumulatedPension: totalAmountAgg._sum.amount?.toNumber() ?? 0,
            deductions: deductions.map((d) => ({
                id: d.id,
                tripId: d.tripId,
                amount: d.amount.toNumber(),
                driverProfileId: d.driverProfileId,
                driverName: d.driverProfile?.user?.fullName ?? 'Unknown Driver',
                driverPhone: d.driverProfile?.user?.phone ?? '',
                driverIdNumber: d.driverProfile?.user?.idNumber ?? '',
                schemeName: d.scheme.name,
                providerName: d.scheme.providerName ?? 'Octagon/NSSF',
                createdAt: d.createdAt,
            })),
        };
    }

    /**
     * Exports pension remittance schedule formatted for the pension company (Octagon, NSSF, etc.).
     */
    async exportPensionLedgerBatch(options?: { startDate?: string; endDate?: string; format?: 'CSV' | 'JSON' }) {
        const ledgerData = await this.getPensionLedger({
            startDate: options?.startDate,
            endDate: options?.endDate,
            page: 1,
            limit: 10000,
        });

        if (options?.format === 'CSV') {
            const headers = ['Deduction ID', 'Driver Name', 'National ID', 'Phone', 'Trip ID', 'Amount (KES)', 'Provider', 'Timestamp'];
            const rows = ledgerData.deductions.map((d) => [
                d.id,
                `"${d.driverName.replace(/"/g, '""')}"`,
                `"${d.driverIdNumber}"`,
                `"${d.driverPhone}"`,
                d.tripId ?? '',
                d.amount.toFixed(2),
                `"${d.providerName}"`,
                d.createdAt.toISOString(),
            ]);

            const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
            return {
                format: 'CSV',
                filename: `pension_remittance_batch_${new Date().toISOString().slice(0, 10)}.csv`,
                totalRecords: ledgerData.total,
                totalAmount: ledgerData.totalAccumulatedPension,
                content: csvContent,
            };
        }

        return {
            format: 'JSON',
            totalRecords: ledgerData.total,
            totalAmount: ledgerData.totalAccumulatedPension,
            batchTimestamp: new Date(),
            deductions: ledgerData.deductions,
        };
    }

    /**
     * Outbound integration: Dispatches pension remittance batch to the active Pension Company REST API.
     * Falls back gracefully to local ledger recording if the API is offline.
     */
    async dispatchPensionRemittanceToApi(options?: { startDate?: string; endDate?: string; partnerId?: string }) {
        const pensionPartner = await this.prisma.saccoPartner.findFirst({
            where: {
                serviceCategory: 'PENSION',
                isActive: true,
                ...(options?.partnerId ? { id: options.partnerId } : {}),
            },
        });

        const batch = await this.exportPensionLedgerBatch({
            startDate: options?.startDate,
            endDate: options?.endDate,
            format: 'JSON',
        });

        if (!pensionPartner?.apiBaseUrl) {
            this.logger.log(`No active pension partner API configured. Defaulting to local ledger export.`);
            return {
                success: true,
                mode: 'LEDGER_EXPORT',
                message: 'Remittances recorded in local ledger. Export CSV ready for pension company batch upload.',
                batchSummary: {
                    totalRecords: batch.totalRecords,
                    totalAmount: batch.totalAmount,
                    partnerName: pensionPartner?.name ?? 'Octagon / NSSF Pension Scheme',
                },
            };
        }

        try {
            const axios = (await import('axios')).default;
            const response = await axios.post(
                `${pensionPartner.apiBaseUrl}/api/cabi/pension-remittance`,
                {
                    partnerId: pensionPartner.id,
                    providerName: pensionPartner.name,
                    timestamp: new Date().toISOString(),
                    totalRecords: batch.totalRecords,
                    totalAmount: batch.totalAmount,
                    records: batch.deductions,
                },
                {
                    headers: {
                        Authorization: `Bearer ${pensionPartner.apiKey ?? ''}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000,
                },
            );

            return {
                success: true,
                mode: 'REST_API',
                message: 'Remittance batch transmitted successfully to pension company API',
                externalReference: response.data?.reference || response.data?.batchId,
                batchSummary: {
                    totalRecords: batch.totalRecords,
                    totalAmount: batch.totalAmount,
                },
            };
        } catch (err: any) {
            this.logger.error(`Failed to dispatch remittance to pension partner API: ${err?.message}`);
            return {
                success: false,
                mode: 'FALLBACK_TO_LEDGER',
                message: `Pension company API unreachable (${err?.message}). Remittances safely held in local ledger.`,
                batchSummary: {
                    totalRecords: batch.totalRecords,
                    totalAmount: batch.totalAmount,
                },
            };
        }
    }
}
