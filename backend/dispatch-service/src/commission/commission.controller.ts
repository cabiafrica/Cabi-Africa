import { Controller, Get, Post, Put, Body, Param, Query, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { CommissionService, TripPayoutInput } from './commission.service';

@Controller('commission')
export class CommissionController {
    constructor(private commissionService: CommissionService) { }

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

    private assertSelfOrAdmin(req: any, targetDriverProfileId: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const callerId = user.driverProfile?.id || user.driverProfileId || user.id || user.sub;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('FINANCE_') || p.startsWith('DRIVER_') || p === 'SUPER_ADMIN');
        if (callerId !== targetDriverProfileId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to access or modify another driver financial records.');
        }
    }

    @Post('calculate')
    async calculatePayout(@Body() input: TripPayoutInput) {
        const result = await this.commissionService.calculateTripPayout(input);
        return {
            success: true,
            message: 'Trip payout calculated successfully',
            data: result,
        };
    }

    @Get('privileges/:driverProfileId')
    async getDriverPrivileges(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const privileges = await this.commissionService.getDriverPrivileges(driverProfileId);
        return {
            success: true,
            message: 'Driver privileges retrieved',
            data: privileges,
        };
    }

    @Get('badge-weight/:driverProfileId')
    async getBadgeWeight(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const weight = await this.commissionService.getBadgeTierWeight(driverProfileId);
        return {
            success: true,
            message: 'Badge weight retrieved',
            data: { weight },
        };
    }

    @Get('history/:driverProfileId')
    async getTransactionHistory(
        @Req() req: any,
        @Param('driverProfileId') driverProfileId: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const history = await this.commissionService.getTransactionHistory(
            driverProfileId,
            limit ? parseInt(limit, 10) : 50,
            offset ? parseInt(offset, 10) : 0
        );
        return {
            success: true,
            message: 'Transaction history retrieved',
            data: history,
        };
    }

    @Get('sacco-summary/:driverProfileId')
    async getSaccoSummary(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const summary = await this.commissionService.getSaccoSummary(driverProfileId);
        return {
            success: true,
            message: 'Sacco summary retrieved',
            data: summary,
        };
    }

    @Get('savings/:driverProfileId')
    async getSavingsPreference(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const preference = await this.commissionService.getOrCreateSavingsPreference(driverProfileId);
        return {
            success: true,
            message: 'Savings preference retrieved',
            data: preference,
        };
    }

    @Put('savings/:driverProfileId')
    async updateSavingsPreference(
        @Req() req: any,
        @Param('driverProfileId') driverProfileId: string,
        @Body() data: {
            personalSavingRate?: number;
            isAutoSavingsEnabled?: boolean;
            preferredZoneIds?: string[];
        }
    ) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const preference = await this.commissionService.updateSavingsPreference(driverProfileId, data);
        return {
            success: true,
            message: 'Savings preference updated',
            data: preference,
        };
    }
}
