import { Controller, Get, Post, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /**
     * GET /api/payment/wallet
     * Returns wallet for the authenticated user (reads userId from JWT).
     * This is what the mobile passenger app calls as GET /api/wallet (via gateway route).
     */
    @Get('wallet')
    async getMyWallet(@Req() req: any) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new UnauthorizedException('Could not extract user identity from token.');
        }
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
    getWallet(@Param('userId') userId: string) {
        return this.paymentService.getWallet(userId);
    }

    @Post('wallet/:userId/topup')
    topUp(@Param('userId') userId: string, @Body() body: any) {
        return this.paymentService.topUpWallet(userId, body.amount);
    }

    @Post('process')
    processPayment(@Body() body: any) {
        return this.paymentService.processPayment(body.rideId, body.amount, body.method, body.payerId, body.payeeId);
    }

    @Post('tip')
    processTip(@Body() body: any) {
        return this.paymentService.processTip(body.rideId, body.tipAmount, body.passengerId, body.driverId, body.method);
    }
}
