import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch-service.controller';
import { DispatchService } from './dispatch-service.service';
import { DispatchGateway } from './dispatch-service.gateway';

@Module({
  controllers: [DispatchController],
  providers: [DispatchService, DispatchGateway],
  exports: [DispatchService],
})
export class DispatchModule { }
