import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class AutomatedPayoutJob {
  private readonly logger = new Logger(AutomatedPayoutJob.name);

  constructor(private readonly paymentService: PaymentService) {}

  // This cron job is set to run every Friday at 5 PM server time.
  // For demonstration, you could change it to CronExpression.EVERY_MINUTE
  @Cron(CronExpression.EVERY_FRIDAY_AT_5PM)
  async handleCron() {
    this.logger.log('Starting automated weekly payout job...');
    try {
      const result = await this.paymentService.processBatchPayouts();
      this.logger.log(`Automated payout job finished. Processed ${result.processedCount} payouts. Failed: ${result.failedCount}.`);
    } catch (error) {
      this.logger.error('Automated payout job failed with an error:', error);
    }
  }
}