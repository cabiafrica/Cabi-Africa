import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch-service.controller';
import { RideController } from './ride.controller';
import { DispatchService } from './dispatch-service.service';
import { DispatchGateway } from './dispatch-service.gateway';
import { PrismaModule } from '@cabi/backend/database';
import { SettingsModule } from '@cabi/backend/settings';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [DispatchController, RideController],
  providers: [DispatchService, DispatchGateway],
  exports: [DispatchService],
})
export class DispatchModule { }
