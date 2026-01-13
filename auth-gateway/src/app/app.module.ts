import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
