import { PrismaClient, BadgeCategory, BadgeTier, RewardType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Gamified Sacco System...');

    const rewards = [
        {
            code: 'PRIORITY_DISPATCH',
            name: 'Priority Dispatch',
            description: 'Get priority in the driver matching queue',
            type: RewardType.PRIORITY_DISPATCH,
            value: { enabled: true },
        },
        {
            code: 'ZONE_SELECTION',
            name: 'Zone Selection',
            description: 'Select preferred operating zones',
            type: RewardType.ZONE_SELECTION,
            value: { maxZones: 3 },
        },
        {
            code: 'COMMISSION_REBATE',
            name: 'Commission Rebate',
            description: 'Reduced platform commission',
            type: RewardType.COMMISSION_REBATE,
            value: { percentage: 3 },
        },
        {
            code: 'SACCO_BONUS',
            name: 'Sacco Bonus',
            description: '3% additional Sacco contribution from platform',
            type: RewardType.SACCO_BONUS,
            value: { percentage: 3 },
        },
        {
            code: 'SACCO_MATCH',
            name: 'Sacco Match',
            description: 'Platform matches a percentage of voluntary savings',
            type: RewardType.SACCO_MATCH,
            value: { percentage: 30 },
        },
        {
            code: 'CREDIT_LIMIT_BOOST',
            name: 'Credit Limit Boost',
            description: 'Higher loan limits',
            type: RewardType.CREDIT_LIMIT_BOOST,
            value: { maxLimit: 500000 },
        },
        {
            code: 'LOAN_RATE_REDUCTION',
            name: 'Loan Rate Reduction',
            description: 'Lower interest rates on Sacco loans',
            type: RewardType.LOAN_RATE_REDUCTION,
            value: { reductionPercent: 6 },
        },
    ];

    for (const reward of rewards) {
        await prisma.reward.upsert({
            where: { code: reward.code },
            update: reward,
            create: reward,
        });
    }
    console.log(`✅ Created ${rewards.length} rewards`);

    const gamifiedBadges = [
        {
            code: 'ROOKIE',
            name: 'Rookie',
            description: 'First 50 trips - Grace period badge',
            category: BadgeCategory.ACHIEVEMENT,
            tier: BadgeTier.ROOKIE,
            criteria: { type: 'RIDES_COMPLETED', threshold: 50, minRating: 0 },
        },
        {
            code: 'STAR_DRIVER',
            name: 'Star Driver',
            description: '100+ trips with 4.5+ rating',
            category: BadgeCategory.ACHIEVEMENT,
            tier: BadgeTier.STAR_DRIVER,
            criteria: { type: 'RIDES_COMPLETED', threshold: 100, minRating: 4.5 },
        },
        {
            code: 'ROAD_MASTER',
            name: 'Road Master',
            description: '500+ trips, 4.7+ rating, <5% cancellation',
            category: BadgeCategory.ACHIEVEMENT,
            tier: BadgeTier.ROAD_MASTER,
            criteria: { type: 'RIDES_COMPLETED', threshold: 500, minRating: 4.7, maxCancellationRate: 5 },
        },
        {
            code: 'ELITE',
            name: 'Elite',
            description: 'Top 10% performers - Invitation only',
            category: BadgeCategory.ACHIEVEMENT,
            tier: BadgeTier.ELITE,
            criteria: { type: 'TOP_PERFORMER', threshold: 0.1 },
        },
    ];

    for (const badge of gamifiedBadges) {
        await prisma.badge.upsert({
            where: { code: badge.code },
            update: badge,
            create: badge,
        });
    }
    console.log(`✅ Created ${gamifiedBadges.length} gamified badges`);

    const badgeRewardData = [
        { badgeCode: 'ROOKIE', rewardCode: 'SACCO_BONUS' },
        { badgeCode: 'STAR_DRIVER', rewardCode: 'COMMISSION_REBATE' },
        { badgeCode: 'STAR_DRIVER', rewardCode: 'SACCO_BONUS' },
        { badgeCode: 'STAR_DRIVER', rewardCode: 'SACCO_MATCH' },
        { badgeCode: 'STAR_DRIVER', rewardCode: 'CREDIT_LIMIT_BOOST' },
        { badgeCode: 'STAR_DRIVER', rewardCode: 'LOAN_RATE_REDUCTION' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'PRIORITY_DISPATCH' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'ZONE_SELECTION' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'COMMISSION_REBATE' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'SACCO_BONUS' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'SACCO_MATCH' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'CREDIT_LIMIT_BOOST' },
        { badgeCode: 'ROAD_MASTER', rewardCode: 'LOAN_RATE_REDUCTION' },
        { badgeCode: 'ELITE', rewardCode: 'PRIORITY_DISPATCH' },
        { badgeCode: 'ELITE', rewardCode: 'ZONE_SELECTION' },
        { badgeCode: 'ELITE', rewardCode: 'COMMISSION_REBATE' },
        { badgeCode: 'ELITE', rewardCode: 'SACCO_BONUS' },
        { badgeCode: 'ELITE', rewardCode: 'SACCO_MATCH' },
        { badgeCode: 'ELITE', rewardCode: 'CREDIT_LIMIT_BOOST' },
        { badgeCode: 'ELITE', rewardCode: 'LOAN_RATE_REDUCTION' },
    ];

    for (const mapping of badgeRewardData) {
        const badge = await prisma.badge.findUnique({ where: { code: mapping.badgeCode } });
        const reward = await prisma.reward.findUnique({ where: { code: mapping.rewardCode } });

        if (badge && reward) {
            await prisma.badgeRewardMapping.upsert({
                where: {
                    badgeId_rewardId: {
                        badgeId: badge.id,
                        rewardId: reward.id,
                    },
                },
                update: { isActive: true },
                create: {
                    badgeId: badge.id,
                    rewardId: reward.id,
                    isActive: true,
                },
            });
        }
    }
    console.log(`✅ Created ${badgeRewardData.length} badge-reward mappings`);

    console.log('\n📊 Gamified Sacco System seeded successfully!');
    console.log('\nBadge Tiers:');
    console.log('  ROOKIE      - First 50 trips (3% Sacco bonus)');
    console.log('  STAR_DRIVER - 100+ trips, 4.5+ rating (+commission rebate)');
    console.log('  ROAD_MASTER - 500+ trips, 4.7+ rating (+priority dispatch, zone selection)');
    console.log('  ELITE       - Top 10% (+all benefits)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
