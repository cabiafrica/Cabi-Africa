import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DriverLeadsController } from './driver-leads.controller';
import { DriverLeadsService } from './driver-leads.service';
import { MlmController } from './driver-leads/mlm.controller';
import { AuthController } from './driver-leads/auth.controller';
import { UserManagementService } from './driver-leads/user-management.service';
import { UserModule } from '@cabi/backend/user-service';
import { MlmService } from './mlm.service';
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
  controllers: [DriverLeadsController, MlmController, AuthController],
  providers: [
    DriverLeadsService,
    MlmService,
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
