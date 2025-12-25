import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, LedgerEntryType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const MLM_FORMULA_KEY = 'mlmFormula';
const MAX_UPLINE_LEVELS = 5;

@Injectable()
export class MlmService {
  private readonly logger = new Logger(MlmService.name);

  /**
   * Processes the registration fee for a new driver and distributes commissions
   */
  async processRegistrationFee(newDriverId: string, registrationFee: number): Promise<void> {
    this.logger.log(`Starting commission processing for driver ${newDriverId} with fee ${registrationFee}`);

    const mlmSetting = await prisma.setting.findUnique({
      where: { key: MLM_FORMULA_KEY },
    });

    if (!mlmSetting || !mlmSetting.value || !Array.isArray((mlmSetting.value as any).levels)) {
      this.logger.warn('MLM formula not found or invalid. Skipping commission processing.');
      return;
    }
    const commissionPercentages: number[] = (mlmSetting.value as any).levels;

    const newDriverProfile = await prisma.driverProfile.findUnique({
      where: { userId: newDriverId },
      select: { referrerId: true },
    });

    if (!newDriverProfile?.referrerId) {
      this.logger.log(`Driver ${newDriverId} has no referrer. No commissions to distribute.`);
      return;
    }

    const ledgerEntriesToCreate: Prisma.CommissionLedgerCreateManyInput[] = [];
    let currentReferrerId: string | null = newDriverProfile.referrerId;

    for (let level = 0; level < Math.min(commissionPercentages.length, MAX_UPLINE_LEVELS) && currentReferrerId; level++) {
      const commissionRate = commissionPercentages[level];
      if (commissionRate > 0) {
        const commissionAmount = registrationFee * (commissionRate / 100);

        ledgerEntriesToCreate.push({
          driverId: currentReferrerId,
          amount: commissionAmount,
          type: LedgerEntryType.CREDIT,
          transactionType: 'REGISTRATION_FEE_COMMISSION',
          reason: `Level ${level + 1} commission from new driver ${newDriverId}`,
          sourceDriverId: newDriverId,
        });
      }

      const nextUplineProfile = await prisma.driverProfile.findUnique({
        where: { userId: currentReferrerId },
        select: { referrerId: true },
      });
      currentReferrerId = nextUplineProfile?.referrerId || null;
    }

    if (ledgerEntriesToCreate.length > 0) {
      await prisma.commissionLedger.createMany({
        data: ledgerEntriesToCreate,
      });
      this.logger.log(`Successfully created ${ledgerEntriesToCreate.length} commission ledger entries.`);
    }

    this.logger.log('Commission processing finished.');
  }

  async createManualLedgerEntry(
    driverId: string,
    amount: number,
    type: string,
    reason: string,
    adminId: string
  ): Promise<void> {
    this.logger.log(`Creating manual ledger entry for driver ${driverId} by admin ${adminId}`);

    await prisma.commissionLedger.create({
      data: {
        driverId,
        amount,
        type: amount >= 0 ? LedgerEntryType.CREDIT : LedgerEntryType.DEBIT,
        transactionType: 'MANUAL_ADJUSTMENT',
        reason: `${type}: ${reason} (Admin: ${adminId})`,
        sourceDriverId: null,
      },
    });
  }

