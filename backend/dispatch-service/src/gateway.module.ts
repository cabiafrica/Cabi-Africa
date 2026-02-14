import { Module, Global } from '@nestjs/common';
import { TripTrackingGateway } from './trip-tracking.gateway';
import { PrismaModule } from '@cabi/backend/database';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [TripTrackingGateway],
    exports: [TripTrackingGateway],
})
export class GatewayModule { }
