import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch-service.controller';
import { DispatchService } from './dispatch-service.service';

@Module({
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
