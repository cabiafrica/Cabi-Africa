import { Controller, Post, Body, Get, Logger, Query, HttpException } from '@nestjs/common';
import { SaccoService, TripPaidEvent } from './sacco.service';

@Controller('sacco')
export class SaccoController {
    private readonly logger = new Logger(SaccoController.name);

    constructor(private readonly saccoService: SaccoService) { }

    @Get('health')
    getHealth() {
        return this.saccoService.getHealth();
    }

    @Get('balance')
    async getBalance(@Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('driverId is required', 400);
        }
        return this.saccoService.getSavingsBalance(driverId);
    }

    @Get('transactions')
    async getTransactions(@Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('driverId is required', 400);
        }
        return this.saccoService.getTransactions(driverId);
    }

    @Post('deduct')
    async triggerDeduction(@Body() event: TripPaidEvent) {
        this.logger.log(`Received manual deduction trigger for trip ${event.tripId}`);
        return await this.saccoService.processDeduction(event);
    }
}
