import { Injectable, Logger } from '@nestjs/common';
import { TripTrackingGateway } from './trip-tracking.gateway';

@Injectable()
export class MockTripService {
  private readonly logger = new Logger(MockTripService.name);
  private activeSimulations = new Map<string, NodeJS.Timeout>();

  constructor(
    // We will inject the gateway to call its broadcast method
    private tripGateway: TripTrackingGateway,
  ) {}

  startTripSimulation(tripId: string) {
    if (this.activeSimulations.has(tripId)) {
      this.logger.log(`Simulation for trip ${tripId} is already running.`);
      return;
    }

    this.logger.log(`Starting simulation for trip ${tripId}...`);

    // Initial mock driver state
    let eta = 15; // minutes
    let lat = -1.286389;
    let lng = 36.817223;

    const interval = setInterval(() => {
      eta = Math.max(0, eta - 1);
      lat += 0.001; // Simulate northward movement
      lng += 0.0005; // Simulate eastward movement

      this.tripGateway.handleLocationUpdate(tripId, { lat, lng, eta });

      if (eta === 0) {
        this.logger.log(`Trip ${tripId} simulation finished.`);
        this.stopTripSimulation(tripId);
      }
    }, 5000); // Update every 5 seconds

    this.activeSimulations.set(tripId, interval);
  }

  stopTripSimulation(tripId: string) {
    const interval = this.activeSimulations.get(tripId);
    if (interval) {
      clearInterval(interval);
      this.activeSimulations.delete(tripId);
      this.logger.log(`Stopped simulation for trip ${tripId}.`);
    }
  }
}