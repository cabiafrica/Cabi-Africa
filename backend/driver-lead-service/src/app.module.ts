import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { NotificationService } from './notification.service';
import { AuthTokenService } from './auth-token.service';
import { EmailProvider } from './email.provider';
import { SmsProvider } from './sms.provider';
import { PushProvider } from './push.provider';
import { DocumentModule } from './document/document.module';
import { OrganizationModule } from './organization/organization.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DriverLeadsModule } from './driver-leads.module';
import { JwtStrategy } from './driver-leads/jwt.strategy';
import { HealthController } from '@cabi/backend/common';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DocumentModule,
    OrganizationModule,
    AnalyticsModule,
    DriverLeadsModule,
  ],
  controllers: [HealthController],
  providers: [
    JwtStrategy,
    PrismaService,
    NotificationService,
    AuthTokenService,
    EmailProvider,
    SmsProvider,
    PushProvider,
  ],
})
export class AppModule { }
