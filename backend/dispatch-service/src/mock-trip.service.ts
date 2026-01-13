import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockTripService {
    private logger = new Logger(MockTripService.name);

    startTripSimulation(tripId: string) {
        this.logger.log(`Starting trip simulation for ${tripId}`);
    }

    stopTripSimulation(tripId: string) {
        this.logger.log(`Stopping trip simulation for ${tripId}`);
    }
}
