import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';
import { PrismaModule } from '@cabi/backend/database';
import { TripTrackingGateway } from './trip-tracking.gateway';
import { GatewayModule } from './gateway.module';
import { MockTripService } from './mock-trip.service';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { RideModule } from './ride/ride.module';
import { MatchingModule } from './matching/matching.module';
import { BadgeModule } from './badge/badge.module';
import { BadgeController } from './badge/badge.controller';
import { AdminBadgeController } from './badge/admin-badge.controller';
import { CommissionModule } from './commission/commission.module';
import { CommissionController } from './commission/commission.controller';

@Module({
    imports: [PrismaModule, RideModule, MatchingModule, BadgeModule, CommissionModule, GatewayModule, UserModule],
    controllers: [DispatchController, BadgeController, AdminBadgeController, CommissionController],
    providers: [MockTripService, DispatchService],
})
export class AppModule { }
