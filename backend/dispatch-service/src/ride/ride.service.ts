import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
// import { PaymentService } from '@cabi/backend/payment-service'; 
// import { VehicleService } from '@cabi/backend/vehicle-service'; 
// import { UserService } from '@cabi/backend/user-service';
// import { NotificationService } from '@cabi/backend/notification-service';

// Mock Services for external dependencies (Payment, Vehicle, Notification)
class PaymentService { async createCharge(uid: string, amount: number) { return { success: true, message: 'Mock charge' }; } }
class VehicleService { getActiveVehicleForDriver(id: string): any { return { id: 'v1', model: 'Corolla' }; } }
class UserService { }
class NotificationService { sendNotification(payload: any) { } }

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

  constructor(private prisma: PrismaService) { }

  async createRide(passengerId: string, pickup: any, dropoff: any) {
    return this.prisma.ride.create({
      data: {
        passengerId,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        status: 'REQUESTED',
        fare: 0, // Initial fare, will be calculated later?
        distance: 0,
        duration: 0
      }
    });
  }

  async getCurrentRide(userId: string, role: string) {
    return this.prisma.ride.findFirst({
      where: {
        OR: [
          role === 'DRIVER' ? { driverId: userId } : { passengerId: userId }
        ],
        status: {
          in: ['REQUESTED', 'MATCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS']
        }
      },
      include: {
        passenger: true,
        driver: {
          include: {
            user: true,
            vehicle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async acceptRide(rideId: string, driverId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    // Check if ride is available
    if (ride.status !== 'REQUESTED') {
      throw new Error('Ride is not available');
    }

    // Assign driver
    // Fetch driver vehicle? 
    // For now assuming driver exists and has vehicle (mock vehicle service)
    const vehicle = this.vehicleService.getActiveVehicleForDriver(driverId);

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: driverId,
        status: 'DRIVER_ASSIGNED',
        // vehicleId? Schema doesn't have vehicleId explicitly on Ride? 
        // Ah, schema has `driverId` relation to `DriverProfile`. 
        // `DriverProfile` has `vehicle`.
        // The schema shows `driver DriverProfile? @relation...`
        // So we just set driverId.
      },
      include: { passenger: true, driver: true }
    });

    // Notify passenger
    this.notificationService.sendNotification({
      userId: updatedRide.passengerId,
      title: 'Driver Found!',
      body: `Your driver is on the way.`
    });

    return updatedRide;
  }

  async rejectRide(rideId: string, driverId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    if (ride.driverId !== driverId) {
      // If driver is not assigned, maybe they are just rejecting the offer?
      // In that case, we don't need to do anything if they aren't assigned.
      // But if they are assigned, we unassign.
      // If we are implementing a 'pool', rejecting might mean 'don't show me this again'.
      // For now, assume unassign logic.
      throw new Error('Driver is not assigned to this ride');
    }

    // Unassign driver and return to REQUESTED
    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: null,
        status: 'REQUESTED'
      }
    });

    this.logger.log(`Ride ${rideId} rejected by driver ${driverId}. Returned to pool.`);
    return updatedRide;
  }

  async startRide(rideId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: { status: 'IN_PROGRESS' }
    });

    // Notify passenger
    this.notificationService.sendNotification({
      userId: ride.passengerId,
      title: 'Ride Started',
      body: `You are on your way to destination.`
    });

    return updatedRide;
  }

  async completeRide(rideId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Calculate final fare (Simplified)
    // In real app, we check actual distance/time from GPS logs
    // Using mock base fare + wait time
    const baseFare = Number(ride.fare) || 350.0;
    // We would need to store `totalWaitTimeFee` somewhere. 
    // The previous mock had it on the object. The schema has `fare` but maybe we need more fields.
    // I'll assume `fare` is the total.

    // Trigger payment processing
    const finalFare = baseFare; // simplify for now

    const chargeResult = await this.paymentService.createCharge(ride.passengerId, finalFare);

    let status: 'COMPLETED' | 'CANCELLED' = 'COMPLETED'; // using Enum strings from schema but simplistic
    // Schema Enum: REQUESTED, MATCHING, DRIVER_ASSIGNED, DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED

    if (chargeResult.success) {
      this.logger.log(`Ride ${rideId} completed and paid.`);
      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: 'Payment Successful',
        body: `Amount: ${finalFare}. Thank you!`,
      });
    } else {
      this.logger.error(`Ride ${rideId} payment failed.`);
      // Maybe keep it COMPLETED but mark as unpaid? Schema doesn't have 'PAYMENT_FAILED'.
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'COMPLETED',
        fare: finalFare
      }
    });

    return updatedRide;
  }

  async confirmCashPayment(rideId: string, amount: number) {
    // In real app, verify amount matches fare
    // For now, just ensure it's completed
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'COMPLETED',
        fare: amount
      }
    });

    this.logger.log(`Cash payment confirmed for ride ${rideId}. Amount: ${amount}`);
    return updatedRide;
  }

  async ratePassenger(rideId: string, rating: number, comment?: string) {
    // TODO: Schema update for Rating/Review
    this.logger.log(`Rate Passenger: Ride ${rideId}, Rating ${rating}, Comment: ${comment}`);
    return { message: 'Rating submitted (Logged only, schema update pending)' };
  }

  async cancelRide(rideId: string, reason: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: { status: 'CANCELLED' }
    });

    this.logger.log(`Ride ${rideId} cancelled. Reason: ${reason}`);

    // Notify parties
    if (ride.driverId) {
      this.notificationService.sendNotification({
        userId: ride.driverId,
        title: 'Ride Cancelled',
        body: 'The ride was cancelled.'
      });
    }

    return updatedRide;
  }

  async arriveAtStop(rideId: string, stopIndex: number) {
    // Schema doesn't have `stops` array yet?
    // `stops` were in the mock object but not obviously in schema.
    // Schema has `pickupLocation` and `dropoffLocation`.
    // If we want multiple stops, we need a separate model or Json field.
    // For now, I will Comment this out or Stub it because Schema doesn't support it fully.
    this.logger.warn('arriveAtStop not fully implemented with DB yet');
    return { message: 'Not implemented' };
  }

  addStop(rideId: string, newStopAddress: string) {
    // Stub
    return { message: 'Not implemented' };
  }

  respondToChange(rideId: string, response: 'accepted' | 'declined') {
    // Stub
    return { message: 'Not implemented' };
  }

  findAndOfferBackToBackRide(driverId: string) {
    // Stub logic with DB later
    return { success: false, message: 'Not implemented' };
  }

  async findForUser(userId: string, params: PaginationParams) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: {
          OR: [
            { passengerId: userId },
            { driverId: userId }
          ]
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.ride.count({
        where: {
          OR: [
            { passengerId: userId },
            { driverId: userId }
          ]
        }
      })
    ]);

    return {
      data: rides,
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  // Helper for dashboard
  async getActiveRides() {
    return this.prisma.ride.findMany({
      where: {
        status: { in: ['REQUESTED', 'DRIVER_ASSIGNED', 'IN_PROGRESS'] }
      },
      include: { passenger: true, driver: true }
    });
  }
}