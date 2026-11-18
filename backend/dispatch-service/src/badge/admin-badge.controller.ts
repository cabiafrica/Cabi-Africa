import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PrismaService } from '@cabi/backend/database';

@Controller('admin/badges')
export class AdminBadgeController {
    constructor(private prisma: PrismaService) { }

    private assertAdmin(req: any): void {
        const internalKey = process.env.INTERNAL_API_KEY;
        const providedKey = req?.headers?.['x-internal-api-key'];
        if (internalKey && providedKey && typeof providedKey === 'string') {
            try {
                const a = Buffer.from(internalKey);
                const b = Buffer.from(providedKey);
                if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                    return;
                }
            } catch {
                // continue
            }
        }
        let user = req?.user;
        if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
            const token = req.headers.authorization.substring(7);
            const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
            if (secret) {
                try {
                    user = jwt.verify(token, secret) as any;
                } catch {
                    user = null;
                }
            }
        }
        if (!user) {
            throw new UnauthorizedException('Authentication required for administrative badge operations.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('SYSTEM_SETTINGS_') || p.startsWith('DRIVER_') || p === 'SUPER_ADMIN');
        if (!isAdmin) {
            throw new ForbiddenException('Admin badge privileges required.');
        }
    }

    @Get()
    async getAllBadges(@Req() req: any) {
        this.assertAdmin(req);
        const badges = await this.prisma.badge.findMany({
            orderBy: [{ tier: 'asc' }, { category: 'asc' }],
        });
        return { success: true, data: badges };
    }

    @Get('rewards')
    async getAllRewards(@Req() req: any) {
        this.assertAdmin(req);
        const rewards = await this.prisma.reward.findMany({
            orderBy: { type: 'asc' },
        });
        return { success: true, data: rewards };
    }

    @Get('mappings')
    async getAllMappings(@Req() req: any) {
        this.assertAdmin(req);
        const mappings = await this.prisma.badgeRewardMapping.findMany({
            include: {
                badge: true,
                reward: true,
            },
        });
        return { success: true, data: mappings };
    }

    @Post('rewards')
    async createReward(@Req() req: any, @Body() data: {
        code: string;
        name: string;
        description: string;
        type: string;
        value: any;
    }) {
        this.assertAdmin(req);
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
    async updateReward(@Req() req: any, @Param('id') id: string, @Body() data: {
        name?: string;
        description?: string;
        value?: any;
        isActive?: boolean;
    }) {
        this.assertAdmin(req);
        const reward = await this.prisma.reward.update({
            where: { id },
            data,
        });
        return { success: true, data: reward };
    }

    @Post('mappings')
    async createMapping(@Req() req: any, @Body() data: { badgeId: string; rewardId: string }) {
        this.assertAdmin(req);
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
    async updateMapping(@Req() req: any, @Param('id') id: string, @Body() data: { isActive?: boolean }) {
        this.assertAdmin(req);
        const mapping = await this.prisma.badgeRewardMapping.update({
            where: { id },
            data,
        });
        return { success: true, data: mapping };
    }

    @Delete('mappings/:id')
    async deleteMapping(@Req() req: any, @Param('id') id: string) {
        this.assertAdmin(req);
        await this.prisma.badgeRewardMapping.delete({
            where: { id },
        });
        return { success: true, message: 'Mapping deleted' };
    }

    @Get('driver/:driverProfileId/status')
    async getDriverBadgeStatus(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertAdmin(req);
        const status = await this.prisma.driverBadgeStatus.findMany({
            where: { driverProfileId },
            orderBy: { earnedAt: 'desc' },
        });
        return { success: true, data: status };
    }

    @Post('driver/:driverProfileId/award')
    async awardBadge(
        @Req() req: any,
        @Param('driverProfileId') driverProfileId: string,
        @Body() data: { tier: string; expiresAt?: string }
    ) {
        this.assertAdmin(req);
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
        @Req() req: any,
        @Param('driverProfileId') driverProfileId: string,
        @Body() data: { tier: string }
    ) {
        this.assertAdmin(req);
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
    async getBadgeStats(@Req() req: any) {
        this.assertAdmin(req);
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
