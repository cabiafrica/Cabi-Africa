import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { IncentiveService } from './incentive.service';

@Controller('incentives')
export class IncentiveController {
    constructor(private readonly incentiveService: IncentiveService) { }

    // Referral Endpoints
    @Get('referral/code/:userId')
    getReferralCode(@Param('userId') userId: string) {
        return this.incentiveService.generateReferralCode(userId);
    }

    @Post('referral')
    createReferral(@Body() body: any) {
        return this.incentiveService.createReferral(body.referrerId, body.refereeEmail, body.code);
    }

    @Post('referral/validate')
    validateReferral(@Body() body: any) {
        return this.incentiveService.validateReferralCode(body.code, body.newUserId);
    }

    @Post('referral/:id/complete')
    completeReferral(@Param('id') id: string) {
        return this.incentiveService.completeReferral(id);
    }

    @Get('referral/history/:userId')
    getReferralHistory(@Param('userId') userId: string) {
        return this.incentiveService.getReferralHistory(userId);
    }

    // Driver Streak Endpoints
    @Get('streak/:driverId')
    getStreak(@Param('driverId') driverId: string) {
        return this.incentiveService.getStreak(driverId);
    }

    @Post('streak/:driverId/increment')
    incrementStreak(@Param('driverId') driverId: string) {
        return this.incentiveService.incrementStreak(driverId);
    }

    @Post('streak/:driverId/reset')
    resetStreak(@Param('driverId') driverId: string) {
        return this.incentiveService.resetStreak(driverId);
    }

    @Get('streak/:driverId/status')
    getStreakStatus(@Param('driverId') driverId: string) {
        return this.incentiveService.getStreakStatus(driverId);
    }

    // Admin Endpoints
    @Get('rules')
    getAllRules() {
        return this.incentiveService.getAllRules();
    }

    @Post('rules')
    createRule(@Body() body: any) {
        return this.incentiveService.createRule(body);
    }

    @Put('rules/:id')
    updateRule(@Param('id') id: string, @Body() body: any) {
        return this.incentiveService.updateRule(id, body);
    }
}
