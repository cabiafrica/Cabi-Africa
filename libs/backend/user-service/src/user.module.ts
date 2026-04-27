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

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cabi-secret-2026',
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