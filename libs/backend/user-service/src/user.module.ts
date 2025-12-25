import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from './lib/user.service';

@Module({
  controllers: [AuthController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }