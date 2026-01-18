import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';
import { AdminModule } from '@cabi/backend/admin-service';
import { DispatchModule } from '@cabi/backend/dispatch-service';

@Module({
  imports: [UserModule, AdminModule, DispatchModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
