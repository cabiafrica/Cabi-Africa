import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';
import { SettingsModule } from '@cabi/backend/settings';
import { ConfigModule } from '@nestjs/config';
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
import { SafetyModule } from './safety/safety.module';
import { HealthController } from './health/health.controller';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, RideModule, MatchingModule, BadgeModule, CommissionModule, GatewayModule, UserModule, SafetyModule, SettingsModule],
    controllers: [DispatchController, BadgeController, AdminBadgeController, CommissionController, HealthController],
    providers: [MockTripService, DispatchService],
})
export class AppModule { }
