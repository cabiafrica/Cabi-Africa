import { Injectable } from '@nestjs/common';

@Injectable()
export class DispatchService {
  // Matches rides to drivers and manages logistics.

  // In-memory queue for simplified matching
  private rideQueue: any[] = [];

  async requestRide(rideRequest: any) {
    console.log('Received ride request:', rideRequest);

    // 1. Validate request
    if (!rideRequest.pickupLocation || !rideRequest.destination) {
      throw new Error('Invalid ride request');
    }

    // 2. Create Ride Record (Mock)
    const rideId = 'ride-' + Date.now();
    const ride = {
      id: rideId,
      ...rideRequest,
      status: 'SEARCHING',
      createdAt: new Date()
    };

    this.rideQueue.push(ride);

    // 3. Initiate Matching (Async)
    this._findDriver(ride);

    return { rideId, status: 'SEARCHING', message: 'Looking for a driver...' };
  }

  // Mock matching logic
  private async _findDriver(ride: any) {
    console.log(`Searching driver for ride ${ride.id}...`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate search delay

    // Assume we found a driver
    ride.status = 'DRIVER_FOUND';
    ride.driverId = 'driver-mock-123';
    ride.driverName = 'John Doe';
    console.log(`Driver found for ride ${ride.id}: ${ride.driverName}`);
  }

  async getRideStatus(rideId: string) {
    const ride = this.rideQueue.find(r => r.id === rideId);
    if (!ride) throw new Error('Ride not found');
    return ride;
  }
}
