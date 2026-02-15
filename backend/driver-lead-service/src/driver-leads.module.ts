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

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-key-that-is-long',
      signOptions: { expiresIn: '60m' },
      global: true,
    }),
    UserModule,
  ],
  controllers: [DriverLeadsController, ReferralController, AuthController],
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
