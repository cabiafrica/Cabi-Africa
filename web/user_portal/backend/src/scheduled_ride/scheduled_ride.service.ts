import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RideService } from './ride.service';
import { NotificationService } from '@cabi/backend/notification-service';
import { DriverService } from '@cabi/backend/driver-service';

// Mock data model
interface ScheduledRide {
  id: string;
  passengerId: string;
  pickupTime: Date;
  pickupLocation?: any;
  estimatedDuration?: number;
  driverId?: string | null;
  vehicleId?: string | null;
  destination: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  dispatchAttempts?: number;
  reminderSent?: boolean;
}

@Injectable()
export class ScheduledRideService {
  private readonly logger = new Logger(ScheduledRideService.name);
  private readonly DISPATCH_WINDOW_MINUTES = 30;
  private readonly MAX_DISPATCH_ATTEMPTS = 3;
  private readonly REMINDER_WINDOW_MINUTES = 60;

  // Mock database
  private scheduledRides: ScheduledRide[] = [];

  // In a real app, these would be injected via NestJS DI
  constructor(
    private readonly rideService: RideService,
    private readonly notificationService: NotificationService,
    private readonly driverService: DriverService, // To be used for penalties
  ) {}

  private findRideById(rideId: string): ScheduledRide | undefined {
    return this.scheduledRides.find((ride) => ride.id === rideId);
  }

  async findForPassenger(passengerId: string): Promise<ScheduledRide[]> {
    this.logger.log(`Fetching scheduled rides for passenger ${passengerId}`);
    return this.scheduledRides.filter(
      (ride) => ride.passengerId === passengerId && ride.status === 'pending'
    );
  }

