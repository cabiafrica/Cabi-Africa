import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentVerificationController } from './controllers/document-verification.controller';
import { BiometricVerificationController } from './controllers/biometric-verification.controller';
import { PassengerVerificationController } from './controllers/passenger-verification.controller';
import { DocumentVerificationService } from './services/document-verification.service';
import { BiometricVerificationService } from './services/biometric-verification.service';
import { AiDocumentVerificationService } from './services/ai-document-verification.service';
import { VerificationNotificationService } from './services/verification-notification.service';
import { OcrService } from './services/ocr.service';
import { VerificationAuditService } from './services/verification-audit.service';

import { PrismaModule } from '@cabi/backend/database';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    DocumentVerificationController,
    BiometricVerificationController,
    PassengerVerificationController,
  ],
  providers: [
    AppService,
    OcrService,
    DocumentVerificationService,
    BiometricVerificationService,
    AiDocumentVerificationService,
    VerificationNotificationService,
    VerificationAuditService,
  ],
})
export class AppModule {}
