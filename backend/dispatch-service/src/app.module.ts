import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DispatchModule } from '@cabi/backend/dispatch-service';
import { PrismaModule } from '@cabi/backend/database';
import { UserModule } from '@cabi/backend/user-service';
import { SettingsModule } from '@cabi/backend/settings';
import { RideModule } from './ride/ride.module';
import { MatchingModule } from './matching/matching.module';
import { BadgeModule } from './badge/badge.module';
import { BadgeController } from './badge/badge.controller';
import { AdminBadgeController } from './badge/admin-badge.controller';
import { CommissionModule } from './commission/commission.module';
import { CommissionController } from './commission/commission.controller';
import { SafetyModule } from './safety/safety.module';
import { WelfareModule } from './welfare/welfare.module';
import { HealthController } from './health/health.controller';
import { MockTripService } from './mock-trip.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        RideModule,
        MatchingModule,
        BadgeModule,
        CommissionModule,
        UserModule,
        SafetyModule,
        SettingsModule,
        WelfareModule,
        DispatchModule
    ],
    controllers: [BadgeController, AdminBadgeController, CommissionController, HealthController],
    providers: [MockTripService],
})
export class AppModule { }
