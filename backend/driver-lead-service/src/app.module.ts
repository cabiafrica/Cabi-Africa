import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserManagementService } from './driver-leads/user-management.service';
import { AuthController } from './driver-leads/auth.controller';
import { AdminSecurityController } from './admin/admin-security.controller';
import { PrismaService } from './prisma.service';
import { NotificationService } from './notification.service';
import { AuthTokenService } from './auth-token.service';
import { EmailProvider } from './notifications/email.provider';
import { SmsProvider } from './notifications/sms.provider';
import { PushProvider } from './notifications/push.provider';
import { TokenCleanupJob } from './jobs/token-cleanup.job';
import { DocumentModule } from './document/document.module';
import { OrganizationModule } from './organization/organization.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { JwtStrategy } from './auth/jwt.strategy'; // Assuming jwt.strategy is in an 'auth' folder
import { AuditModule } from './audit/audit.module'; // Assuming AuditModule is in an 'audit' folder

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-key-that-is-long',
      signOptions: { expiresIn: '60m' },
    }),
    AuditModule,
    DocumentModule,
    OrganizationModule,
    AnalyticsModule,
  ],
  controllers: [AuthController, AdminSecurityController],
  providers: [
    JwtStrategy,
    UserManagementService,
    PrismaService,
    NotificationService,
    AuthTokenService,
    EmailProvider,
    SmsProvider,
    PushProvider,
    TokenCleanupJob,
  ],
})
export class AppModule { }