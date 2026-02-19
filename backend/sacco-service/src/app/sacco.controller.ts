import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { SaccoService, TripPaidEvent } from './sacco.service';

@Controller('sacco')
export class SaccoController {
    private readonly logger = new Logger(SaccoController.name);

    constructor(private readonly saccoService: SaccoService) { }

    @Get('health')
    getHealth() {
        return this.saccoService.getHealth();
    }

    @Post('deduct')
    async triggerDeduction(@Body() event: TripPaidEvent) {
        this.logger.log(`Received manual deduction trigger for trip ${event.tripId}`);
        return await this.saccoService.processDeduction(event);
    }
}
