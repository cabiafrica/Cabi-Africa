import { Controller, Get, Post, Put, Param, Body, Query, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { BadgeService } from './badge.service';

@Controller('badges')
export class BadgeController {
    constructor(private badgeService: BadgeService) { }

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const internalKey = process.env.INTERNAL_API_KEY;
        const providedKey = req?.headers?.['x-internal-api-key'];
        if (internalKey && providedKey && typeof providedKey === 'string') {
            try {
                const a = Buffer.from(internalKey);
                const b = Buffer.from(providedKey);
                if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                    return { role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
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
        return user;
    }

    private assertAdmin(req: any): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }
        const role = (user.role || '').toUpperCase();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
            (Array.isArray(user.permissions) && (user.permissions.includes('ADMIN') || user.permissions.includes('SUPER_ADMIN') || user.permissions.includes('DISPATCHER')));
        if (!isAdmin) {
            throw new ForbiddenException('Administrative privilege required');
        }
    }

    private assertSelfOrAdmin(req: any, targetUserId?: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }
        const role = (user.role || '').toUpperCase();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
            (Array.isArray(user.permissions) && (user.permissions.includes('ADMIN') || user.permissions.includes('SUPER_ADMIN') || user.permissions.includes('DISPATCHER')));
        if (isAdmin) return;

        const callerId = user.id || user.userId || user.sub;
        if (targetUserId && callerId !== targetUserId) {
            throw new ForbiddenException('Access denied: Cannot act on behalf of another user');
        }
    }

    @Get()
    async getAllBadges() {
        return {
            success: true,
            message: 'All badges retrieved',
            data: await this.badgeService.getUserBadges(''),
        };
    }

    @Get('users/:userId')
    async getUserBadges(@Param('userId') userId: string, @Req() req: any) {
        this.assertSelfOrAdmin(req, userId);
        const badges = await this.badgeService.getUserBadges(userId);
        return {
            success: true,
            message: 'User badges retrieved',
            data: badges,
        };
    }

    @Get('seed')
    async seedBadges(@Req() req: any) {
        this.assertAdmin(req);
        await this.badgeService.seedBadges();
        return {
            success: true,
            message: 'Badge definitions seeded successfully',
        };
    }

    @Get('driver/:driverProfileId/tier')
    async getDriverBadgeTier(@Param('driverProfileId') driverProfileId: string, @Req() req: any) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const tier = await this.badgeService.getDriverBadgeTier(driverProfileId);
        return {
            success: true,
            message: 'Driver badge tier retrieved',
            data: { tier },
        };
    }

    @Get('driver/:driverProfileId/tiers')
    async getDriverAllBadgeTiers(@Param('driverProfileId') driverProfileId: string, @Req() req: any) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const tiers = await this.badgeService.getDriverAllBadgeTiers(driverProfileId);
        return {
            success: true,
            message: 'All driver badge tiers retrieved',
            data: tiers,
        };
    }

    @Post('driver/:driverProfileId/check')
    async checkDriverBadge(
        @Param('driverProfileId') driverProfileId: string,
        @Body() context: { trigger: 'RIDE_COMPLETED' | 'RATING_RECEIVED' },
        @Req() req: any
    ) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const tier = await this.badgeService.checkAndUpdateDriverBadgeTier(driverProfileId);
        return {
            success: true,
            message: 'Driver badge tier checked',
            data: { tier },
        };
    }

    @Get('driver/:driverProfileId/privilege/:privilege')
    async checkDriverPrivilege(
        @Param('driverProfileId') driverProfileId: string,
        @Param('privilege') privilege: 'PRIORITY_DISPATCH' | 'ZONE_SELECTION' | 'COMMISSION_REBATE',
        @Req() req: any
    ) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const hasPrivilege = await this.badgeService.driverHasPrivilege(driverProfileId, privilege);
        return {
            success: true,
            message: 'Driver privilege check complete',
            data: { hasPrivilege },
        };
    }

    @Get('passenger/:userId/points')
    async getPassengerPoints(@Param('userId') userId: string, @Req() req: any) {
        this.assertSelfOrAdmin(req, userId);
        const pointsData = await this.badgeService.getPassengerPoints(userId);
        return {
            success: true,
            message: 'Passenger loyalty points retrieved',
            data: pointsData,
        };
    }

    @Post('passenger/:userId/redeem')
    async redeemPassengerPoints(
        @Param('userId') userId: string,
        @Body() body: { couponId: string; cost: number; title: string },
        @Req() req: any
    ) {
        this.assertSelfOrAdmin(req, userId);
        const result = await this.badgeService.redeemPassengerPoints(
            userId,
            body.couponId,
            body.cost,
            body.title
        );
        return {
            success: true,
            message: result.message,
            data: result,
        };
    }
}

