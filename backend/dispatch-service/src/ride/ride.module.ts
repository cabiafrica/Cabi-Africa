import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { PrismaModule } from '@cabi/backend/database';
import { MatchingModule } from '../matching/matching.module';
import { BadgeModule } from '../badge/badge.module';
import { CommissionModule } from '../commission/commission.module';
import { SettingsModule } from '@cabi/backend/settings';
import { NotificationModule } from '@cabi/backend/notification-service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PrismaModule, MatchingModule, BadgeModule, CommissionModule, SettingsModule, NotificationModule, PricingModule],
  controllers: [RideController],
  providers: [RideService],
  exports: [RideService],
})
export class RideModule { }