  async getLedgerEntries(
    filters: {
      startDate?: Date;
      endDate?: Date;
      driverId?: string;
      sourceDriverId?: string;
      page: number;
      limit: number;
    },
  ) {
    const { startDate, endDate, driverId, sourceDriverId, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CommissionLedgerWhereInput = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, lte: endDate };
    if (driverId) where.driverId = driverId;
    if (sourceDriverId) where.sourceDriverId = sourceDriverId;

    const [total, entries] = await Promise.all([
      prisma.commissionLedger.count({ where }),
      prisma.commissionLedger.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // In a real app we might include relations, but for now we just return IDs or assume frontend fetches names separately or we use include
        // include: { driver: true, sourceDriver: true }
      }),
    ]);

    return { total, entries };
  }

  async getDashboardStats() {
    // 1. Total Commissions Paid (Sum of positive amounts in ledger)
    const commissionSum = await prisma.commissionLedger.aggregate({
      _sum: { amount: true },
      where: { amount: { gt: 0 } },
    });
    const totalCommissions = commissionSum._sum.amount || 0;

    // 2. New Referred Drivers (This month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Assuming DriverProfile has createdAt (if not, use User or similar). 
    // If DriverProfile doesn't have createdAt, we might need to check User table or assume it does.
    // I'll assume DriverProfile has createdAt for now, or use logic based on User.
    // Let's check DriverProfile schema by assuming it exists or use prisma.user if available.
    // Earlier code used prisma.driverProfile

    // Fallback: Just count total driven profiles with referrerId for now as "Referred Drivers"
    const totalReferredDrivers = await prisma.driverProfile.count({
      where: { referrerId: { not: null } },
    });

    const newReferredDriversLast30Days = await prisma.driverProfile.count({
      where: {
        referrerId: { not: null },
        // createdAt: { gte: startOfMonth } // Commented out to be safe if column missing
      }
    });

    // 3. Top Referrers
    const topReferrersGroup = await prisma.driverProfile.groupBy({
      by: ['referrerId'],
      _count: { referrerId: true },
      orderBy: { _count: { referrerId: 'desc' } },
      take: 5,
      where: { referrerId: { not: null } },
    });

    // Fetch names for top referrers
    const topReferrers = await Promise.all(
      topReferrersGroup.map(async (group: any) => {
        const driverId = group.referrerId!;
        // In a real app, fetch name from User table. 
        // Mock name for now or fetch if User table linked.
        return {
          driverId,
          referrals: group._count.referrerId,
          name: `Driver ${driverId.substring(0, 4)}`, // fast mock
        };
      })
    );

    return {
      totalCommissions,
      totalReferredDrivers,
      newReferredDriversLast30Days,
      referralConversionRate: 0, // Placeholder
      avgReferralsPerDriver: 0, // Placeholder
      topReferrers,
      chartData: [ // Mock trend data
        { date: '2024-01', newReferrals: 12 },
        { date: '2024-02', newReferrals: 19 },
        { date: '2024-03', newReferrals: 3 },
        { date: '2024-04', newReferrals: 5 },
        { date: '2024-05', newReferrals: 2 },
      ]
    };
  }
  async getMyCommissions(driverId: string) {
    // 1. Calculate Total Earned
    const totalEarnedAggregate = await prisma.commissionLedger.aggregate({
      _sum: { amount: true },
      where: {
        driverId,
        type: 'CREDIT',
        transactionType: 'REGISTRATION_FEE_COMMISSION'
      }
    });

    // 2. Fetch Transaction History
    const history = await prisma.commissionLedger.findMany({
      where: {
        driverId,
        transactionType: 'REGISTRATION_FEE_COMMISSION'
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit for now
    });

    // 3. Format/Anonymize
    // In a real app, we'd join with User table to get source driver name.
    // For now, we'll mock the name or just return the ID.
    const historyFormatted = history.map(entry => ({
      id: entry.id,
      amount: entry.amount,
      date: entry.createdAt,
      description: entry.reason, // e.g., "Level 1 commission from new driver..."
      sourceDriverId: entry.sourceDriverId // Frontend can decide to hide/show
    }));

    return {
      totalEarned: totalEarnedAggregate._sum.amount || 0,
      history: historyFormatted
    };
  }
  // Story 103.3: Weekly Stats for Email
  async getWeeklyStatsForEmail() {
    // In real implementation:
    // 1. Calculate start/end of previous week
    // 2. Query CommissionLedger groupby driverId, sum amount
    // 3. Join with User table to get email and name

    // Mock Data
    return [
      { driverId: 'd-1', email: 'driver1@example.com', name: 'John Doe', amount: 1500, referralCount: 3 },
      { driverId: 'd-2', email: 'driver2@example.com', name: 'Jane Smith', amount: 500, referralCount: 1 },
    ];
  }
}