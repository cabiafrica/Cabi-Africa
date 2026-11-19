import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { PricingModule } from '../pricing/pricing.module';
import { SafetyModule } from '../safety/safety.module';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';

@Module({
  imports: [PrismaModule, PricingModule, SafetyModule],
  controllers: [DisputeController],
  providers: [DisputeService],
  exports: [DisputeService],
})
export class DisputeModule {}
