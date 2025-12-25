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
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuditModule,
  ],
  controllers: [AuthController, AdminSecurityController],
  providers: [
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
export class AppModule {}