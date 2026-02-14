import { Module } from '@nestjs/common';
import { DriverGroupsController } from './driver-groups.controller';
import { DriverGroupsService } from './driver-groups.service';
import { PrismaModule } from '@cabi/database';

@Module({
  imports: [PrismaModule],
  controllers: [DriverGroupsController],
  providers: [DriverGroupsService],
  exports: [DriverGroupsService],
})
export class DriverGroupsModule {}