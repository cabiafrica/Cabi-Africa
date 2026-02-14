import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { BadgeService } from './badge.service';

@Controller('badges')
export class BadgeController {
    constructor(private badgeService: BadgeService) { }

    @Get()
    async getAllBadges() {
        return {
            success: true,
            message: 'All badges retrieved',
            data: await this.badgeService.getUserBadges(''),
        };
    }

    @Get('users/:userId')
    async getUserBadges(@Param('userId') userId: string) {
        const badges = await this.badgeService.getUserBadges(userId);
        return {
            success: true,
            message: 'User badges retrieved',
            data: badges,
        };
    }

    @Get('seed')
    async seedBadges() {
        await this.badgeService.seedBadges();
        return {
            success: true,
            message: 'Badge definitions seeded successfully',
        };
    }

    @Get('driver/:driverProfileId/tier')
    async getDriverBadgeTier(@Param('driverProfileId') driverProfileId: string) {
        const tier = await this.badgeService.getDriverBadgeTier(driverProfileId);
        return {
            success: true,
            message: 'Driver badge tier retrieved',
            data: { tier },
        };
    }

    @Get('driver/:driverProfileId/tiers')
    async getDriverAllBadgeTiers(@Param('driverProfileId') driverProfileId: string) {
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
        @Body() context: { trigger: 'RIDE_COMPLETED' | 'RATING_RECEIVED' }
    ) {
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
        @Param('privilege') privilege: 'PRIORITY_DISPATCH' | 'ZONE_SELECTION' | 'COMMISSION_REBATE'
    ) {
        const hasPrivilege = await this.badgeService.driverHasPrivilege(driverProfileId, privilege);
        return {
            success: true,
            message: 'Driver privilege check complete',
            data: { hasPrivilege },
        };
    }
}
