import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { RideModule } from '../ride/ride.module';
import { SafetyModule } from '../safety/safety.module';
import { UssdService } from './ussd.service';
import { SmsBookingService } from './sms-booking.service';
import { UssdController } from './ussd.controller';

@Module({
  imports: [PrismaModule, RideModule, SafetyModule],
  controllers: [UssdController],
  providers: [UssdService, SmsBookingService],
  exports: [UssdService, SmsBookingService],
})
export class UssdModule {}
