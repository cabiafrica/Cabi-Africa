
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PermissionService } from '../services/permission.service';
import { PrismaModule } from '@cabi/backend/database';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be defined in production.');
    }
    return 'dev-only-jwt-secret-do-not-use-in-prod';
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET in production must be at least 32 characters long.');
  }
  return secret;
}

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: resolveJwtSecret(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [PermissionService, JwtAuthGuard],
  exports: [PermissionService, JwtAuthGuard, JwtModule],
})
export class RbacModule { }
