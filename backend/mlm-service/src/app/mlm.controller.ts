import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { MlmService } from './mlm.service';

// Mock DTO
export class CreateManualLedgerEntryDto {
    driverId: string;
    amount: number;
    type: string;
    reason: string;
    adminId: string; // ensuring this is passed from the caller (likely validated by gateway/guard)
}

@Controller('admin/mlm')
export class MlmController {
    constructor(private readonly mlmService: MlmService) { }

    @Post('adjust-ledger')
    async adjustLedger(@Body() dto: CreateManualLedgerEntryDto) {
        if (!dto.reason) {
            throw new HttpException('Reason is mandatory for manual adjustments', HttpStatus.BAD_REQUEST);
        }
        await this.mlmService.createManualLedgerEntry(
            dto.driverId,
            dto.amount,
            dto.type,
            dto.reason,
            dto.adminId,
        );
        return { message: 'Ledger adjustment processed successfully' };
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
        return this.mlmService.getLedgerEntries({
            page: Number(page),
            limit: Number(limit),
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            driverId,
            sourceDriverId,
        });
    }

    @Get('dashboard')
    async getDashboard() {
        return this.mlmService.getDashboardStats();
    }
    @Get('my-commissions')
    async getMyCommissions(@Query('driverId') driverId: string) {
        // In a real scenario, driverId would be extracted from the JWT token in request headers.
        if (!driverId) {
            throw new HttpException('Driver ID is required', HttpStatus.BAD_REQUEST);
        }
        return this.mlmService.getMyCommissions(driverId);
    }
}
