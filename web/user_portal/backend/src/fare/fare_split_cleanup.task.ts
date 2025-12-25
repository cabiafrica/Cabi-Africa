import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from '../payment.service';

@Injectable()
export class FareSplitCleanupTask {
  private readonly logger = new Logger(FareSplitCleanupTask.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running scheduled job to clean up expired fare splits...');
    await this.paymentService.handleExpiredSplits();
  }
}