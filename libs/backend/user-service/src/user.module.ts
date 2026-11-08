import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { JwtModule } from '@nestjs/jwt';
import { 
  MockSmsProvider, 
  MockPaymentProvider, 
  MockStorageProvider,
  MockEmailProvider
} from '@cabi/backend/common';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be defined in production.');
    }
    return 'dev-only-jwt-secret-do-not-use-in-prod';
  }
  return secret;
}

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: resolveJwtSecret(),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    UserService,
    { provide: 'SmsProvider', useClass: MockSmsProvider },
    { provide: 'PaymentProvider', useClass: MockPaymentProvider },
    { provide: 'StorageProvider', useClass: MockStorageProvider },
    { provide: 'EmailProvider', useClass: MockEmailProvider },
  ],
  exports: [UserService],
})
export class UserModule { }