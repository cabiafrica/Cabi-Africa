import { Controller, Get, Param, Logger } from '@nestjs/common';
import { PayoutService } from './payout.service';

@Controller('admin/payouts') // Assuming admin-only route prefix
export class PayoutController {
  private readonly logger = new Logger(PayoutController.name);
  
  // Mocking constructor injection
  private readonly payoutService: PayoutService = new PayoutService();

  @Get()
  getBatchHistory() {
    return this.payoutService.getBatchHistory();
  }

  @Get(':batchId')
  getBatchDetails(@Param('batchId') batchId: string) {
    return this.payoutService.getBatchDetails(batchId);
  }
}