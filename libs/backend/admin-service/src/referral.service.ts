import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface ReferralConfig {
  registrationFee: number;
  registrationFeeSplit: { system: number; upline1: number; upline2: number };
  fareCommissionSplit: { system: number; upline1: number; upline2: number };
  saccoSavingsRate: number;
  earningBadgeIds: string[];
}

@Injectable()
export class ReferralService {
  private readonly SETTING_KEY = 'REFERRAL_CONFIG';

  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<ReferralConfig> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: this.SETTING_KEY },
    });

    if (!setting) {
      // Default configuration
      return {
        registrationFee: 1000,
        registrationFeeSplit: { system: 60, upline1: 30, upline2: 10 },
        fareCommissionSplit: { system: 70, upline1: 20, upline2: 10 },
        saccoSavingsRate: 5,
        earningBadgeIds: [],
      };
    }

    return setting.value as unknown as ReferralConfig;
  }

  async updateConfig(config: ReferralConfig): Promise<ReferralConfig> {
    // Validate splits
    const regSplit = config.registrationFeeSplit;
    if (regSplit.system + regSplit.upline1 + regSplit.upline2 !== 100) {
      throw new Error('Registration fee splits must sum to 100.');
    }

    const fareSplit = config.fareCommissionSplit;
    if (fareSplit.system + fareSplit.upline1 + fareSplit.upline2 !== 100) {
      throw new Error('Fare commission splits must sum to 100.');
    }

    await this.prisma.setting.upsert({
      where: { key: this.SETTING_KEY },
      update: { value: config as any, updatedAt: new Date() },
      create: {
        key: this.SETTING_KEY,
        value: config as any,
      },
    });

    return config;
  }

  async getCommissionLedger(filters: {
    page: number;
    limit: number;
    driverId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    
    if (filters.driverId) {
      where.driverId = filters.driverId;
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [total, entries] = await Promise.all([
      this.prisma.commissionLedger.count({ where }),
      this.prisma.commissionLedger.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          driverProfile: {
            include: { user: true }
          }
        }
      })
    ]);

    return {
      total,
      entries: entries.map(e => ({
        id: e.id,
        date: e.createdAt,
        driverId: e.driverProfile.user.fullName,
        amount: Number(e.amount),
        type: e.type,
        transactionType: e.transactionType,
        description: e.reason
      }))
    };
  }
}
