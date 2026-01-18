import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus } from '@prisma/client';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) { }

  async requestRide(rideRequest: any) {
    console.log('Received ride request:', rideRequest);

    if (!rideRequest.pickup || !rideRequest.dropoff || !rideRequest.passengerId) {
      throw new Error('Invalid ride request: Missing pickup, dropoff, or passengerId');
    }

    // Create Ride in DB
    const ride = await this.prisma.ride.create({
      data: {
        passengerId: rideRequest.passengerId,
        pickupLocation: rideRequest.pickup,
        dropoffLocation: rideRequest.dropoff,
        status: RideStatus.REQUESTED,
      },
    });

    console.log(`Ride created: ${ride.id}`);
    return ride;
  }

  async acceptRide(rideId: string, driverId: string) {
    console.log(`Driver ${driverId} accepting ride ${rideId}`);

    // In a real scenario, we might check if ride is already taken
    // or verify driver eligibility.

    const ride = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: driverId,
        status: RideStatus.DRIVER_ASSIGNED, // Or MATCHED ideally
      },
    });

    return ride;
  }

  async updateRideStatus(rideId: string, status: string) {
    // Validate status string matches enum if possible, or cast
    // For simplicity we cast loosely but ideally validation pipe handles this
    console.log(`Updating ride ${rideId} to ${status}`);

    const ride = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: status as RideStatus,
      },
    });

    return ride;
  }

  async completeRide(rideId: string) {
    console.log(`Completing ride ${rideId}`);

    const ride = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.COMPLETED,
        // Calculate fare, distance, etc here if needed
      },
    });

    return ride;
  }

  // Legacy/Helper methods kept for compatibility with controller
  async assignDriver(rideId: string, driverId: string) {
    return this.acceptRide(rideId, driverId);
  }

  async getRideStatus(rideId: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        passenger: true,
        driver: {
          include: {
            user: true
          }
        }
      }
    });

    if (!ride) throw new NotFoundException('Ride not found');
    return ride;
  }

  async getAllRides(limit: number = 100) {
    const rides = await this.prisma.ride.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        passenger: true,
        driver: {
          include: {
            user: true
          }
        }
      }
    });
    return rides;
  }
}
