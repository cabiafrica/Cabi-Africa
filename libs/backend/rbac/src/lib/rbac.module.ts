
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PermissionService } from '../services/permission.service';
import { PrismaModule } from '@cabi/backend/database';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cabi-secret-2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [PermissionService, JwtAuthGuard],
  exports: [PermissionService, JwtAuthGuard, JwtModule],
})
export class RbacModule { }
