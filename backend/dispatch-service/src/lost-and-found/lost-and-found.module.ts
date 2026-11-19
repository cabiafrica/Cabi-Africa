import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { SafetyModule } from '../safety/safety.module';
import { LostAndFoundService } from './lost-and-found.service';
import { LostAndFoundController } from './lost-and-found.controller';

@Module({
  imports: [PrismaModule, SafetyModule],
  controllers: [LostAndFoundController],
  providers: [LostAndFoundService],
  exports: [LostAndFoundService],
})
export class LostAndFoundModule {}
