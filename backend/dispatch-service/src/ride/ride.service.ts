import { Injectable, Logger, NotFoundException, Body } from '@nestjs/common';
import { PaymentService } from '@cabi/backend/payment-service'; // Assuming this path is resolvable
import { VehicleService } from '@cabi/backend/vehicle-service'; // Assuming this path is resolvable
import { UserService } from '@cabi/backend/user-service';
import { NotificationService } from '@cabi/backend/notification-service';

interface PaginationParams {
  page: number;
  limit: number;
}

const WAIT_TIME_GRACE_PERIOD_MINUTES = 2;
const WAIT_TIME_FEE_PER_MINUTE = 0.50;

@Injectable()
export class RideService {
  private readonly logger = new Logger(RideService.name);

  // In a real app, these would be properly injected via NestJS DI
  private readonly paymentService = new PaymentService();
  private readonly vehicleService = new VehicleService();
  private readonly userService = new UserService();
  private readonly notificationService = new NotificationService();

  // Mock data store
  private rides = [
    {
      id: 'ride-in-progress-1',
      status: 'in_progress',
      driverId: 'driver-abc',
      passengerId: 'user-abc', // Added for clarity
      vehicleId: 'v1',
      destination: { address: 'Westside Mall, Nairobi', lat: -1.258, lon: 36.802 },
      baseFare: 15.75,
      totalWaitTimeFee: 0,
      userId: 'user-abc',
      shareToken: null,
      shareTokenExpiry: null,
      pendingChange: null,
      stops: [
        { address: 'Stop 1', status: 'pending', arrivalTime: null },
      ],
    },
    {
      id: 'ride-request-1',
      status: 'pending_request', // A new ride waiting for a driver
      driverId: null,
      passengerId: 'user-xyz', // Added for clarity
      vehicleId: null,
      pickupLocation: { address: 'Sarit Centre, Nairobi', lat: -1.255, lon: 36.804 }, // Near the destination of the in-progress ride
      destination: { address: 'Yaya Centre, Nairobi', lat: -1.295, lon: 36.786 },
      baseFare: 12.00,
      totalWaitTimeFee: 0,
      userId: 'user-xyz',
      shareToken: null,
      shareTokenExpiry: null,
      pendingChange: null,
      stops: [],
    },
    {
      id: 'ride-completed-1',
      status: 'completed_and_paid',
      driverId: 'driver-abc',
      passengerId: 'user-abc',
      vehicleId: 'v1',
      destination: { address: 'Home', lat: -1.3, lon: 36.8 },
      baseFare: 22.50,
      totalWaitTimeFee: 0,
      userId: 'user-abc',
      shareToken: null,
      shareTokenExpiry: null,
      pendingChange: null,
      stops: [],
    },
  ];

  async completeRide(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    const finalFare = ride.baseFare + ride.totalWaitTimeFee;
    this.logger.log(`Completing ride ${rideId}. Base: ${ride.baseFare}, Wait Fee: ${ride.totalWaitTimeFee}, Final: ${finalFare}`);
    ride.status = 'completed';

    // Expire the share token shortly after completion to protect privacy
    if (ride.shareToken) {
      ride.shareTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes
    }

    // Trigger payment processing
    const chargeResult = await this.paymentService.createCharge(ride.userId, finalFare);

    if (chargeResult.success) {
      ride.status = 'completed_and_paid';
      this.logger.log(`Ride ${rideId} status updated to: ${ride.status}`);
      this.notificationService.sendNotification({
        userId: ride.userId,
        title: 'Payment Successful',
        body: `Your ride has been paid. Amount: $${finalFare.toFixed(2)}. Thank you!`,
      });
    } else {
      ride.status = 'payment_failed';
      this.logger.error(`Ride ${rideId} status updated to: ${ride.status}`);
      this.notificationService.sendNotification({
        userId: ride.userId,
        title: 'Payment Failed',
        body: `We were unable to process the payment for your ride. Please update your payment method.`,
      });
    }

    return {
      rideId: ride.id,
      status: ride.status,
      message: chargeResult.message,
    };
  }

  arriveAtStop(rideId: string, stopIndex: number) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new Error('Ride not found');
    if (!ride.stops[stopIndex]) throw new Error('Stop not found');

    const stop = ride.stops[stopIndex];
    stop.status = 'arrived';
    stop.arrivalTime = new Date();
    this.logger.log(`Driver arrived at stop ${stopIndex} for ride ${rideId} at ${stop.arrivalTime.toISOString()}`);

