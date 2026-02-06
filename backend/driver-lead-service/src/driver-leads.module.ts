import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DriverLeadsController } from './driver-leads.controller';
import { DriverLeadsService } from './driver-leads.service';
import { MlmController } from './driver-leads/mlm.controller';
import { UserModule } from '@cabi/backend/user-service';
import { MlmService } from './mlm.service';

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
  controllers: [DriverLeadsController, MlmController],
  providers: [DriverLeadsService, MlmService],
})
export class DriverLeadsModule { }