  async createScheduledRide(passengerId: string, dto: CreateScheduledRideDto): Promise<ScheduledRide> {
    const now = new Date();
    const pickupTime = new Date(dto.pickupTime);
    const sixtyMinutesFromNow = new Date(now.getTime() + 60 * 60000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

    if (pickupTime < sixtyMinutesFromNow) {
      throw new BadRequestException('Ride must be scheduled at least 60 minutes in advance.');
    }

    if (pickupTime > thirtyDaysFromNow) {
      throw new BadRequestException('Ride cannot be scheduled more than 30 days in advance.');
    }

    const newRide: ScheduledRide = {
      id: 'mock-id', // In a real app, this would be generated
      passengerId,
      pickupTime,
      destination: 'mock-destination', // from dto
      status: 'pending',
      dispatchAttempts: 0,
      reminderSent: false,
    };

    this.scheduledRides.push(newRide);
    this.logger.log(`Created new scheduled ride ${newRide.id} for passenger ${passengerId}.`);
    return newRide;
  }

  async cancelScheduledRide(rideId: string, passengerId: string): Promise<ScheduledRide> {
    const rideIndex = this.scheduledRides.findIndex(
      (ride) => ride.id === rideId && ride.passengerId === passengerId
    );
    if (rideIndex === -1) {
      throw new Error('Scheduled ride not found or user not authorized.');
    }
    this.scheduledRides[rideIndex].status = 'cancelled';
    this.logger.log(`Ride ${rideId} has been cancelled by passenger ${passengerId}.`);
    return this.scheduledRides[rideIndex];
  }

  async cancelRideByDriver(rideId: string, driverId: string): Promise<ScheduledRide> {
    const ride = this.findRideById(rideId);

    if (!ride) {
      throw new NotFoundException('Scheduled ride not found.');
    }

    if (ride.status !== 'confirmed' || ride.driverId !== driverId) {
      throw new UnauthorizedException('Driver is not authorized to cancel this ride.');
    }

    this.logger.log(`Driver ${driverId} is cancelling ride ${rideId}.`);

    // Reset the ride so it can be re-dispatched
    ride.status = 'pending';
    ride.driverId = null;
    ride.vehicleId = null;
    // Note: We do NOT reset dispatchAttempts.

    // Task 2: Apply a penalty to the driver.
    // In a real app, this service would record the cancellation against the driver's record.
    this.driverService.applyCancellationPenalty(driverId);
    this.logger.log(`Cancellation penalty applied to driver ${driverId}.`);

    // Task 3: Notify the passenger.
    this.notificationService.sendNotification({
      userId: ride.passengerId,
      title: 'Your Driver Cancelled',
      body: 'Your driver has cancelled. We are already searching for a new driver for your scheduled ride.',
    });

    this.logger.log(`Ride ${rideId} is now pending again and will be re-dispatched.`);
    return ride;
  }

  async dispatchDueRides(): Promise<void> {
    this.logger.log('Dispatching due scheduled rides...');
    const now = new Date();
    const dispatchWindow = new Date(now.getTime() + this.DISPATCH_WINDOW_MINUTES * 60000);

    const dueRides = this.scheduledRides.filter(
      (ride) =>
        ride.status === 'pending' &&
        ride.pickupTime <= dispatchWindow &&
        ride.pickupTime > now,
    );

    if (dueRides.length === 0) {
      this.logger.log('No scheduled rides are due for dispatch.');
      return;
    }

    this.logger.log(`Found ${dueRides.length} rides to dispatch.`);

    for (const ride of dueRides) {
      this.logger.log(`Attempting to dispatch ride ${ride.id}.`);
      // In a real app, we would use the ride-matching logic.
      // Here we simulate it by calling the findBestDriverForRide method from RideService.
      const driver = await this.rideService.findBestDriverForRide(ride.id);

      if (driver) {
        const rideToUpdate = this.findRideById(ride.id);
        if (rideToUpdate) {
          rideToUpdate.status = 'confirmed'; // 'assigned' in other stories, using 'confirmed' from this service's interface
          rideToUpdate.driverId = driver.id;
          this.logger.log(`Assigned driver ${driver.id} to ride ${ride.id}.`);

          // Notify passenger
          this.notificationService.sendNotification({
            userId: ride.passengerId,
            title: 'Your driver is assigned!',
            body: `Your driver for the ride to ${ride.destination} is on their way.`,
          });

          // Notify driver
          this.notificationService.sendNotification({
            userId: driver.id,
            title: 'New Scheduled Ride',
            body: `You have been assigned a scheduled ride to ${ride.destination}.`,
          });
        }
      } else {
        const rideToUpdate = this.findRideById(ride.id);
        if (rideToUpdate) {
          rideToUpdate.dispatchAttempts = (rideToUpdate.dispatchAttempts || 0) + 1;

          if (rideToUpdate.dispatchAttempts >= this.MAX_DISPATCH_ATTEMPTS) {
            rideToUpdate.status = 'failed';
            this.logger.error(`Ride ${ride.id} failed after ${this.MAX_DISPATCH_ATTEMPTS} dispatch attempts.`);
            // Notify passenger of failure
            this.notificationService.sendNotification({
              userId: ride.passengerId,
              title: 'Unable to Find a Driver',
              body: `We're sorry, but we were unable to find a driver for your scheduled ride to ${ride.destination}.`,
            });
          } else {
            this.logger.warn(`No driver found for ride ${ride.id}. Attempt ${rideToUpdate.dispatchAttempts}/${this.MAX_DISPATCH_ATTEMPTS}. Will retry on next run.`);
          }
        }
      }
    }
  }

  async sendReminderNotifications(): Promise<void> {
    this.logger.log('Checking for scheduled rides that need reminders...');
    const now = new Date();

    // Define a time slice to catch rides that are ~60 minutes away.
    // Since the cron runs every minute, this prevents sending multiple reminders.
    const reminderWindowStart = new Date(now.getTime() + (this.REMINDER_WINDOW_MINUTES - 1) * 60000);
    const reminderWindowEnd = new Date(now.getTime() + this.REMINDER_WINDOW_MINUTES * 60000);

    const ridesToRemind = this.scheduledRides.filter(
      (ride) =>
        ride.status === 'pending' &&
        !ride.reminderSent &&
        ride.pickupTime > reminderWindowStart &&
        ride.pickupTime <= reminderWindowEnd,
    );

    if (ridesToRemind.length === 0) {
      this.logger.log('No reminders to send at this time.');
      return;
    }

    this.logger.log(`Found ${ridesToRemind.length} rides to send reminders for.`);

    for (const ride of ridesToRemind) {
      this.logger.log(`Sending reminder for ride ${ride.id}.`);

      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: 'Upcoming Scheduled Ride',
        body: `Your ride to ${ride.destination} is scheduled in about an hour.`,
      });

      ride.reminderSent = true;
    }
  }
}