import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import {
  WealthEnrollmentSource,
  WealthIncentiveMode,
  WealthProgramCategory,
} from '@prisma/client';

export interface BadgeIncentiveInput {
  badgeId: string;
  incentiveMode: WealthIncentiveMode;
  bonusMatchPct?: number;
  autoEnrollPct?: number;
}

export interface CreateWealthProgramDto {
  code?: string;
  name: string;
  description: string;
  category?: WealthProgramCategory;
  providerName?: string;
  logoUrl?: string;
  minPct?: number;
  maxPct?: number;
  defaultPct?: number;
  dividendOrYield: string;
  isDriverSelectable?: boolean;
  requiredBadgeId?: string | null;
  platformBonusPct?: number;
  isActive?: boolean;
  badgeIncentives?: BadgeIncentiveInput[];
}

export type UpdateWealthProgramDto = Partial<CreateWealthProgramDto>;

@Injectable()
export class WealthService {
  private readonly logger = new Logger(WealthService.name);
  private readonly MAX_DEDUCTION_CAP = 0.3;

  constructor(private readonly prisma: PrismaService) {}

  async listPrograms(includeInactive = true) {
    return this.prisma.wealthProgram.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        requiredBadge: {
          select: { id: true, code: true, name: true, tier: true, category: true },
        },
        badgeIncentives: {
          include: {
            badge: {
              select: { id: true, code: true, name: true, tier: true, category: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { enrollments: { where: { status: 'ACTIVE' } } },
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getAvailableForDriver(driverProfileId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      select: { id: true, userId: true },
    });
    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    const [programs, earnedBadges, badgeStatuses, enrollments] = await Promise.all([
      this.prisma.wealthProgram.findMany({
        where: { isActive: true },
        include: {
          requiredBadge: {
            select: { id: true, code: true, name: true, tier: true },
          },
          badgeIncentives: {
            where: { isActive: true },
            include: {
              badge: { select: { id: true, code: true, name: true, tier: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userBadge.findMany({
        where: { userId: profile.userId },
        select: { badgeId: true },
      }),
      this.prisma.driverBadgeStatus.findMany({
        where: { driverProfileId, isActive: true },
        select: { badgeTier: true },
      }),
      this.prisma.driverWealthEnrollment.findMany({
        where: { driverProfileId, status: { in: ['ACTIVE', 'PENDING_CANCELLATION'] } },
      }),
    ]);

    const ownedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));
    const ownedTiers = new Set(badgeStatuses.map((b) => b.badgeTier));
    const enrollmentByProgram = new Map(enrollments.map((e) => [e.programId, e]));

    return programs.map((program) => {
      const hasRequiredBadge =
        !program.requiredBadgeId ||
        ownedBadgeIds.has(program.requiredBadgeId) ||
        (program.requiredBadge?.tier ? ownedTiers.has(program.requiredBadge.tier) : false);

      const matchingIncentives = program.badgeIncentives.filter(
        (inc) => ownedBadgeIds.has(inc.badgeId) || ownedTiers.has(inc.badge.tier)
      );

      const unlockedByIncentive = matchingIncentives.some(
        (inc) =>
          inc.incentiveMode === 'UNLOCK_ACCESS' ||
          inc.incentiveMode === 'UNLOCK_AND_MATCH' ||
          inc.incentiveMode === 'AUTO_ENROLL'
      );

      const incentiveBonusPct = matchingIncentives.reduce(
        (max, inc) => Math.max(max, inc.bonusMatchPct || 0),
        0
      );

      const enrollment = enrollmentByProgram.get(program.id) ?? null;
      const isPendingCancellation = enrollment?.status === 'PENDING_CANCELLATION';
      const daysRemaining = enrollment?.cancellationEffectiveDate
        ? Math.max(0, Math.ceil((new Date(enrollment.cancellationEffectiveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

      return {
        ...program,
        isUnlocked: hasRequiredBadge || unlockedByIncentive,
        canSelect: program.isDriverSelectable && (hasRequiredBadge || unlockedByIncentive),
        effectiveBonusPct: Math.max(program.platformBonusPct || 0, incentiveBonusPct),
        isEnrolled: Boolean(enrollment),
        isPendingCancellation,
        cancellationEffectiveDate: enrollment?.cancellationEffectiveDate ?? null,
        cancellationDaysRemaining: daysRemaining,
        enrollment,
      };
    });
  }

  async createProgram(dto: CreateWealthProgramDto) {
    if (!dto.name?.trim() || !dto.dividendOrYield?.trim()) {
      throw new BadRequestException('Program name and dividend/yield label are required');
    }

    const code =
      dto.code?.trim() ||
      `${dto.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 28)}_${Date.now().toString().slice(-4)}`;

    const minPct = dto.minPct ?? 0.02;
    const maxPct = dto.maxPct ?? 0.2;
    const defaultPct = dto.defaultPct ?? 0.05;
    if (minPct < 0 || maxPct > this.MAX_DEDUCTION_CAP || minPct > maxPct) {
      throw new BadRequestException('Invalid percentage bounds (must be within 0% to 30%)');
    }

    const program = await this.prisma.wealthProgram.create({
      data: {
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || '',
        category: dto.category ?? WealthProgramCategory.SACCO,
        providerName: dto.providerName?.trim() || null,
        logoUrl: dto.logoUrl?.trim() || null,
        minPct,
        maxPct,
        defaultPct,
        dividendOrYield: dto.dividendOrYield.trim(),
        isDriverSelectable: dto.isDriverSelectable ?? true,
        requiredBadgeId: dto.requiredBadgeId || null,
        platformBonusPct: dto.platformBonusPct ?? 0,
        isActive: dto.isActive ?? true,
        badgeIncentives: dto.badgeIncentives?.length
          ? {
              create: dto.badgeIncentives.map((inc) => ({
                badgeId: inc.badgeId,
                incentiveMode: inc.incentiveMode,
                bonusMatchPct: inc.bonusMatchPct ?? 0,
                autoEnrollPct: inc.autoEnrollPct ?? defaultPct,
                isActive: true,
              })),
            }
          : undefined,
      },
      include: {
        requiredBadge: { select: { id: true, code: true, name: true, tier: true, category: true } },
        badgeIncentives: {
          include: {
            badge: { select: { id: true, code: true, name: true, tier: true, category: true } },
          },
        },
        _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
      },
    });

    const badgeIncentives = (program as any).badgeIncentives || [];
    for (const inc of badgeIncentives) {
      await this.syncExistingBadgeHolders(inc.badgeId, program.id, inc);
    }

    return program;
  }

  async updateProgram(id: string, dto: UpdateWealthProgramDto) {
    const existing = await this.prisma.wealthProgram.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Wealth program not found');
    }

    return this.prisma.wealthProgram.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        category: dto.category,
        providerName: dto.providerName === undefined ? undefined : dto.providerName?.trim() || null,
        logoUrl: dto.logoUrl === undefined ? undefined : dto.logoUrl?.trim() || null,
        minPct: dto.minPct,
        maxPct: dto.maxPct,
        defaultPct: dto.defaultPct,
        dividendOrYield: dto.dividendOrYield?.trim(),
        isDriverSelectable: dto.isDriverSelectable,
        requiredBadgeId: dto.requiredBadgeId === undefined ? undefined : dto.requiredBadgeId || null,
        platformBonusPct: dto.platformBonusPct,
        isActive: dto.isActive,
      },
      include: {
        requiredBadge: { select: { id: true, code: true, name: true, tier: true, category: true } },
        badgeIncentives: {
          include: {
            badge: { select: { id: true, code: true, name: true, tier: true, category: true } },
          },
        },
        _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
      },
    });
  }

  async deleteProgram(id: string) {
    await this.prisma.wealthProgram.delete({ where: { id } });
    return { deleted: true };
  }

  async upsertBadgeIncentive(programId: string, input: BadgeIncentiveInput) {
    const [program, badge] = await Promise.all([
      this.prisma.wealthProgram.findUnique({ where: { id: programId } }),
      this.prisma.badge.findUnique({ where: { id: input.badgeId } }),
    ]);
    if (!program) throw new NotFoundException('Wealth program not found');
    if (!badge) throw new NotFoundException('Badge not found');

    const incentive = await this.prisma.badgeWealthIncentive.upsert({
      where: {
        badgeId_programId: { badgeId: input.badgeId, programId },
      },
      create: {
        badgeId: input.badgeId,
        programId,
        incentiveMode: input.incentiveMode,
        bonusMatchPct: input.bonusMatchPct ?? 0,
        autoEnrollPct: input.autoEnrollPct ?? program.defaultPct,
        isActive: true,
      },
      update: {
        incentiveMode: input.incentiveMode,
        bonusMatchPct: input.bonusMatchPct ?? 0,
        autoEnrollPct: input.autoEnrollPct ?? program.defaultPct,
        isActive: true,
      },
      include: {
        badge: { select: { id: true, code: true, name: true, tier: true, category: true } },
      },
    });

    await this.syncExistingBadgeHolders(input.badgeId, programId, incentive);
    return incentive;
  }

  async removeBadgeIncentive(programId: string, incentiveId: string) {
    await this.prisma.badgeWealthIncentive.deleteMany({
      where: { id: incentiveId, programId },
    });
    return { removed: true };
  }

  async enrollDriver(
    driverProfileId: string,
    allocations: Array<{ programId: string; deductionPct: number; isEnrolled: boolean }>
  ) {
    const activeAllocations = allocations.filter((a) => a.isEnrolled);
    const totalPct = activeAllocations.reduce((sum, a) => sum + (a.deductionPct || 0), 0);
    if (totalPct > this.MAX_DEDUCTION_CAP + 0.0001) {
      throw new BadRequestException('Total wealth deductions cannot exceed 30% of earnings');
    }

    const available = await this.getAvailableForDriver(driverProfileId);
    const byId = new Map(available.map((p) => [p.id, p]));

    for (const alloc of allocations) {
      const program = byId.get(alloc.programId);
      if (!program) continue;

      if (!alloc.isEnrolled) {
        // Enforce 60-day policy: transition to PENDING_CANCELLATION rather than immediate termination.
        // In accordance with policy, per-trip deductions continue normally until staff effects termination.
        const existing = await this.prisma.driverWealthEnrollment.findUnique({
          where: { driverProfileId_programId: { driverProfileId, programId: alloc.programId } },
        });
        if (existing && existing.status === 'ACTIVE') {
          const now = new Date();
          const effectiveDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
          await this.prisma.driverWealthEnrollment.update({
            where: { id: existing.id },
            data: {
              status: 'PENDING_CANCELLATION',
              cancellationRequestedAt: now,
              cancellationEffectiveDate: effectiveDate,
              cancellationReason: 'Cancellation requested via driver program selection update',
            },
          });
        }
        continue;
      }

      if (!program.canSelect) {
        throw new BadRequestException(`Program "${program.name}" requires badge unlock or is not driver-selectable`);
      }

      const clampedPct = Math.max(program.minPct, Math.min(program.maxPct, alloc.deductionPct));

      await this.prisma.driverWealthEnrollment.upsert({
        where: {
          driverProfileId_programId: { driverProfileId, programId: alloc.programId },
        },
        create: {
          driverProfileId,
          programId: alloc.programId,
          source: WealthEnrollmentSource.DRIVER_CHOSEN,
          deductionPct: clampedPct,
          platformBonusPct: program.effectiveBonusPct,
          status: 'ACTIVE',
        },
        update: {
          deductionPct: clampedPct,
          platformBonusPct: program.effectiveBonusPct,
          status: 'ACTIVE',
          cancellationRequestedAt: null,
          cancellationEffectiveDate: null,
          cancellationReason: null,
        },
      });

      // If program is Sacco, ensure driverProfile.saccoEnrolled is synchronized
      if (program.category === WealthProgramCategory.SACCO) {
        await this.prisma.driverProfile.update({
          where: { id: driverProfileId },
          data: { saccoEnrolled: true, saccoEnrolledAt: new Date() },
        }).catch(() => {});
      }
    }

    return this.getAvailableForDriver(driverProfileId);
  }

  /**
   * Driver initiates a formal cancellation request for a wealth program.
   * Under the 60-day policy, per-trip deductions continue normally while staff
   * audits liabilities, share capital, and effects termination within 60 days.
   */
  async requestCancellation(driverProfileId: string, programId: string, reason?: string) {
    const enrollment = await this.prisma.driverWealthEnrollment.findUnique({
      where: { driverProfileId_programId: { driverProfileId, programId } },
      include: { program: true },
    });
    if (!enrollment || enrollment.status === 'CANCELLED' || enrollment.status === 'OPTED_OUT') {
      throw new NotFoundException('Active wealth enrollment not found');
    }

    // Enforce mandatory 6-month Sacco lock-in period for the 2% + 3% incentive match
    if (enrollment.program?.category === WealthProgramCategory.SACCO) {
      const enrolledAt = enrollment.enrolledAt ? new Date(enrollment.enrolledAt).getTime() : Date.now();
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      const timeElapsed = Date.now() - enrolledAt;
      if (timeElapsed < sixMonthsMs) {
        const unlockDate = new Date(enrolledAt + sixMonthsMs);
        const daysLeft = Math.ceil((sixMonthsMs - timeElapsed) / (1000 * 60 * 60 * 24));
        throw new BadRequestException(
          `Sacco 2% + 3% match incentive requires a mandatory 6-month minimum lock-in period. You can opt out in ${daysLeft} days (after ${unlockDate.toLocaleDateString('en-KE', { dateStyle: 'medium' })}).`
        );
      }
    }

    if (enrollment.status === 'PENDING_CANCELLATION') {
      const daysRemaining = enrollment.cancellationEffectiveDate
        ? Math.max(0, Math.ceil((new Date(enrollment.cancellationEffectiveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 60;
      return {
        success: true,
        message: 'Cancellation is already pending and under the 60-day staff review period',
        cancellationRequestedAt: enrollment.cancellationRequestedAt,
        cancellationEffectiveDate: enrollment.cancellationEffectiveDate,
        daysRemaining,
        enrollment,
      };
    }

    const now = new Date();
    const effectiveDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    const updated = await this.prisma.driverWealthEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'PENDING_CANCELLATION',
        cancellationRequestedAt: now,
        cancellationEffectiveDate: effectiveDate,
        cancellationReason: reason ?? 'Driver requested program cancellation',
      },
      include: { program: true },
    });

    return {
      success: true,
      message: 'Cancellation requested. In accordance with policy, per-trip deductions continue for up to 60 days while staff audits and effects the termination.',
      cancellationRequestedAt: now,
      cancellationEffectiveDate: effectiveDate,
      daysRemaining: 60,
      enrollment: updated,
    };
  }

  /**
   * Driver changes their mind and aborts / retracts the deduction stoppage within the 60-day notice window.
   * Program is restored to ACTIVE status and deductions continue smoothly.
   */
  async abortCancellation(driverProfileId: string, programId: string) {
    const enrollment = await this.prisma.driverWealthEnrollment.findUnique({
      where: { driverProfileId_programId: { driverProfileId, programId } },
    });
    if (!enrollment || enrollment.status !== 'PENDING_CANCELLATION') {
      throw new BadRequestException('No pending cancellation request found to abort');
    }

    const updated = await this.prisma.driverWealthEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'ACTIVE',
        cancellationRequestedAt: null,
        cancellationEffectiveDate: null,
        cancellationReason: null,
      },
      include: { program: true },
    });

    return {
      success: true,
      message: 'Deduction stoppage aborted by driver. Program remains fully active and enrolled.',
      enrollment: updated,
    };
  }

  /**
   * Alias for abortCancellation
   */
  async retractCancellation(driverProfileId: string, programId: string) {
    return this.abortCancellation(driverProfileId, programId);
  }

  /**
   * Staff/Admin lists all cancellation requests, sorted by urgency.
   */
  async listCancellationRequests(status = 'PENDING_CANCELLATION') {
    const requests = await this.prisma.driverWealthEnrollment.findMany({
      where: { status },
      include: {
        program: true,
        driverProfile: {
          include: {
            user: { select: { fullName: true, phone: true, email: true } },
          },
        },
      },
      orderBy: { cancellationRequestedAt: 'asc' },
    });

    return requests.map((req) => {
      const daysRemaining = req.cancellationEffectiveDate
        ? Math.max(0, Math.ceil((new Date(req.cancellationEffectiveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        ...req,
        daysRemaining,
        isUrgent: daysRemaining <= 10,
      };
    });
  }

  /**
   * Staff effects the program cancellation within the 60-day window.
   * Deductions cease immediately once status becomes CANCELLED.
   */
  async effectCancellation(enrollmentId: string, staffUserId: string, notes?: string) {
    const enrollment = await this.prisma.driverWealthEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { program: true, driverProfile: true },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const updated = await this.prisma.driverWealthEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'CANCELLED',
        cancellationProcessedBy: staffUserId,
        cancellationProcessedAt: new Date(),
        cancellationReason: notes
          ? `${enrollment.cancellationReason ?? ''} | Staff Clearance: ${notes}`
          : enrollment.cancellationReason,
      },
      include: { program: true },
    });

    // If Sacco program, unenroll driver from Sacco
    if (enrollment.program?.category === WealthProgramCategory.SACCO) {
      await this.prisma.driverProfile.update({
        where: { id: enrollment.driverProfileId },
        data: { saccoEnrolled: false, saccoEnrolledAt: null },
      }).catch(() => {});
    }

    return {
      success: true,
      message: 'Program cancellation successfully effected by staff. Per-trip deductions have ceased.',
      enrollment: updated,
    };
  }

  async applyBadgeIncentivesForUser(userId: string, badgeId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) return;

    const incentives = await this.prisma.badgeWealthIncentive.findMany({
      where: { badgeId, isActive: true, program: { isActive: true } },
    });

    for (const inc of incentives) {
      await this.applyIncentiveToDriver(profile.id, inc.programId, inc);
    }
  }

  private async syncExistingBadgeHolders(
    badgeId: string,
    programId: string,
    incentive: { incentiveMode: WealthIncentiveMode; bonusMatchPct: number; autoEnrollPct: number }
  ) {
    if (
      incentive.incentiveMode !== 'AUTO_ENROLL' &&
      incentive.incentiveMode !== 'PLATFORM_MATCH' &&
      incentive.incentiveMode !== 'UNLOCK_AND_MATCH'
    ) {
      return;
    }

    const holders = await this.prisma.userBadge.findMany({
      where: { badgeId },
      include: { user: { include: { driverProfile: { select: { id: true } } } } },
    });

    for (const holder of holders) {
      const driverProfileId = holder.driverProfileId || holder.user?.driverProfile?.id;
      if (driverProfileId) {
        await this.applyIncentiveToDriver(driverProfileId, programId, {
          ...incentive,
          badgeId,
        });
      }
    }
  }

  private async applyIncentiveToDriver(
    driverProfileId: string,
    programId: string,
    inc: { badgeId: string; incentiveMode: WealthIncentiveMode; bonusMatchPct: number; autoEnrollPct: number }
  ) {
    try {
      const existing = await this.prisma.driverWealthEnrollment.findUnique({
        where: { driverProfileId_programId: { driverProfileId, programId } },
      });

      if (inc.incentiveMode === 'AUTO_ENROLL') {
        await this.prisma.driverWealthEnrollment.upsert({
          where: { driverProfileId_programId: { driverProfileId, programId } },
          create: {
            driverProfileId,
            programId,
            source: WealthEnrollmentSource.BADGE_INCENTIVE,
            grantedByBadgeId: inc.badgeId,
            deductionPct: inc.autoEnrollPct,
            platformBonusPct: inc.bonusMatchPct,
            status: 'ACTIVE',
          },
          update: {
            platformBonusPct: Math.max(existing?.platformBonusPct ?? 0, inc.bonusMatchPct),
            grantedByBadgeId: inc.badgeId,
            status: 'ACTIVE',
          },
        });
      } else if (existing && existing.status === 'ACTIVE' && inc.bonusMatchPct > existing.platformBonusPct) {
        await this.prisma.driverWealthEnrollment.update({
          where: { id: existing.id },
          data: {
            platformBonusPct: inc.bonusMatchPct,
            grantedByBadgeId: inc.badgeId,
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed applying badge wealth incentive to driver ${driverProfileId}: ${err?.message}`);
    }
  }
}

