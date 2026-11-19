import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { RideModule } from '../ride/ride.module';
import { SafetyModule } from '../safety/safety.module';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';

@Module({
  imports: [PrismaModule, RideModule, SafetyModule],
  controllers: [CorporateController],
  providers: [CorporateService],
  exports: [CorporateService],
})
export class CorporateModule {}
