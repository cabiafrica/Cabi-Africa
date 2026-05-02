import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';
import { AdminModule } from '@cabi/backend/admin-service';
import { DispatchModule } from '@cabi/backend/dispatch-service';
import { RatingModule } from '@cabi/backend/rating-service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UserModule, AdminModule, DispatchModule, RatingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
