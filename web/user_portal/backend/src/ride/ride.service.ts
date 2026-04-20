import { Injectable, Logger, NotFoundException, Body } from '@nestjs/common';
import { PaymentService } from '@cabi/backend/payment-service';
import { VehicleService } from '@cabi/backend/vehicle-service';
import { UserService } from '@cabi/backend/user-service';
import { NotificationService } from '@cabi/backend/notification-service';

interface PaginationParams {
  page: number;
  limit: number;
}

const WAIT_TIME_GRACE_PERIOD_MINUTES = 2;
const WAIT_TIME_FEE_PER_MINUTE = 0.50;
const LONG_TRIP_THRESHOLD_MINUTES = 45; // As per acceptance criteria

@Injectable()
export class RideService {
  private readonly logger = new Logger(RideService.name);

  // In a real app, these would be properly injected via NestJS DI
  private readonly paymentService = new PaymentService();
  private readonly vehicleService = new VehicleService();
  private readonly userService = new UserService();
  private readonly notificationService = new NotificationService();

  // Mock data store
  private rides: any[] = [];

  // --- NEW LOGIC FOR STORY-39.2 ---

  /**
   * Finds the best driver for a ride, prioritizing those who prefer long trips if applicable.
   * @param rideId The ID of the ride to find a driver for.
   */
  async findBestDriverForRide(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) {
      throw new NotFoundException(`Ride with ID "${rideId}" not found`);
    }

    const isLongTrip = ride.estimatedDuration >= LONG_TRIP_THRESHOLD_MINUTES;
    this.logger.log(`Matching ride ${rideId}. Is long trip: ${isLongTrip}`);

    // Get all available drivers (mocked)
    const availableDrivers = await this.userService.getAvailableDrivers();

    // If it's a long trip, sort drivers by their preference
    if (isLongTrip) {
      this.logger.log('Prioritizing drivers who prefer long trips.');
      // In a real app, this might be a more complex scoring system.
      // Here, we simply sort them to put those who prefer long trips first.
      availableDrivers.sort((a, b) => {
        const prefA = a.preferences.prefersLongTrips ? 1 : 0;
        const prefB = b.preferences.prefersLongTrips ? 1 : 0;
        return prefB - prefA; // Sort descending (true comes first)
      });
    }

    const bestDriver = availableDrivers.length > 0 ? availableDrivers[0] : null;

    if (bestDriver) {
      this.logger.log(`Best driver found for ride ${rideId}: ${bestDriver.id} (Prefers long trips: ${bestDriver.preferences.prefersLongTrips})`);
      // Assign the ride and notify the driver
      this.assignRideToDriver(ride.id, bestDriver.id, isLongTrip);
    } else {
      this.logger.warn(`No available drivers found for ride ${rideId}`);
    }

    return bestDriver;
  }

  /**
   * Assigns a ride to a driver and sends a notification.
   * @param rideId The ID of the ride.
   * @param driverId The ID of the driver.
   * @param isLongTrip Indicates if the ride is a long trip, to be included in the notification.
   */
  assignRideToDriver(rideId: string, driverId: string, isLongTrip: boolean) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) {
      throw new NotFoundException(`Ride with ID "${rideId}" not found`);
    }

    const activeVehicle = this.vehicleService.getActiveVehicleForDriver(driverId);
    if (!activeVehicle) {
      throw new Error(`Cannot assign ride. Driver ${driverId} has no active vehicle.`);
    }

    ride.driverId = driverId;
    ride.vehicleId = activeVehicle.id;
    ride.status = 'assigned';

    this.logger.log(`Assigned ride ${rideId} to driver ${driverId} with active vehicle ${activeVehicle.id} (${activeVehicle.model})`);

    // Notify driver with correct vehicle details and long trip indicator
    this.notificationService.sendNotification({
      userId: driverId,
      title: 'New Ride Request',
      body: `Pickup at ${ride.pickupLocation.address}.`,
      data: {
        rideId: ride.id,
        isLongTrip: isLongTrip, // Include the long trip flag
      }
    });

    return ride;
  }

  // --- EXISTING MOCK LOGIC ---

  async completeRide(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new Error('Ride not found');
    // ... (rest of the method is unchanged)
    return { rideId: ride.id, status: ride.status, message: 'Completed' };
  }

  arriveAtStop(rideId: string, stopIndex: number) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new Error('Ride not found');
    // ... (rest of the method is unchanged)
    return ride;
  }

  departFromStop(rideId: string, stopIndex: number) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new Error('Ride not found');
    // ... (rest of the method is unchanged)
    return ride;
  }

  addStop(rideId: string, newStopAddress: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new NotFoundException(`Ride with ID "${rideId}" not found`);
    // ... (rest of the method is unchanged)
    return { ride, newEstimatedFare: ride.baseFare + 5 };
  }

  respondToChange(rideId: string, response: 'accepted' | 'declined') {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new NotFoundException(`Ride with ID "${rideId}" not found`);
    // ... (rest of the method is unchanged)
    return ride;
  }

  findAndOfferBackToBackRide(driverId: string) {
    this.logger.log(`Checking for back-to-back opportunities for driver ${driverId}`);

    const currentRide = this.rides.find(r => r.driverId === driverId && r.status === 'in_progress');
    if (!currentRide) {
      this.logger.log(`Driver ${driverId} is not on an eligible in-progress ride.`);
      return { success: false, message: 'No active ride found.' };
    }

    const potentialNextRides = this.rides.filter(r => r.status === 'pending_request');

    const nextRide = potentialNextRides.find(r => {
      const latDiff = Math.abs(r.pickupLocation.lat - currentRide.destination.lat);
      const lonDiff = Math.abs(r.pickupLocation.lon - currentRide.destination.lon);
      return latDiff < 0.01 && lonDiff < 0.01;
    });

    if (nextRide) {
      this.logger.log(`Found potential back-to-back ride ${nextRide.id} for driver ${driverId}.`);

      this.notificationService.sendNotification({
        userId: driverId,
        title: 'Next Trip Available!',
        body: `Pickup near your destination: ${nextRide.pickupLocation.address}. Accept now?`,
        data: { type: 'back_to_back_offer', rideId: nextRide.id }
      });

      return { success: true, offeredRideId: nextRide.id };
    }

    this.logger.log(`No suitable back-to-back rides found for driver ${driverId}.`);
    return { success: false, message: 'No nearby rides found.' };
  }

  findForUser(userId: string, params: PaginationParams) {
    this.logger.log(`Fetching ride history for user ${userId}`);

    const userRides = this.rides.filter(r => r.passengerId === userId || r.driverId === userId);

    const paginatedRides = userRides.slice(
      (params.page - 1) * params.limit,
      params.page * params.limit
    );

    return {
      data: paginatedRides,
      total: userRides.length,
      page: params.page,
      limit: params.limit,
    };
  }
}

// --- MOCK DEPENDENCIES FOR DEMONSTRATION ---

@Injectable()
export class PaymentService {
  createCharge(userId: string, amount: number) {
    return Promise.resolve({ success: true, message: 'Charged successfully' });
  }
}

@Injectable()
export class VehicleService {
  getActiveVehicleForDriver(driverId: string) {
    return { id: 'v1', model: 'Toyota Fielder' };
  }
}

@Injectable()
export class NotificationService {
  sendNotification(payload: any) {
    console.log('--- SENDING NOTIFICATION ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--------------------------');
  }
}

@Injectable()
export class UserService {
  private drivers: any[] = [];

  async getAvailableDrivers() {
    // In a real app, this would query for drivers with 'available' status
    return Promise.resolve(this.drivers);
  }
}