import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduledRideController } from './scheduled_ride.controller';
import { ScheduledRideService } from './scheduled_ride.service';
import { RideScheduler } from './ride.scheduler';
import { RideService } from './ride.service';
import { NotificationService } from '@cabi/backend/notification-service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ScheduledRideController],
  // We add RideService and NotificationService so they can be injected
  // into ScheduledRideService.
  providers: [ScheduledRideService, RideScheduler, RideService, NotificationService],
})
export class RideModule {}