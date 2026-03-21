import { Module } from '@nestjs/common';
import { SaccoController } from './app/sacco.controller';
import { SaccoService } from './app/sacco.service';
import { DriverOrganizationController } from './app/driver-organization.controller';
import { DriverOrganizationService } from './app/driver-organization.service';

@Module({
    imports: [],
    controllers: [SaccoController, DriverOrganizationController],
    providers: [SaccoService, DriverOrganizationService],
})
export class AppModule { }
