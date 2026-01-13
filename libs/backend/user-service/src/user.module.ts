import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }