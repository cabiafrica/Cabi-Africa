import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { SafetyService } from './safety.service';
import { SafetyController } from './safety.controller';
import { SosConfigService } from './sos-config.service';
import { SosConfigController } from './sos-config.controller';
import { SOSGateway } from './sos.gateway';
import { SafetySmsService } from './safety-sms.service';

@Module({
  imports: [PrismaModule],
  controllers: [SafetyController, SosConfigController],
  providers: [
    SafetyService,
    SosConfigService,
    SOSGateway,
    SafetySmsService,
  ],
  exports: [
    SafetyService,
    SosConfigService,
    SOSGateway,
    SafetySmsService,
  ],
})
export class SafetyModule {}
