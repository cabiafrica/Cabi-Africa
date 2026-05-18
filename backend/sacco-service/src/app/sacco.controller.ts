import { Controller, Post, Body, Get, Logger, Query, HttpException, Param, Put } from '@nestjs/common';
import { SaccoService, TripPaidEvent, CreateSaccoDto, UpdateSaccoDto } from './sacco.service';

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

    @Post('register')
    async registerSacco(@Body() dto: CreateSaccoDto) {
        try {
            return await this.saccoService.createSacco(dto);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Put('update/:id')
    async updateSacco(@Param('id') id: string, @Body() dto: UpdateSaccoDto) {
        try {
            return await this.saccoService.updateSacco(id, dto);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('join')
    async joinSacco(@Body() body: { driverId: string; saccoId: string }) {
        try {
            return await this.saccoService.joinSacco(body.driverId, body.saccoId);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('leave')
    async leaveSacco(@Body() body: { driverId: string }) {
        try {
            return await this.saccoService.leaveSacco(body.driverId);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Get('list')
    async listSaccos(@Query('search') search?: string) {
        return this.saccoService.getSaccos(search);
    }

    @Get('details/:id')
    async getDetails(@Param('id') id: string) {
        return this.saccoService.getSaccoDetails(id);
    }
}
