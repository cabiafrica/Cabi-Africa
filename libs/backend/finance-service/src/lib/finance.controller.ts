import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Get('drivers/:driverId/summary')
    getSummary(@Param('driverId') driverId: string) {
        return this.financeService.getFinanceSummary(driverId);
    }

    @Post('drivers/:driverId/goal')
    setGoal(@Param('driverId') driverId: string, @Body() body: any) {
        return this.financeService.setEarningsGoal(driverId, body.amount, body.period);
    }

    @Post('drivers/:driverId/cashout')
    cashOut(@Param('driverId') driverId: string) {
        return this.financeService.cashOut(driverId);
    }
}
