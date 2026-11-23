import { Module } from '@nestjs/common';
import { UserModule } from '@cabi/backend/user-service';
import { AdminModule } from '@cabi/backend/admin-service';
import { DispatchModule } from '@cabi/backend/dispatch-service';
import { RatingModule } from '@cabi/backend/rating-service';
import { SettingsModule } from '@cabi/backend/settings';
import { PaymentModule } from '@cabi/backend/payment-service';
import { SupportModule } from '@cabi/backend/support-service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UserModule, AdminModule, DispatchModule, RatingModule, SettingsModule, PaymentModule, SupportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
