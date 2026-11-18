import { Controller, Post, Body, HttpException, HttpStatus, Get, Query, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ReferralService } from './referral.service';

// Mock DTO
export class CreateManualLedgerEntryDto {
    driverId: string;
    amount: number;
    type: string;
    reason: string;
    adminId: string;
}

@Controller('admin/referral')
export class ReferralController {
    constructor(private readonly referralService: ReferralService) { }

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
            throw new UnauthorizedException('Authentication required for administrative referral operations.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('REFERRAL_') || p.startsWith('FINANCE_') || p === 'SUPER_ADMIN');
        if (!isAdmin) {
            throw new ForbiddenException('Admin referral/finance privileges required.');
        }
    }

    private assertSelfOrAdmin(req: any, targetUserId: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const callerId = user.id || user.sub || user.userId;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('REFERRAL_') || p.startsWith('FINANCE_') || p === 'SUPER_ADMIN');
        if (callerId !== targetUserId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to access another user referral data.');
        }
    }

    @Post('adjust-ledger')
    async adjustLedger(@Req() req: any, @Body() dto: CreateManualLedgerEntryDto) {
        this.assertAdmin(req);
        if (!dto.reason) {
            throw new HttpException('Reason is mandatory for manual adjustments', HttpStatus.BAD_REQUEST);
        }
        await this.referralService.createManualLedgerEntry(
            dto.driverId,
            dto.amount,
            dto.type,
            dto.reason,
            dto.adminId,
        );
        return { message: 'Ledger adjustment processed successfully' };
    }

    @Post('process-registration-fee')
    async processRegistrationFee(@Req() req: any, @Body() body: { driverId: string; fee: number }) {
        this.assertAdmin(req);
        if (!body.driverId || !body.fee) {
            throw new HttpException('Driver ID and Fee are required', HttpStatus.BAD_REQUEST);
        }
        await this.referralService.processRegistrationFee(body.driverId, body.fee);
        return { message: 'Registration fee processed successfully' };
    }

    @Get('ledger')
    async getLedger(
        @Req() req: any,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('driverId') driverId?: string,
        @Query('sourceDriverId') sourceDriverId?: string,
    ) {
        this.assertAdmin(req);
        return this.referralService.getLedgerEntries({
            page: Number(page),
            limit: Number(limit),
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            driverId,
            sourceDriverId,
        });
    }

    @Get('dashboard')
    async getDashboard(@Req() req: any, @Query('range') range?: string) {
        this.assertAdmin(req);
        return this.referralService.getDashboardMetrics(range);
    }

    @Get('my-commissions')
    async getMyCommissions(@Req() req: any, @Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('Driver ID is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverId);
        return this.referralService.getMyCommissions(driverId);
    }

    @Get('config')
    async getConfig(@Req() req: any) {
        this.assertAdmin(req);
        return this.referralService.getConfig();
    }

    @Post('config')
    async updateConfig(@Req() req: any, @Body() config: any) {
        this.assertAdmin(req);
        await this.referralService.updateConfig(config);
        return { message: 'Referral configuration updated successfully' };
    }

    @Post('apply')
    async applyReferralCode(
        @Req() req: any,
        @Body() body: {
            userId: string;
            code: string;
            userType?: string;
            deviceId?: string;
            imeiHash?: string;
        },
    ) {
        if (!body.userId || !body.code) {
            throw new HttpException('User ID and Code Required', 400);
        }
        this.assertSelfOrAdmin(req, body.userId);
        const ipAddress = req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress;
        try {
            const result = await this.referralService.applyReferralCode({
                userId: body.userId,
                code: body.code,
                userType: body.userType,
                deviceId: body.deviceId,
                imeiHash: body.imeiHash,
                ipAddress,
            });
            return { success: true, message: 'Referral code applied successfully', data: result };
        } catch (e: any) {
            const status = e.status || HttpStatus.BAD_REQUEST;
            throw new HttpException(e.message, status);
        }
    }

    @Post('trip-completed')
    async processTripReferral(
        @Req() req: any,
        @Body() body: {
            tripId: string;
            passengerId: string;
            driverProfileId: string;
            baseFare: number;
            platformCommission: number;
            driverEarnings: number;
        },
    ) {
        // Internal service or Admin authorized call
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        return this.referralService.processTripReferral(body);
    }

    @Get('driver/commissions')
    async getDriverCommissions(@Req() req: any, @Query('driverProfileId') driverProfileId: string) {
        if (!driverProfileId) throw new HttpException('driverProfileId is required', 400);
        return this.referralService.getDriverCommissions(driverProfileId);
    }

    @Get('passenger/commissions')
    async getPassengerCommissions(@Req() req: any, @Query('userId') userId: string) {
        if (!userId) throw new HttpException('userId is required', 400);
        this.assertSelfOrAdmin(req, userId);
        return this.referralService.getPassengerCommissions(userId);
    }

    @Get('notifications')
    async getNotificationLogs(@Req() req: any, @Query('userId') userId: string) {
        if (!userId) throw new HttpException('userId is required', 400);
        this.assertSelfOrAdmin(req, userId);
        return this.referralService.getNotificationLogs(userId);
    }

    @Get('fraud-alerts')
    async getFraudAlerts(@Req() req: any) {
        this.assertAdmin(req);
        return this.referralService.getFraudAlerts();
    }

    @Post('fraud-alerts/:id/resolve')
    async resolveFraudAlert(
        @Req() req: any,
        @Body() body: { alertId: string; resolutionAction: 'UNFREEZE' | 'CONFIRM_FRAUD' },
    ) {
        this.assertAdmin(req);
        if (!body.alertId || !body.resolutionAction) {
            throw new HttpException('alertId and resolutionAction are required', 400);
        }
        return this.referralService.resolveFraudAlert(body.alertId, body.resolutionAction);
    }

    @Post('escrow/release')
    async releaseMaturedEscrow(@Req() req: any) {
        this.assertAdmin(req);
        return this.referralService.releaseMaturedEscrow();
    }

    @Get('code')
    async getReferralCode(@Req() req: any, @Query('userId') userId: string) {
        if (!userId) {
            throw new HttpException('User ID is required', 400);
        }
        this.assertSelfOrAdmin(req, userId);
        return this.referralService.getReferralCode(userId);
    }

    @Get('promo-config')
    async getPromoConfig(@Req() req: any) {
        this.assertAdmin(req);
        return this.referralService.getPromoConfig();
    }

    @Post('promo-config')
    async updatePromoConfig(@Req() req: any, @Body() config: any) {
        this.assertAdmin(req);
        await this.referralService.updatePromoConfig(config);
        return { message: 'Promotional configuration updated successfully' };
    }

    @Get('downline')
    async getDownline(@Req() req: any, @Query('userId') userId: string) {
        if (!userId) {
            throw new HttpException('User ID is required', 400);
        }
        this.assertSelfOrAdmin(req, userId);
        return this.referralService.getDownline(userId);
    }
}
