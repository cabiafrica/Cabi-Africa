import { Controller, Get, Post, Body, Param, Req, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    private getAuthenticatedUserId(req: any): string {
        const userId = req?.user?.sub || req?.user?.id || req?.user?.userId;
        if (!userId) {
            throw new UnauthorizedException('Could not extract user identity from token.');
        }
        return userId;
    }

    private isAdminUser(req: any): boolean {
        const user = req?.user;
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        return perms.some((p) => p.startsWith('FINANCE_') || p === 'SUPER_ADMIN');
    }

    private assertSelfOrAdmin(req: any, targetUserId: string): void {
        const callerId = this.getAuthenticatedUserId(req);
        if (callerId !== targetUserId && !this.isAdminUser(req)) {
            throw new ForbiddenException('You are not authorized to access or modify another user wallet.');
        }
    }

    /**
     * GET /api/payment/wallet
     * Returns wallet for the authenticated user (reads userId from JWT).
     * This is what the mobile passenger app calls as GET /api/wallet (via gateway route).
     */
    @Get('wallet')
    async getMyWallet(@Req() req: any) {
        const userId = this.getAuthenticatedUserId(req);
        const wallet = await this.paymentService.getWallet(userId);
        return {
            balance: (wallet?.balance ?? 0) as number,
            transactions: [],        // future: pull from DB
            payoutMethod: {          // future: pull from DB
                bankName: 'Not set',
                accountNumber: '—',
            },
        };
    }

    @Get('wallet/:userId')
    getWallet(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.paymentService.getWallet(userId);
    }

    @Post('wallet/:userId/topup')
    topUp(@Req() req: any, @Param('userId') userId: string, @Body() body: any) {
        if (!this.isAdminUser(req)) {
            throw new ForbiddenException('Direct wallet top-up requires administrative finance privileges or verified payment settlement.');
        }
        const amount = Number(body?.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new BadRequestException('Top-up amount must be a positive number.');
        }
        return this.paymentService.topUpWallet(userId, amount);
    }

    @Post('process')
    processPayment(@Req() req: any, @Body() body: any) {
        this.assertSelfOrAdmin(req, body?.payerId);
        const amount = Number(body?.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new BadRequestException('Payment amount must be a positive number.');
        }
        return this.paymentService.processPayment(body.rideId, amount, body.method, body.payerId, body.payeeId);
    }

    @Post('tip')
    processTip(@Req() req: any, @Body() body: any) {
        this.assertSelfOrAdmin(req, body?.passengerId);
        const tipAmount = Number(body?.tipAmount);
        if (!Number.isFinite(tipAmount) || tipAmount <= 0) {
            throw new BadRequestException('Tip amount must be a positive number.');
        }
        return this.paymentService.processTip(body.rideId, tipAmount, body.passengerId, body.driverId, body.method);
    }
}
