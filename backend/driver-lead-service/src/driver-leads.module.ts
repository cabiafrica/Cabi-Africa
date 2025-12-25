import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DriverLeadsController } from './driver-leads.controller';
import { DriverLeadsService } from './driver-leads.service';
import { AuthController } from './driver-leads/auth.controller';
import { MlmController } from './mlm.controller';
import { PrismaService } from '../prisma.service';
import { NotificationService } from './notification.service';
import { AuthTokenService } from '../auth-token.service';
import { JwtStrategy } from './driver-leads/jwt.strategy';
import { UserModule } from '@cabi/backend/user-service';
import { MlmService } from './mlm.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      // In a production app, this secret should be loaded from a secure configuration service
      // and should be a long, complex, and randomly generated string.
      secret: process.env.JWT_SECRET || 'your-super-secret-key-that-is-long',
      signOptions: { expiresIn: '60m' }, // e.g., tokens expire in 60 minutes
      global: true, // Makes JwtService available globally
    }),
    UserModule,
  ],
  controllers: [DriverLeadsController, MlmController, AuthController],
  providers: [DriverLeadsService, MlmService, PrismaService, NotificationService, AuthTokenService, JwtStrategy],
})
export class DriverLeadsModule { }