import { Controller, Post, Body, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
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

    @Post('adjust-ledger')
    async adjustLedger(@Body() dto: CreateManualLedgerEntryDto) {
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
    async processRegistrationFee(@Body() body: { driverId: string; fee: number }) {
        if (!body.driverId || !body.fee) {
            throw new HttpException('Driver ID and Fee are required', HttpStatus.BAD_REQUEST);
        }
        await this.referralService.processRegistrationFee(body.driverId, body.fee);
        return { message: 'Registration fee processed successfully' };
    }

    @Get('ledger')
    async getLedger(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('driverId') driverId?: string,
        @Query('sourceDriverId') sourceDriverId?: string,
    ) {
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
    async getDashboard(@Query('range') range?: string) {
        return this.referralService.getDashboardMetrics(range);
    }

    @Get('my-commissions')
    async getMyCommissions(@Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('Driver ID is required', HttpStatus.BAD_REQUEST);
        }
        return this.referralService.getMyCommissions(driverId);
    }

    @Get('config')
    async getConfig() {
        return this.referralService.getConfig();
    }

    @Post('config')
    async updateConfig(@Body() config: any) {
        await this.referralService.updateConfig(config);
        return { message: 'Referral configuration updated successfully' };
    }

    @Get('promo-config')
    async getPromoConfig() {
        return this.referralService.getPromoConfig();
    }

    @Post('promo-config')
    async updatePromoConfig(@Body() config: any) {
        await this.referralService.updatePromoConfig(config);
        return { message: 'Promotional configuration updated successfully' };
    }
}
