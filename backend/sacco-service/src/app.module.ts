import { Module } from '@nestjs/common';
import { SaccoController } from './app/sacco.controller';
import { SaccoService } from './app/sacco.service';
import { SaccoIntegrationService } from './app/sacco-integration.service';
import { DriverOrganizationController } from './app/driver-organization.controller';
import { DriverOrganizationService } from './app/driver-organization.service';
import { HealthController } from '@cabi/backend/common';
import { PrismaModule } from '@cabi/backend/database';

@Module({
    imports: [PrismaModule],
    controllers: [SaccoController, DriverOrganizationController, HealthController],
    providers: [SaccoService, SaccoIntegrationService, DriverOrganizationService],
})
export class AppModule {}
