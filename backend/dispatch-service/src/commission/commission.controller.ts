import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CommissionService, TripPayoutInput } from './commission.service';

@Controller('commission')
export class CommissionController {
    constructor(private commissionService: CommissionService) { }

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
    async getDriverPrivileges(@Param('driverProfileId') driverProfileId: string) {
        const privileges = await this.commissionService.getDriverPrivileges(driverProfileId);
        return {
            success: true,
            message: 'Driver privileges retrieved',
            data: privileges,
        };
    }

    @Get('badge-weight/:driverProfileId')
    async getBadgeWeight(@Param('driverProfileId') driverProfileId: string) {
        const weight = await this.commissionService.getBadgeTierWeight(driverProfileId);
        return {
            success: true,
            message: 'Badge weight retrieved',
            data: { weight },
        };
    }

    @Get('history/:driverProfileId')
    async getTransactionHistory(
        @Param('driverProfileId') driverProfileId: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
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
    async getSaccoSummary(@Param('driverProfileId') driverProfileId: string) {
        const summary = await this.commissionService.getSaccoSummary(driverProfileId);
        return {
            success: true,
            message: 'Sacco summary retrieved',
            data: summary,
        };
    }

    @Get('savings/:driverProfileId')
    async getSavingsPreference(@Param('driverProfileId') driverProfileId: string) {
        const preference = await this.commissionService.getOrCreateSavingsPreference(driverProfileId);
        return {
            success: true,
            message: 'Savings preference retrieved',
            data: preference,
        };
    }

    @Put('savings/:driverProfileId')
    async updateSavingsPreference(
        @Param('driverProfileId') driverProfileId: string,
        @Body() data: {
            personalSavingRate?: number;
            isAutoSavingsEnabled?: boolean;
            preferredZoneIds?: string[];
        }
    ) {
        const preference = await this.commissionService.updateSavingsPreference(driverProfileId, data);
        return {
            success: true,
            message: 'Savings preference updated',
            data: preference,
        };
    }
}
