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

    async calculateWelfareDeductions(
        driverProfileId: string,
        tripId?: string,
    ): Promise<WelfareDeductionResult[]> {
        const enrollments = await this.prisma.welfareEnrollment.findMany({
            where: { driverProfileId, isActive: true, scheme: { isActive: true } },
            include: { scheme: true },
        });

        const results: WelfareDeductionResult[] = [];

        for (const enrollment of enrollments) {
            const scheme = enrollment.scheme;
            let deductionAmount = 0;

            if (scheme.deductionMode === 'PER_TRIP') {
                // Pension: flat fee per trip, set by admin
                deductionAmount = scheme.amount.toNumber();
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
}
