import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { RbacModule } from '@cabi/backend/rbac';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [PrismaModule, RbacModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService]
})
export class SupportModule {}
