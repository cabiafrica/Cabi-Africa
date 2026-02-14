import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { PrismaModule } from '@cabi/backend/database';
import { MatchingModule } from '../matching/matching.module';
import { BadgeModule } from '../badge/badge.module';

@Module({
  imports: [PrismaModule, MatchingModule, BadgeModule],
  controllers: [RideController],
  providers: [RideService],
  exports: [RideService],
})
export class RideModule { }
