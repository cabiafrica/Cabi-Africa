import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';
import { AdminModule } from '@cabi/backend/admin-service';

@Module({
  imports: [UserModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
