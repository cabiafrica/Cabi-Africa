import { Module } from '@nestjs/common';
import { ReferralController } from './app/referral.controller';
import { ReferralService } from './app/referral.service';
import { DriverGroupsModule } from './app/driver-groups/driver-groups.module';
import { PrismaModule } from '@cabi/backend/database';
import { HealthController } from '@cabi/backend/common';

@Module({
    imports: [
        DriverGroupsModule,
        PrismaModule,
    ],
    controllers: [ReferralController, HealthController],
    providers: [ReferralService],
})
export class AppModule { }
