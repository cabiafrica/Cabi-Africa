import { Module } from '@nestjs/common';
import { DriverLeadController } from './driver-lead-service.controller';
import { DriverLeadService } from './driver-lead-service.service';

@Module({
  controllers: [DriverLeadController],
  providers: [DriverLeadService],
  exports: [DriverLeadService],
})
export class DriverLeadModule {}
