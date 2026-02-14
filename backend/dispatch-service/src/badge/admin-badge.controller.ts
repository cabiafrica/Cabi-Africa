import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

@Controller('admin/badges')
export class AdminBadgeController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getAllBadges() {
        const badges = await this.prisma.badge.findMany({
            orderBy: [{ tier: 'asc' }, { category: 'asc' }],
        });
        return { success: true, data: badges };
    }

    @Get('rewards')
    async getAllRewards() {
        const rewards = await this.prisma.reward.findMany({
            orderBy: { type: 'asc' },
        });
        return { success: true, data: rewards };
    }

    @Get('mappings')
    async getAllMappings() {
        const mappings = await this.prisma.badgeRewardMapping.findMany({
            include: {
                badge: true,
                reward: true,
            },
        });
        return { success: true, data: mappings };
    }

    @Post('rewards')
    async createReward(@Body() data: {
        code: string;
        name: string;
        description: string;
        type: string;
        value: any;
    }) {
        const reward = await this.prisma.reward.create({
            data: {
                code: data.code,
                name: data.name,
                description: data.description,
                type: data.type as any,
                value: data.value,
            },
        });
        return { success: true, data: reward };
    }

    @Put('rewards/:id')
    async updateReward(@Param('id') id: string, @Body() data: {
        name?: string;
        description?: string;
        value?: any;
        isActive?: boolean;
    }) {
        const reward = await this.prisma.reward.update({
            where: { id },
            data,
        });
        return { success: true, data: reward };
    }

    @Post('mappings')
    async createMapping(@Body() data: { badgeId: string; rewardId: string }) {
        const mapping = await this.prisma.badgeRewardMapping.create({
            data: {
                badgeId: data.badgeId,
                rewardId: data.rewardId,
                isActive: true,
            },
        });
        return { success: true, data: mapping };
    }

    @Put('mappings/:id')
    async updateMapping(@Param('id') id: string, @Body() data: { isActive?: boolean }) {
        const mapping = await this.prisma.badgeRewardMapping.update({
            where: { id },
            data,
        });
        return { success: true, data: mapping };
    }

    @Delete('mappings/:id')
    async deleteMapping(@Param('id') id: string) {
        await this.prisma.badgeRewardMapping.delete({
            where: { id },
        });
        return { success: true, message: 'Mapping deleted' };
    }

    @Get('driver/:driverProfileId/status')
    async getDriverBadgeStatus(@Param('driverProfileId') driverProfileId: string) {
        const status = await this.prisma.driverBadgeStatus.findMany({
            where: { driverProfileId },
            orderBy: { earnedAt: 'desc' },
        });
        return { success: true, data: status };
    }

    @Post('driver/:driverProfileId/award')
    async awardBadge(
        @Param('driverProfileId') driverProfileId: string,
        @Body() data: { tier: string; expiresAt?: string }
    ) {
        const badgeStatus = await this.prisma.driverBadgeStatus.upsert({
            where: {
                driverProfileId_badgeTier: {
                    driverProfileId,
                    badgeTier: data.tier as any,
                },
            },
            update: {
                isActive: true,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
            create: {
                driverProfileId,
                badgeTier: data.tier as any,
                isActive: true,
                earnedAt: new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });
        return { success: true, data: badgeStatus };
    }

    @Post('driver/:driverProfileId/revoke')
    async revokeBadge(
        @Param('driverProfileId') driverProfileId: string,
        @Body() data: { tier: string }
    ) {
        await this.prisma.driverBadgeStatus.updateMany({
            where: {
                driverProfileId,
                badgeTier: data.tier as any,
            },
            data: { isActive: false },
        });
        return { success: true, message: 'Badge revoked' };
    }

    @Get('stats')
    async getBadgeStats() {
        const [totalBadges, totalRewards, totalMappings, driverStats] = await Promise.all([
            this.prisma.badge.count(),
            this.prisma.reward.count(),
            this.prisma.badgeRewardMapping.count(),
            this.prisma.driverBadgeStatus.groupBy({
                by: ['badgeTier'],
                _count: { badgeTier: true },
            }),
        ]);

        return {
            success: true,
            data: {
                totalBadges,
                totalRewards,
                totalMappings,
                driverStats,
            },
        };
    }
}
