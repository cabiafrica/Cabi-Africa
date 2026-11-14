import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { WealthController } from './wealth.controller';
import { WealthService } from './wealth.service';

@Module({
  imports: [PrismaModule],
  controllers: [WealthController],
  providers: [WealthService],
  exports: [WealthService],
})
export class WealthModule {}

