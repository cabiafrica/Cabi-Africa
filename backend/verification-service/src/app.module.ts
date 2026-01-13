import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentVerificationController } from './controllers/document-verification.controller';
import { BiometricVerificationController } from './controllers/biometric-verification.controller';
import { DocumentVerificationService } from './services/document-verification.service';
import { BiometricVerificationService } from './services/biometric-verification.service';
import { OcrService } from './services/ocr.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    DocumentVerificationController,
    BiometricVerificationController,
  ],
  providers: [
    AppService,
    OcrService,
    DocumentVerificationService,
    BiometricVerificationService,
  ],
})
export class AppModule { }
