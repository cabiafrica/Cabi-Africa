import { Module } from '@nestjs/common';
import { PrismaModule } from '@cabi/backend/database';
import { TripTrackingGateway } from './trip-tracking.gateway';
import { MockTripService } from './mock-trip.service';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { RideModule } from './ride/ride.module';

@Module({
    imports: [PrismaModule, RideModule],
    controllers: [DispatchController],
    providers: [TripTrackingGateway, MockTripService, DispatchService],
})
export class AppModule { }