    // In a real app, this would also notify the passenger app.
    return ride;
  }

  departFromStop(rideId: string, stopIndex: number) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) throw new Error('Ride not found');
    if (!ride.stops[stopIndex] || !ride.stops[stopIndex].arrivalTime) throw new Error('Invalid stop state');

    const stop = ride.stops[stopIndex];
    const waitTimeMinutes = (new Date().getTime() - stop.arrivalTime.getTime()) / 60000;
    const billableWaitTime = Math.max(0, waitTimeMinutes - WAIT_TIME_GRACE_PERIOD_MINUTES);

    if (billableWaitTime > 0) {
      const waitFee = billableWaitTime * WAIT_TIME_FEE_PER_MINUTE;
      ride.totalWaitTimeFee += waitFee;
      this.logger.log(`Waited ${waitTimeMinutes.toFixed(2)} mins at stop ${stopIndex}. Adding fee of ${waitFee.toFixed(2)} for ride ${rideId}.`);
    }

    stop.status = 'departed';
    return ride;
  }

  addStop(rideId: string, newStopAddress: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) {
      throw new NotFoundException(`Ride with ID "${rideId}" not found`);
    }
    if (ride.status !== 'in_progress') {
      throw new Error('Cannot add a stop to a ride that is not in progress.');
    }

    // 1. Recalculate the estimated fare (simulation)
    const fareIncrease = 5.00; // Mock fare increase for the new stop
    const newEstimatedFare = ride.baseFare + ride.totalWaitTimeFee + fareIncrease;

    // 2. Create a pending change request instead of applying it directly
    ride.pendingChange = {
      newStop: { address: newStopAddress, status: 'pending', arrivalTime: null },
      newEstimatedFare: newEstimatedFare,
      fareIncrease: fareIncrease,
    };

    this.logger.log(`Passenger requested to add a stop to ride ${rideId}. Awaiting driver confirmation.`);

    // 3. Notify driver of the proposed change
    this.notificationService.sendNotification({
      userId: ride.driverId,
      title: 'Trip Update Requested',
      body: `Your passenger wants to add a stop at ${newStopAddress}. The new fare will be ~$${newEstimatedFare.toFixed(2)}.`,
      // data: { type: 'trip_change_request', rideId: ride.id }
    });

    return { ride, newEstimatedFare };
  }

  respondToChange(rideId: string, response: 'accepted' | 'declined') {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) {
      throw new NotFoundException(`Ride with ID "${rideId}" not found`);
    }
    if (!ride.pendingChange) {
      throw new Error('No pending change found for this ride.');
    }

    const { newStop, fareIncrease } = ride.pendingChange;

    if (response === 'accepted') {
      this.logger.log(`Driver for ride ${rideId} ACCEPTED the trip change.`);
      // Apply the change
      ride.stops.push(newStop);
      ride.baseFare += fareIncrease;

      // Notify passenger
      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: 'Trip Updated',
        body: 'Your driver has accepted the new stop. Your itinerary has been updated.',
      });
    } else { // 'declined'
      this.logger.log(`Driver for ride ${rideId} DECLINED the trip change.`);
      // Notify passenger
      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: 'Trip Update Declined',
        body: 'Your driver was unable to accommodate the requested change. Your original trip continues.',
      });
    }

    // Clear the pending change regardless of the response
    ride.pendingChange = null;

    return ride;
  }
  
  // This method simulates the core logic for finding a back-to-back trip.
  // In a real system, this would be part of a larger ride-matching algorithm.
  findAndOfferBackToBackRide(driverId: string) {
    this.logger.log(`Checking for back-to-back opportunities for driver ${driverId}`);

    const currentRide = this.rides.find(r => r.driverId === driverId && r.status === 'in_progress');
    if (!currentRide) {
      this.logger.log(`Driver ${driverId} is not on an eligible in-progress ride.`);
      return { success: false, message: 'No active ride found.' };
    }

    // Find pending ride requests
    const potentialNextRides = this.rides.filter(r => r.status === 'pending_request');

    // Find a ride with a pickup location near the current ride's destination (simplified distance check)
    const nextRide = potentialNextRides.find(r => {
      const latDiff = Math.abs(r.pickupLocation.lat - currentRide.destination.lat);
      const lonDiff = Math.abs(r.pickupLocation.lon - currentRide.destination.lon);
      return latDiff < 0.01 && lonDiff < 0.01; // Simple proximity check
    });

    if (nextRide) {
      this.logger.log(`Found potential back-to-back ride ${nextRide.id} for driver ${driverId}.`);

      // Send a special notification to the driver with the offer
      this.notificationService.sendNotification({
        userId: driverId,
        title: 'Next Trip Available!',
        body: `Pickup near your destination: ${nextRide.pickupLocation.address}. Accept now?`,
        // In a real app, you'd include payload data for the driver app to handle the UI
        // data: { type: 'back_to_back_offer', rideId: nextRide.id }
      });

      return { success: true, offeredRideId: nextRide.id };
    }

    this.logger.log(`No suitable back-to-back rides found for driver ${driverId}.`);
    return { success: false, message: 'No nearby rides found.' };
  }

  // This method simulates assigning a ride and fetching the active vehicle.
  assignRideToDriver(rideId: string, driverId: string) {
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

    // Notify passenger with correct vehicle details
    return ride;
  }

  findForUser(userId: string, params: PaginationParams) {
    this.logger.log(`Fetching ride history for user ${userId}`);

    // Find rides where the user was either the passenger or the driver
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