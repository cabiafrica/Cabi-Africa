
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MlmService } from './mlm.service';
import { NotificationService } from '@cabi/backend/notification-service';

@Injectable()
export class MlmSchedulerService {
    private readonly logger = new Logger(MlmSchedulerService.name);

    constructor(
        private readonly mlmService: MlmService,
        private readonly notificationService: NotificationService
    ) { }

    // Story 103.3: Weekly Email (Every Monday at 8 AM)
    @Cron(CronExpression.EVERY_WEEK) // Defaults to Monday 00:00 usually, but can be specific
    async handleWeeklyCommissionSummary() {
        this.logger.log('Starting weekly commission summary job...');

        // 1. Get stats for last week (Mocking the date window logic for brevity)
        const weeklyStats = await this.mlmService.getWeeklyStatsForEmail();

        // 2. Send Emails
        for (const driverStat of weeklyStats) {
            if (driverStat.amount > 0) {
                try {
                    await this.notificationService.sendWeeklyCommissionSummary(
                        driverStat.email,
                        driverStat.name,
                        driverStat.amount,
                        driverStat.referralCount
                    );
                } catch (error) {
                    this.logger.error(`Failed to send email to ${driverStat.email}`, error);
                }
            }
        }

        this.logger.log(`Completed weekly commission summary job. Processed ${weeklyStats.length} drivers.`);
    }
}
