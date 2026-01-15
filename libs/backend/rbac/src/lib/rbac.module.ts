
import { Module, Global } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { PrismaModule } from '@cabi/backend/database';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class RbacModule { }
