import { Module } from '@nestjs/common';
import { DriverLeadsController } from './driver-leads.controller';
import { DriverLeadsService } from './driver-leads.service';
import { UserManagementService } from './user-management.service';
import { MlmService } from './mlm.service';

@Module({
  imports: [],
  controllers: [DriverLeadsController],
  providers: [DriverLeadsService, UserManagementService, MlmService],
})
export class DriverLeadsModule {}

