import { Module } from '@nestjs/common';
import { MlmController } from './mlm-service.controller';
import { MlmService } from './mlm-service.service';

@Module({
  controllers: [MlmController],
  providers: [MlmService],
  exports: [MlmService],
})
export class MlmModule {}
