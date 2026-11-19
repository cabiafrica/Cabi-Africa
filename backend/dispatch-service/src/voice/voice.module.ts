import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
