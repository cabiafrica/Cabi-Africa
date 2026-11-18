import { Injectable, Logger, Optional, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { Badge, BadgeCategory, BadgeTier } from '@prisma/client';
import { WealthService } from '../wealth/wealth.service';

interface BadgeWithProgress {
    badge: Badge;
    earnedAt?: Date;
    progress?: number;
    isEarned: boolean;
}

interface DriverStats {
    totalRides: number;
    averageRating: number | null;
    cancellationRate: number | null;
}

@Injectable()
export class BadgeService {
    private readonly logger = new Logger(BadgeService.name);

    constructor(
        private prisma: PrismaService,
        @Optional() private wealthService?: WealthService
    ) { }

    /**
     * Check and award badges after ride completion
     */
    async checkAndAwardBadges(
        userId: string,
        context: 'RIDE_COMPLETED' | 'RATING_RECEIVED'
    ): Promise<Badge[]> {
        this.logger.log(`Checking badges for user ${userId} (context: ${context})`);

        const awardedBadges: Badge[] = [];

        if (context === 'RIDE_COMPLETED') {
            // Get user stats
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    ridesAsPassenger: true,
                    driverProfile: {
                        include: {
                            ridesAsDriver: true,
                        },
                    },
                },
            });

            if (!user) return awardedBadges;

            const totalRides =
                user.ridesAsPassenger.length +
                (user.driverProfile?.ridesAsDriver.length || 0);

            // Check ride milestone badges
            const milestones = [
                { threshold: 1, code: 'FIRST_RIDE' },
                { threshold: 5, code: 'FREQUENT_RIDER' },
                { threshold: 10, code: 'REGULAR_RIDER' },
                { threshold: 25, code: 'DEDICATED_RIDER' },
                { threshold: 50, code: 'HALF_CENTURY' },
                { threshold: 100, code: 'CENTURY_CLUB' },
                { threshold: 250, code: 'ELITE_RIDER' },
                { threshold: 500, code: 'LEGENDARY_RIDER' },
            ];

            for (const milestone of milestones) {
                if (totalRides >= milestone.threshold) {
                    const badge = await this.awardBadgeIfNotExists(
                        userId,
                        milestone.code
                    );
                    if (badge) awardedBadges.push(badge);
                }
            }
        }

        if (context === 'RATING_RECEIVED') {
            // Check rating-based badges
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    averageRating: true,
                    totalRidesAsPassenger: true,
                    driverProfile: {
                        select: {
                            averageRating: true,
                            totalRidesCompleted: true,
                        },
                    },
                },
            });

            if (!user) return awardedBadges;

            const rating = user.averageRating || user.driverProfile?.averageRating;
            const totalRides =
                user.totalRidesAsPassenger +
                (user.driverProfile?.totalRidesCompleted || 0);

            // Award quality badges
            if (rating >= 4.8 && totalRides >= 10) {
                const badge = await this.awardBadgeIfNotExists(userId, 'FIVE_STAR_PRO');
                if (badge) awardedBadges.push(badge);
            }

            if (rating >= 4.5 && totalRides >= 25) {
                const badge = await this.awardBadgeIfNotExists(
                    userId,
                    'HIGHLY_RATED'
                );
                if (badge) awardedBadges.push(badge);
            }
        }

        return awardedBadges;
    }

    /**
     * Award a badge to a user if they don't already have it
     */
    private async awardBadgeIfNotExists(
        userId: string,
        badgeCode: string
    ): Promise<Badge | null> {
        // Check if badge exists
        const badge = await this.prisma.badge.findUnique({
            where: { code: badgeCode },
        });

        if (!badge) {
            this.logger.warn(`Badge ${badgeCode} not found in database`);
            return null;
        }

        // Check if user already has this badge
        const existingUserBadge = await this.prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId: badge.id,
                },
            },
        });

        if (existingUserBadge) {
            return null; // Already has badge
        }

        // Award the badge
        await this.prisma.userBadge.create({
            data: {
                userId,
                badgeId: badge.id,
            },
        });

        await this.wealthService?.applyBadgeIncentivesForUser(userId, badge.id);

        this.logger.log(`Awarded badge ${badgeCode} to user ${userId}`);
        return badge;
    }

    /**
     * Get user badges with progress
     */
    async getUserBadges(userId: string): Promise<BadgeWithProgress[]> {
        const allBadges = await this.prisma.badge.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { tier: 'asc' }],
        });

        const userBadges = await this.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
        });

        const userBadgeMap = new Map(
            userBadges.map((ub) => [ub.badgeId, ub])
        );

        // Get user stats for progress calculation
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                ridesAsPassenger: true,
                driverProfile: {
                    include: {
                        ridesAsDriver: true,
                    },
                },
            },
        });

        const totalRides =
            (user?.ridesAsPassenger.length || 0) +
            (user?.driverProfile?.ridesAsDriver.length || 0);

        return allBadges.map((badge) => {
            const userBadge = userBadgeMap.get(badge.id);
            const isEarned = !!userBadge;

            // Calculate progress for ride milestone badges
            let progress: number | undefined;
            if (badge.category === BadgeCategory.ACHIEVEMENT) {
                const criteria = badge.criteria as any;
                if (criteria.type === 'RIDES_COMPLETED' && criteria.threshold) {
                    progress = Math.min(
                        100,
                        Math.floor((totalRides / criteria.threshold) * 100)
                    );
                }
            }

            return {
                badge,
                earnedAt: userBadge?.earnedAt,
                progress: isEarned ? 100 : progress,
                isEarned,
            };
        });
    }

    /**
     * Seed initial badge definitions
     */
    async seedBadges(): Promise<void> {
        this.logger.log('Seeding badge definitions...');

        const badges = [
            // Achievement Badges
            {
                code: 'FIRST_RIDE',
                name: 'First Ride',
                description: 'Complete your first ride',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.BRONZE,
                criteria: { type: 'RIDES_COMPLETED', threshold: 1 },
            },
            {
                code: 'FREQUENT_RIDER',
                name: 'Frequent Rider',
                description: 'Complete 5 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.BRONZE,
                criteria: { type: 'RIDES_COMPLETED', threshold: 5 },
            },
            {
                code: 'REGULAR_RIDER',
                name: 'Regular Rider',
                description: 'Complete 10 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.SILVER,
                criteria: { type: 'RIDES_COMPLETED', threshold: 10 },
            },
            {
                code: 'DEDICATED_RIDER',
                name: 'Dedicated Rider',
                description: 'Complete 25 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.SILVER,
                criteria: { type: 'RIDES_COMPLETED', threshold: 25 },
            },
            {
                code: 'HALF_CENTURY',
                name: 'Half Century',
                description: 'Complete 50 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.GOLD,
                criteria: { type: 'RIDES_COMPLETED', threshold: 50 },
            },
            {
                code: 'CENTURY_CLUB',
                name: 'Century Club',
                description: 'Complete 100 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.GOLD,
                criteria: { type: 'RIDES_COMPLETED', threshold: 100 },
            },
            {
                code: 'ELITE_RIDER',
                name: 'Elite Rider',
                description: 'Complete 250 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.PLATINUM,
                criteria: { type: 'RIDES_COMPLETED', threshold: 250 },
            },
            {
                code: 'LEGENDARY_RIDER',
                name: 'Legendary Rider',
                description: 'Complete 500 rides',
                category: BadgeCategory.ACHIEVEMENT,
                tier: BadgeTier.DIAMOND,
                criteria: { type: 'RIDES_COMPLETED', threshold: 500 },
            },

            // Quality Badges
            {
                code: 'FIVE_STAR_PRO',
                name: 'Five Star Pro',
                description: 'Maintain 4.8+ rating with 10+ rides',
                category: BadgeCategory.QUALITY,
                tier: BadgeTier.GOLD,
                criteria: { type: 'RATING', threshold: 4.8, minRides: 10 },
            },
            {
                code: 'HIGHLY_RATED',
                name: 'Highly Rated',
                description: 'Maintain 4.5+ rating with 25+ rides',
                category: BadgeCategory.QUALITY,
                tier: BadgeTier.SILVER,
                criteria: { type: 'RATING', threshold: 4.5, minRides: 25 },
            },
        ];

        for (const badgeData of badges) {
            await this.prisma.badge.upsert({
                where: { code: badgeData.code },
                update: badgeData,
                create: badgeData,
            });
        }

        this.logger.log(`Seeded ${badges.length} badge definitions`);
    }

    /**
     * Seed gamified sacco system rewards
     */
    async seedRewards(): Promise<void> {
        this.logger.log('Seeding reward definitions...');

        const { PrismaClient } = await import('@prisma/client');
        const RewardType = PrismaClient['RewardType'];

        const rewards = [
            {
                code: 'PRIORITY_DISPATCH',
                name: 'Priority Dispatch',
                description: 'Get priority in the driver matching queue',
                type: 'PRIORITY_DISPATCH' as any,
                value: { enabled: true },
            },
            {
                code: 'ZONE_SELECTION',
                name: 'Zone Selection',
                description: 'Select preferred operating zones',
                type: 'ZONE_SELECTION' as any,
                value: { maxZones: 3 },
            },
            {
                code: 'COMMISSION_REBATE',
                name: 'Commission Rebate',
                description: 'Reduced platform commission',
                type: 'COMMISSION_REBATE' as any,
                value: { percentage: 3 },
            },
            {
                code: 'Sacco_BONUS',
                name: 'Sacco Bonus',
                description: '3% additional Sacco contribution from platform',
                type: 'Sacco_BONUS' as any,
                value: { percentage: 3 },
            },
            {
                code: 'Sacco_MATCH',
                name: 'Sacco Match',
                description: 'Platform matches a percentage of voluntary savings',
                type: 'Sacco_MATCH' as any,
                value: { percentage: 30 },
            },
            {
                code: 'CREDIT_LIMIT_BOOST',
                name: 'Credit Limit Boost',
                description: 'Higher loan limits',
                type: 'CREDIT_LIMIT_BOOST' as any,
                value: { maxLimit: 500000 },
            },
            {
                code: 'LOAN_RATE_REDUCTION',
                name: 'Loan Rate Reduction',
                description: 'Lower interest rates on Sacco loans',
                type: 'LOAN_RATE_REDUCTION' as any,
                value: { reductionPercent: 6 },
            },
        ];

        for (const reward of rewards) {
            try {
                await this.prisma.reward.upsert({
                    where: { code: reward.code },
                    update: reward,
                    create: reward,
                });
            } catch (error) {
                this.logger.warn(`Could not seed reward ${reward.code}: ${error}`);
            }
        }

        this.logger.log(`Seeded ${rewards.length} reward definitions`);
    }

    /**
     * Seed badge-reward mappings for gamified sacco tiers
     */
    async seedBadgeRewardMappings(): Promise<void> {
        this.logger.log('Seeding badge-reward mappings...');

        const rookierewardMappings = [
            { rewardCode: 'Sacco_BONUS', isActive: true },
        ];

        const starDriverMappings = [
            { rewardCode: 'COMMISSION_REBATE', isActive: true },
            { rewardCode: 'Sacco_BONUS', isActive: true },
            { rewardCode: 'Sacco_MATCH', isActive: true },
            { rewardCode: 'CREDIT_LIMIT_BOOST', isActive: true },
            { rewardCode: 'LOAN_RATE_REDUCTION', isActive: true },
        ];

        const roadMasterMappings = [
            { rewardCode: 'PRIORITY_DISPATCH', isActive: true },
            { rewardCode: 'ZONE_SELECTION', isActive: true },
            { rewardCode: 'COMMISSION_REBATE', isActive: true },
            { rewardCode: 'Sacco_BONUS', isActive: true },
            { rewardCode: 'Sacco_MATCH', isActive: true },
            { rewardCode: 'CREDIT_LIMIT_BOOST', isActive: true },
            { rewardCode: 'LOAN_RATE_REDUCTION', isActive: true },
        ];

        const eliteMappings = [
            { rewardCode: 'PRIORITY_DISPATCH', isActive: true },
            { rewardCode: 'ZONE_SELECTION', isActive: true },
            { rewardCode: 'COMMISSION_REBATE', isActive: true },
            { rewardCode: 'Sacco_BONUS', isActive: true },
            { rewardCode: 'Sacco_MATCH', isActive: true },
            { rewardCode: 'CREDIT_LIMIT_BOOST', isActive: true },
            { rewardCode: 'LOAN_RATE_REDUCTION', isActive: true },
        ];

        const tierMappings: Record<string, { rewardCode: string; isActive: boolean }[]> = {
            'ROOKIE': rookierewardMappings,
            'STAR_DRIVER': starDriverMappings,
            'ROAD_MASTER': roadMasterMappings,
            'ELITE': eliteMappings,
        };

        for (const [tier, mappings] of Object.entries(tierMappings)) {
            const badge = await this.prisma.badge.findFirst({
                where: { code: `${tier}_BADGE` },
            });

            if (!badge) {
                this.logger.warn(`Badge not found for tier: ${tier}`);
                continue;
            }

            for (const mapping of mappings) {
                const reward = await this.prisma.reward.findUnique({
                    where: { code: mapping.rewardCode },
                });

                if (!reward) {
                    this.logger.warn(`Reward not found: ${mapping.rewardCode}`);
                    continue;
                }

                try {
                    await this.prisma.badgeRewardMapping.upsert({
                        where: {
                            badgeId_rewardId: {
                                badgeId: badge.id,
                                rewardId: reward.id,
                            },
                        },
                        update: { isActive: mapping.isActive },
                        create: {
                            badgeId: badge.id,
                            rewardId: reward.id,
                            isActive: mapping.isActive,
                        },
                    });
                } catch (error) {
                    this.logger.warn(`Could not create mapping: ${error}`);
                }
            }
        }

        this.logger.log('Badge-reward mappings seeded');
    }

    /**
     * Check and award gamified sacco tier badges for drivers
     * Called after ride completion to update driver tier status
     */
    async checkAndUpdateDriverBadgeTier(driverProfileId: string): Promise<BadgeTier | null> {
        this.logger.log(`Checking driver badge tier for driver ${driverProfileId}`);

        const driver = await this.prisma.driverProfile.findUnique({
            where: { id: driverProfileId },
            include: {
                ridesAsDriver: {
                    where: { status: 'COMPLETED' },
                    select: { id: true },
                },
            },
        });

        if (!driver) {
            this.logger.warn(`Driver profile not found: ${driverProfileId}`);
            return null;
        }

        const stats: DriverStats = {
            totalRides: driver.ridesAsDriver.length,
            averageRating: driver.averageRating,
            cancellationRate: driver.acceptanceRate,
        };

        const newTier = this.determineBadgeTier(stats);

        if (newTier) {
            await this.updateDriverBadgeStatus(driverProfileId, newTier, stats);
        }

        return newTier;
    }

    /**
     * Determine the appropriate badge tier based on driver stats
     */
    private determineBadgeTier(stats: DriverStats): BadgeTier | null {
        const { totalRides, averageRating, cancellationRate } = stats;

        if (totalRides >= 500 && (averageRating ?? 0) >= 4.7 && (cancellationRate ?? 100) < 5) {
            return BadgeTier.ROAD_MASTER;
        }

        if (totalRides >= 100 && (averageRating ?? 0) >= 4.5) {
            return BadgeTier.STAR_DRIVER;
        }

        if (totalRides >= 50) {
            return BadgeTier.ROOKIE;
        }

        return null;
    }

    /**
     * Update or create driver badge status
     */
    private async updateDriverBadgeStatus(
        driverProfileId: string,
        tier: BadgeTier,
        stats: DriverStats
    ): Promise<void> {
        const existingStatus = await this.prisma.driverBadgeStatus.findUnique({
            where: {
                driverProfileId_badgeTier: {
                    driverProfileId,
                    badgeTier: tier,
                },
            },
        });

        const metricsSnapshot = {
            totalRides: stats.totalRides,
            averageRating: stats.averageRating,
            cancellationRate: stats.cancellationRate,
            updatedAt: new Date().toISOString(),
        };

        if (existingStatus) {
            await this.prisma.driverBadgeStatus.update({
                where: { id: existingStatus.id },
                data: {
                    isActive: true,
                    lastValidatedAt: new Date(),
                    metricsSnapshot,
                },
            });
            this.logger.log(`Updated badge status for driver ${driverProfileId}: ${tier}`);
        } else {
            await this.prisma.driverBadgeStatus.create({
                data: {
                    driverProfileId,
                    badgeTier: tier,
                    isActive: true,
                    earnedAt: new Date(),
                    lastValidatedAt: new Date(),
                    metricsSnapshot,
                },
            });
            this.logger.log(`Awarded new badge tier to driver ${driverProfileId}: ${tier}`);
        }
    }

    /**
     * Get current badge tier for a driver
     */
    async getDriverBadgeTier(driverProfileId: string): Promise<BadgeTier | null> {
        const badgeStatuses = await this.prisma.driverBadgeStatus.findMany({
            where: {
                driverProfileId,
                isActive: true,
            },
            orderBy: { earnedAt: 'desc' },
        });

        if (badgeStatuses.length === 0) {
            return null;
        }

        const tierOrder: BadgeTier[] = [
            BadgeTier.ELITE,
            BadgeTier.ROAD_MASTER,
            BadgeTier.STAR_DRIVER,
            BadgeTier.ROOKIE,
        ];

        for (const tier of tierOrder) {
            const status = badgeStatuses.find(b => b.badgeTier === tier);
            if (status) {
                return tier;
            }
        }

        return null;
    }

    /**
     * Get all badge tiers with status for a driver
     */
    async getDriverAllBadgeTiers(driverProfileId: string) {
        const badgeStatuses = await this.prisma.driverBadgeStatus.findMany({
            where: { driverProfileId },
            orderBy: { earnedAt: 'desc' },
        });

        const tiers = [BadgeTier.ROOKIE, BadgeTier.STAR_DRIVER, BadgeTier.ROAD_MASTER, BadgeTier.ELITE];

        return tiers.map(tier => {
            const status = badgeStatuses.find(b => b.badgeTier === tier);
            return {
                tier,
                isActive: status?.isActive ?? false,
                earnedAt: status?.earnedAt,
                expiresAt: status?.expiresAt,
                metricsSnapshot: status?.metricsSnapshot,
            };
        });
    }

    /**
     * Check if driver has specific privilege
     */
    async driverHasPrivilege(
        driverProfileId: string,
        privilege: 'PRIORITY_DISPATCH' | 'ZONE_SELECTION' | 'COMMISSION_REBATE'
    ): Promise<boolean> {
        const currentTier = await this.getDriverBadgeTier(driverProfileId);

        if (!currentTier) {
            return false;
        }

        switch (privilege) {
            case 'PRIORITY_DISPATCH':
                return currentTier === BadgeTier.ROAD_MASTER || currentTier === BadgeTier.ELITE;
            case 'ZONE_SELECTION':
                return currentTier === BadgeTier.ROAD_MASTER || currentTier === BadgeTier.ELITE;
            case 'COMMISSION_REBATE':
                return currentTier !== null && currentTier !== BadgeTier.ROOKIE;
            default:
                return false;
        }
    }

    /**
     * Get passenger points, current tier, and recent activity ledger
     */
    async getPassengerPoints(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                loyaltyPoints: true,
                totalRidesAsPassenger: true,
                loyaltyTransactions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            } as any,
        });

        if (!user) {
            return {
                points: 0,
                currentTier: 'BRONZE',
                pointsToNextTier: 500,
                recentActivity: [],
            };
        }

        const points = (user as any).loyaltyPoints || 0;
        let currentTier = 'BRONZE';
        let pointsToNextTier = 500 - points;

        if (points >= 5000) {
            currentTier = 'DIAMOND';
            pointsToNextTier = 0;
        } else if (points >= 3000) {
            currentTier = 'PLATINUM';
            pointsToNextTier = 5000 - points;
        } else if (points >= 1500) {
            currentTier = 'GOLD';
            pointsToNextTier = 3000 - points;
        } else if (points >= 500) {
            currentTier = 'SILVER';
            pointsToNextTier = 1500 - points;
        }

        const txs: any[] = (user as any).loyaltyTransactions || [];
        const recentActivity = txs.map((t) => ({
            id: t.id,
            description: t.description,
            points: `${t.points > 0 ? '+' : ''}${t.points} Pts`,
            type: t.type,
            date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Today',
        }));

        return {
            points,
            currentTier,
            pointsToNextTier: Math.max(0, pointsToNextTier),
            recentActivity,
        };
    }

    /**
     * Redeem passenger points for a voucher coupon
     */
    async redeemPassengerPoints(
        userId: string,
        couponId: string,
        cost: number,
        title: string
    ) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { loyaltyPoints: true } as any,
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const currentPoints = (user as any).loyaltyPoints || 0;
        if (currentPoints < cost) {
            throw new BadRequestException('Insufficient points to redeem this reward.');
        }

        const newBalance = currentPoints - cost;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { loyaltyPoints: newBalance } as any,
        });

        try {
            await (this.prisma as any).loyaltyTransaction.create({
                data: {
                    userId,
                    points: -cost,
                    balanceAfter: newBalance,
                    type: 'REDEEMED_COUPON',
                    description: `Redeemed: ${title}`,
                    metadata: { couponId, cost, title },
                },
            });
        } catch (e) {
            this.logger.warn(`Could not log loyalty transaction: ${e}`);
        }

        return {
            success: true,
            remainingPoints: (updatedUser as any).loyaltyPoints,
            couponCode: `CABI-${couponId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            message: `Redeemed "${title}" successfully! Coupon added to wallet.`,
        };
    }

    /**
     * Credit ride points (1 pt per 100 KES spent + rating adjustments)
     */
    async creditRidePoints(
        userId: string,
        fareAmountKes: number,
        rating?: number,
        rideId?: string
    ) {
        const spendPoints = Math.floor(fareAmountKes / 100);
        let ratingPoints = 0;
        if (rating !== undefined && rating !== null) {
            if (rating === 5) ratingPoints = 2;
            else if (rating === 4) ratingPoints = 1;
            else if (rating === 2) ratingPoints = -1;
            else if (rating === 1) ratingPoints = -3;
        }

        const totalEarned = spendPoints + ratingPoints;
        if (totalEarned === 0) return null;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { loyaltyPoints: true } as any,
        });
        if (!user) return null;

        const currentPoints = (user as any).loyaltyPoints || 0;
        const newBalance = Math.max(0, currentPoints + totalEarned);

        await this.prisma.user.update({
            where: { id: userId },
            data: { loyaltyPoints: newBalance } as any,
        });

        try {
            await (this.prisma as any).loyaltyTransaction.create({
                data: {
                    userId,
                    points: totalEarned,
                    balanceAfter: newBalance,
                    type: ratingPoints !== 0 ? 'EARNED_RATING_BONUS' : 'EARNED_RIDE_SPEND',
                    description: `Earned from trip fare KES ${fareAmountKes}${ratingPoints !== 0 ? ` with ${rating}★ rating` : ''}`,
                    metadata: { fareAmountKes, rating, rideId },
                },
            });
        } catch (e) {
            this.logger.warn(`Could not log loyalty transaction: ${e}`);
        }

        return { earnedPoints: totalEarned, newBalance };
    }
}
