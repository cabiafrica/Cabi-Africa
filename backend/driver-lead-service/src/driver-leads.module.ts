import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DriverLeadsController } from './driver-leads.controller';
import { DriverLeadsService } from './driver-leads.service';
import { ReferralController } from './driver-leads/referral.controller';
import { AuthController } from './driver-leads/auth.controller';
import { UserManagementService } from './driver-leads/user-management.service';
import { UserModule } from '@cabi/backend/user-service';
import { ReferralService } from './referral.service';
import { PrismaService } from './prisma.service';
import { NotificationService } from './notification.service';
import { AuthTokenService } from './auth-token.service';
import { EmailProvider } from './email.provider';
import { SmsProvider } from './sms.provider';
import { PushProvider } from './push.provider';

import { UserProfileController } from './user-profile.controller';

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

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: resolveJwtSecret(),
      signOptions: { expiresIn: '60m' },
      global: true,
    }),
    UserModule,
  ],
  controllers: [DriverLeadsController, ReferralController, AuthController, UserProfileController],
  providers: [
    DriverLeadsService,
    ReferralService,
    UserManagementService,
    PrismaService,
    NotificationService,
    AuthTokenService,
    EmailProvider,
    SmsProvider,
    PushProvider,
  ],
})
export class DriverLeadsModule { }
