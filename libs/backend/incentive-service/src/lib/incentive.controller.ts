import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Req,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IncentiveService } from './incentive.service';

@Controller('incentives')
export class IncentiveController {
    constructor(private readonly incentiveService: IncentiveService) { }

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const authHeader = req?.headers?.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            const secret =
                process.env.JWT_SECRET ||
                process.env.SUPABASE_JWT_SECRET ||
                (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
            if (secret) {
                try {
                    return jwt.verify(token, secret) as any;
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    private assertAuthenticated(req: any): any {
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        return user;
    }

    private assertAdmin(req: any): void {
        const user = this.assertAuthenticated(req);
        const role = String(user.role || '').toUpperCase();
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Administrator privileges required.');
        }
    }

    private assertSelfOrAdmin(req: any, targetId: string): void {
        const user = this.assertAuthenticated(req);
        const role = String(user.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') return;
        const callerId = String(user.sub || user.id || user.userId || '');
        const callerDriverId = String(user.driverProfile?.id || user.driverProfileId || '');
        if (callerId !== String(targetId) && callerDriverId !== String(targetId)) {
            throw new ForbiddenException('Access denied: Cannot access another user\'s incentive records.');
        }
    }

    // Referral Endpoints
    @Get('referral/code/:userId')
    getReferralCode(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.incentiveService.generateReferralCode(userId);
    }

    @Post('referral')
    createReferral(@Req() req: any, @Body() body: any) {
        const user = this.assertAuthenticated(req);
        const callerId = String(user.sub || user.id || user.userId || '');
        return this.incentiveService.createReferral(callerId, body.refereeEmail, body.code);
    }

    @Post('referral/validate')
    validateReferral(@Req() req: any, @Body() body: any) {
        this.assertAuthenticated(req);
        return this.incentiveService.validateReferralCode(body.code, body.newUserId);
    }

    @Post('referral/:id/complete')
    completeReferral(@Req() req: any, @Param('id') id: string) {
        this.assertAdmin(req);
        return this.incentiveService.completeReferral(id);
    }

    @Get('referral/history/:userId')
    getReferralHistory(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.incentiveService.getReferralHistory(userId);
    }

    // Driver Streak Endpoints
    @Get('streak/:driverId')
    getStreak(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertSelfOrAdmin(req, driverId);
        return this.incentiveService.getStreak(driverId);
    }

    @Post('streak/:driverId/increment')
    incrementStreak(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertAdmin(req);
        return this.incentiveService.incrementStreak(driverId);
    }

    @Post('streak/:driverId/reset')
    resetStreak(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertAdmin(req);
        return this.incentiveService.resetStreak(driverId);
    }

    @Get('streak/:driverId/status')
    getStreakStatus(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertSelfOrAdmin(req, driverId);
        return this.incentiveService.getStreakStatus(driverId);
    }

    // Admin Endpoints
    @Get('rules')
    getAllRules(@Req() req: any) {
        this.assertAuthenticated(req);
        return this.incentiveService.getAllRules();
    }

    @Post('rules')
    createRule(@Req() req: any, @Body() body: any) {
        this.assertAdmin(req);
        return this.incentiveService.createRule(body);
    }

    @Put('rules/:id')
    updateRule(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        this.assertAdmin(req);
        return this.incentiveService.updateRule(id, body);
    }
}
