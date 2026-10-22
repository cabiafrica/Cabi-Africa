import { Module } from '@nestjs/common';
import { SettingsModule } from '@cabi/backend/settings';
import { PrismaModule } from '@cabi/backend/database';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';

@Module({
  imports: [SettingsModule, PrismaModule],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
