import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledRideService } from './scheduled_ride.service';

@Injectable()
export class RideScheduler {
  private readonly logger = new Logger(RideScheduler.name);

  constructor(private readonly scheduledRideService: ScheduledRideService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running scheduled ride tasks (dispatch and reminders)...');
    // We can run these in parallel as they operate on different conditions
    await Promise.all([
      this.scheduledRideService.dispatchDueRides(),
      this.scheduledRideService.sendReminderNotifications(),
    ]);
  }
}