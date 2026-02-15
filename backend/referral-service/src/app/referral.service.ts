import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, LedgerEntryType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const REFERRAL_CONFIG_KEY = 'referral_config';
const PROMO_CONFIG_KEY = 'promo_config';
const MAX_UPLINE_LEVELS = 5;

interface ReferralConfig {
  signup: {
    enabled: boolean;
    totalFee: number;
    allocations: {
      sacco: number;
      directReferrer: number;
      indirectReferrer: number;
    };
  };
  driverPromo: {
    enabled: boolean;
    rules: Array<{ recipient: string; percentage: number }>;
  };
  passengerPromo: {
    enabled: boolean;
    rules: Array<{ recipient: string; percentage: number }>;
  };
  levels: number[];
}

interface PromoConfig {
  isActive: boolean;
  startDate: string;
  endDate: string;
  splits: {
    system: number;
    driver: number;
    upline1: number;
    upline2: number;
  };
  requiredBadgeId: string;
}

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  async getConfig(): Promise<ReferralConfig> {
    const setting = await prisma.setting.findUnique({
      where: { key: REFERRAL_CONFIG_KEY },
    });

    if (setting && setting.value) {
      return setting.value as unknown as ReferralConfig;
    }

    const defaultConfig: ReferralConfig = {
      signup: {
        enabled: true,
        totalFee: 1250,
        allocations: {
          sacco: 1000,
          directReferrer: 100,
          indirectReferrer: 50,
        }
      },
      driverPromo: {
        enabled: true,
        rules: [
          { recipient: 'Driver Take Home', percentage: 80 },
          { recipient: 'Sacco', percentage: 5 },
          { recipient: 'Direct Referrer', percentage: 2 },
          { recipient: 'Indirect Referrer', percentage: 1 },
        ]
      },
      passengerPromo: {
        enabled: true,
        rules: [
          { recipient: 'Direct Referrer', percentage: 2 },
          { recipient: 'Indirect Referrer', percentage: 1 },
        ]
      },
      levels: [10, 5, 2]
    };

    return defaultConfig;
  }

  async updateConfig(config: ReferralConfig): Promise<void> {
    await prisma.setting.upsert({
      where: { key: REFERRAL_CONFIG_KEY },
      update: { value: config as any },
      create: { key: REFERRAL_CONFIG_KEY, value: config as any },
    });
  }

  async getPromoConfig(): Promise<PromoConfig> {
    const setting = await prisma.setting.findUnique({
      where: { key: PROMO_CONFIG_KEY },
    });

    if (setting && setting.value) {
      return setting.value as unknown as PromoConfig;
    }

    return {
      isActive: false,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      splits: { system: 10, driver: 80, upline1: 5, upline2: 5 },
      requiredBadgeId: '',
    };
  }

  async updatePromoConfig(config: PromoConfig): Promise<void> {
    await prisma.setting.upsert({
      where: { key: PROMO_CONFIG_KEY },
      update: { value: config as any },
      create: { key: PROMO_CONFIG_KEY, value: config as any },
    });
  }

  /**
   * Processes the registration fee for a new driver and distributes commissions
   */
  async processRegistrationFee(newDriverId: string, registrationFee: number): Promise<void> {
    this.logger.log(`Starting commission processing for driver ${newDriverId} with fee ${registrationFee}`);

    const config = await this.getConfig();
    const commissionPercentages = config.levels || [];

    if (commissionPercentages.length === 0) {
      this.logger.warn('Referral levels not found. Skipping commission processing.');
      return;
    }

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
      }),
    ]);

    return { total, entries };
  }

  async getDashboardMetrics(dateRange?: string) {
    const commissionSum = await prisma.commissionLedger.aggregate({
      _sum: { amount: true },
      where: { amount: { gt: 0 } },
    });
    const totalCommissionsAllTime = commissionSum._sum.amount || 0;

    const totalReferredDrivers = await prisma.driverProfile.count({
      where: { referrerId: { not: null } },
    });

    const topReferrersGroup = await prisma.driverProfile.groupBy({
      by: ['referrerId'],
      _count: { referrerId: true },
      orderBy: { _count: { referrerId: 'desc' } },
      take: 5,
      where: { referrerId: { not: null } },
    });

    const topReferrers = await Promise.all(
      topReferrersGroup.map(async (group: any) => {
        const driverId = group.referrerId!;
        return {
          name: `Driver ${driverId.substring(0, 4)}`,
          'Successful Referrals': group._count.referrerId,
        };
      })
    );

    return {
      kpis: {
        totalCommissions: {
          month: totalCommissionsAllTime * 0.15, // Mocked 1 month value
          allTime: totalCommissionsAllTime,
        },
        newReferredDrivers: totalReferredDrivers,
        conversionRate: 0.25, // Mocked
        avgReferralsPerDriver: 1.8, // Mocked
      },
      charts: {
        newDriversOverTime: [
          { date: '2024-01', 'New Drivers': 12 },
          { date: '2024-02', 'New Drivers': 19 },
          { date: '2024-03', 'New Drivers': 3 },
          { date: '2024-04', 'New Drivers': 5 },
          { date: '2024-05', 'New Drivers': 2 },
        ],
        topReferrers: topReferrers,
      }
    };
  }

  async getMyCommissions(driverId: string) {
    const totalEarnedAggregate = await prisma.commissionLedger.aggregate({
      _sum: { amount: true },
      where: {
        driverId,
        type: 'CREDIT',
        transactionType: 'REGISTRATION_FEE_COMMISSION'
      }
    });

    const history = await prisma.commissionLedger.findMany({
      where: {
        driverId,
        transactionType: 'REGISTRATION_FEE_COMMISSION'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const historyFormatted = history.map(entry => ({
      id: entry.id,
      amount: entry.amount,
      date: entry.createdAt,
      description: entry.reason,
      sourceDriverId: entry.sourceDriverId
    }));

    return {
      totalEarned: totalEarnedAggregate._sum.amount || 0,
      history: historyFormatted
    };
  }

  async getWeeklyStatsForEmail() {
    return [
      { driverId: 'd-1', email: 'driver1@example.com', name: 'John Doe', amount: 1500, referralCount: 3 },
      { driverId: 'd-2', email: 'driver2@example.com', name: 'Jane Smith', amount: 500, referralCount: 1 },
    ];
  }
}