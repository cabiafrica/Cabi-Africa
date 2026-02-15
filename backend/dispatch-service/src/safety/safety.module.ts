import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { SafetyService } from './safety.service';
import { SafetyController } from './safety.controller';
import { SosConfigService } from './sos-config.service';
import { SosConfigController } from './sos-config.controller';

@Module({
    imports: [PrismaModule],
    controllers: [SafetyController, SosConfigController],
    providers: [SafetyService, SosConfigService],
    exports: [SafetyService, SosConfigService],
})
export class SafetyModule { }
