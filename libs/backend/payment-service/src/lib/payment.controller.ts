import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

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
