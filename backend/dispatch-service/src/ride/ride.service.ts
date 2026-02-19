import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { MatchingService } from '../matching/matching.service';
import { BadgeService } from '../badge/badge.service';
import { CommissionService } from '../commission/commission.service';
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

// In-memory passenger trip tracking (would use database in production)
const passengerTripCounts: Map<string, number> = new Map();
const MAX_FREE_TRIPS = 1;

@Injectable()
export class RideService {
  private readonly logger = new Logger(RideService.name);

  // In a real app, these would be properly injected via NestJS DI
  private readonly paymentService = new PaymentService();
  private readonly vehicleService = new VehicleService();
  private readonly userService = new UserService();
  private readonly notificationService = new NotificationService();

  constructor(
    private prisma: PrismaService,
    public matchingService: MatchingService,
    private badgeService: BadgeService,
    private commissionService: CommissionService
  ) { }

  private checkPassengerVerification(passengerId: string): { canRequest: boolean; reason?: string; remainingTrips?: number; isVerified?: boolean } {
    // Get current trip count
    const tripCount = passengerTripCounts.get(passengerId) || 0;
    const remainingTrips = Math.max(0, MAX_FREE_TRIPS - tripCount);

    // Check if passenger is verified (would query database in production)
    // For now, assume not verified if they have trips tracked
    const isVerified = tripCount === 0 && passengerTripCounts.has(passengerId);

    // If exceeded trip limit and not verified
    if (tripCount >= MAX_FREE_TRIPS && !isVerified) {
      return {
        canRequest: false,
        reason: 'Verification required. Please verify your identity to continue using the service.',
        remainingTrips: 0,
        isVerified: false
      };
    }

    return {
      canRequest: true,
      reason: `You have ${remainingTrips} trip(s) remaining before verification is required.`,
      remainingTrips,
      isVerified: isVerified
    };
  }

  async createRide(passengerId: string, pickup: any, dropoff: any, vehicleType?: string) {
    // Check passenger verification before creating ride
    const verificationCheck = this.checkPassengerVerification(passengerId);

    if (!verificationCheck.canRequest) {
      throw new HttpException(
        {
          error: 'Verification Required',
          message: verificationCheck.reason,
          remainingTrips: verificationCheck.remainingTrips,
          isVerified: verificationCheck.isVerified,
          action: 'VERIFY_IDENTITY'
        },
        HttpStatus.FORBIDDEN
      );
    }

    const matchingStartedAt = new Date();

    const ride = await this.prisma.ride.create({
      data: {
        passengerId,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        status: 'REQUESTED',
        requestedVehicleType: vehicleType as any,
        matchingStartedAt,
        fare: 0,
        distance: 0,
        duration: 0
      }
    });

    // Increment trip count for tracking
    const currentCount = passengerTripCounts.get(passengerId) || 0;
    passengerTripCounts.set(passengerId, currentCount + 1);

    // Start matching process asynchronously
    this.startMatching(ride.id).catch(err =>
      this.logger.error(`Matching failed for ride ${ride.id}: ${err.message}`)
    );

    return {
      ...ride,
      remainingTrips: verificationCheck.remainingTrips,
      isVerified: verificationCheck.isVerified,
      verificationMessage: verificationCheck.reason
    };
  }

  private async startMatching(rideId: string): Promise<void> {
    const driverId = await this.matchingService.matchRideToDriver(rideId);

    if (driverId) {
      const matchingCompletedAt = new Date();
      const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
      const matchingDurationMs = matchingCompletedAt.getTime() - new Date(ride.matchingStartedAt).getTime();

      await this.prisma.ride.update({
        where: { id: rideId },
        data: {
          driverId,
          status: 'DRIVER_ASSIGNED',
          matchingCompletedAt,
          matchingDurationMs
        }
      });

      this.logger.log(`Ride ${rideId} matched to driver ${driverId} in ${matchingDurationMs}ms`);

      // Notify the assigned driver via WebSocket
      // We pass the updated ride object which now has the driverId
      const updatedRide = await this.prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          passenger: {
            select: {
              id: true,
              fullName: true,
              passportPhotoUrl: true,
              averageRating: true,
              badges: {

                select: { badge: true },
                take: 5 // Limit to top 5 badges to keep payload small
              }
            }
          }
        }
      });
      await this.matchingService.broadcastRideRequest(updatedRide, [driverId]);
    } else {
      this.logger.warn(`No driver found for ride ${rideId}`);
    }
  }

  async getCurrentRide(userId: string, role: string) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        OR: [
          role === 'DRIVER' ? { driverId: userId } : { passengerId: userId }
        ],
        status: {
          in: ['REQUESTED', 'MATCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS']
        }
      },
      include: {
        passenger: {
          include: {
            badges: {
              select: { badge: true },
              take: 5
            }
          }
        },
        driver: {
          include: {
            user: true,
            vehicle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add passenger verification status if driver is viewing
    if (ride && role === 'DRIVER') {
      const tripCount = passengerTripCounts.get(ride.passengerId) || 0;
      const isVerified = tripCount === 0 && passengerTripCounts.has(ride.passengerId);

      return {
        ...ride,
        passengerVerificationStatus: isVerified ? 'VERIFIED' : 'UNVERIFIED',
        passengerWarning: isVerified
          ? null
          : 'This passenger has not verified their identity. You may reject this ride if you have concerns about safety.'
      };
    }

    return ride;
  }

  async acceptRide(rideId: string, driverId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    // Check if ride is available
    if (ride.status !== 'REQUESTED') {
      throw new Error('Ride is not available');
    }

    // Fetch driver with vehicle information
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
      include: { vehicle: true }
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Vehicle type validation
    if (ride.requestedVehicleType && driver.vehicle) {
      if (driver.vehicle.type !== ride.requestedVehicleType) {
        throw new Error(
          `Vehicle type mismatch. Ride requires ${ride.requestedVehicleType}, driver has ${driver.vehicle.type}`
        );
      }
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: driverId,
        status: 'DRIVER_ASSIGNED',
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

  async rejectRide(rideId: string, driverId: string, reason?: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    // Log the rejection reason for analytics
    if (reason) {
      this.logger.log(`Driver ${driverId} rejected ride ${rideId}. Reason: ${reason}`);

      // Track rejection due to unverified passenger
      if (reason.includes('unverified') || reason.includes('not verified')) {
        // Could trigger notification to passenger to verify
        this.notificationService.sendNotification({
          userId: ride.passengerId,
          title: 'Ride Rejected',
          body: 'A driver rejected your ride request. Consider verifying your identity for better service.'
        });
      }
    }

    if (ride.driverId !== driverId) {
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
    return {
      ...updatedRide,
      rejectionReason: reason,
      message: 'Ride rejected. Returned to driver pool.'
    };
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

    // Award badges to passenger and driver
    this.awardRideCompletionBadges(updatedRide.passengerId, updatedRide.driverId);

    // Calculate payouts and commissions if ride is successful and driver exists
    if (status === 'COMPLETED' && updatedRide.driverId) {
      try {
        await this.commissionService.calculateTripPayout({
          baseFare: Number(finalFare),
          driverProfileId: updatedRide.driverId,
          tripId: updatedRide.id
        });

        // Trigger SACCO deduction via Sacco Service API
        // Service name 'sacco-service' resolves via Docker DNS
        const saccoServiceUrl = process.env.SACCO_SERVICE_URL || 'http://sacco-service:3336';

        fetch(`${saccoServiceUrl}/api/sacco/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: updatedRide.id,
            driverId: updatedRide.driverId,
            finalFare: Number(finalFare)
          })
        }).then(res => {
          if (!res.ok) {
            this.logger.error(`Sacco service returned ${res.status}`);
          } else {
            this.logger.log(`Sacco deduction triggered successfully for ride ${rideId}`);
          }
        }).catch(err => {
          this.logger.error(`Failed to call Sacco service: ${err.message}`);
        });

      } catch (commissionError) {
        this.logger.error(`Failed to process payout/commission: ${commissionError.message}`);
      }
    }

    return updatedRide;
  }

  private async awardRideCompletionBadges(passengerId: string, driverId: string | null): Promise<void> {
    try {
      // Award badges to passenger
      const passengerBadges = await this.badgeService.checkAndAwardBadges(passengerId, 'RIDE_COMPLETED');
      if (passengerBadges.length > 0) {
        this.logger.log(`Awarded ${passengerBadges.length} badge(s) to passenger ${passengerId}`);
      }

      // Award badges to driver if exists
      if (driverId) {
        const driver = await this.prisma.driverProfile.findUnique({
          where: { id: driverId },
          select: { userId: true }
        });

        if (driver) {
          const driverBadges = await this.badgeService.checkAndAwardBadges(driver.userId, 'RIDE_COMPLETED');
          if (driverBadges.length > 0) {
            this.logger.log(`Awarded ${driverBadges.length} badge(s) to driver ${driver.userId}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to award badges: ${error.message}`);
    }
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

  // Admin methods for Job Activities Dashboard
  async getAllRidesForAdmin(filters: {
    status?: string;
    search?: string;
    date?: string;
    page: number;
    limit: number;
  }) {
    const skip = (filters.page - 1) * filters.limit;
    const take = filters.limit;

    // Build where clause
    const where: any = {};

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    // Date filter
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Search filter - search across passenger, driver, and ride ID
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        { id: { contains: searchLower, mode: 'insensitive' } },
        {
          passenger: {
            OR: [
              { fullName: { contains: searchLower, mode: 'insensitive' } },
              { phone: { contains: searchLower, mode: 'insensitive' } },
              { email: { contains: searchLower, mode: 'insensitive' } }
            ]
          }
        },
        {
          driver: {
            user: {
              OR: [
                { fullName: { contains: searchLower, mode: 'insensitive' } },
                { phone: { contains: searchLower, mode: 'insensitive' } },
                { email: { contains: searchLower, mode: 'insensitive' } }
              ]
            }
          }
        }
      ];
    }

    // Fetch rides and total count
    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          passenger: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                  email: true
                }
              },
              vehicle: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  plateNumber: true,
                  type: true
                }
              }
            }
          }
        }
      }),
      this.prisma.ride.count({ where })
    ]);

    // Transform data for frontend
    const transformedRides = rides.map(ride => ({
      id: ride.id,
      passengerId: ride.passengerId,
      passengerName: ride.passenger.fullName,
      passengerPhone: ride.passenger.phone,
      passengerEmail: ride.passenger.email,
      driverId: ride.driverId,
      driverName: ride.driver?.user.fullName || null,
      driverPhone: ride.driver?.user.phone || null,
      driverEmail: ride.driver?.user.email || null,
      driverVehicle: ride.driver?.vehicle ? {
        make: ride.driver.vehicle.make,
        model: ride.driver.vehicle.model,
        plateNumber: ride.driver.vehicle.plateNumber,
        type: ride.driver.vehicle.type
      } : null,
      status: ride.status,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      fare: ride.fare ? Number(ride.fare) : null,
      distance: ride.distance,
      duration: ride.duration,
      createdAt: ride.createdAt.toISOString(),
      updatedAt: ride.updatedAt.toISOString()
    }));

    return {
      rides: transformedRides,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit)
    };
  }

  async getRideStatistics(startDate?: string, endDate?: string) {
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = end;
      }
    }

    // Get all rides with filters
    const allRides = await this.prisma.ride.findMany({
      where: dateFilter,
      select: {
        id: true,
        status: true,
        fare: true,
        distance: true,
        duration: true,
        createdAt: true
      }
    });

    // Calculate statistics
    const stats = {
      total: allRides.length,
      requested: allRides.filter(r => r.status === 'REQUESTED').length,
      matching: allRides.filter(r => r.status === 'MATCHING').length,
      assigned: allRides.filter(r => r.status === 'DRIVER_ASSIGNED').length,
      driverArrived: allRides.filter(r => r.status === 'DRIVER_ARRIVED').length,
      inProgress: allRides.filter(r => r.status === 'IN_PROGRESS').length,
      completed: allRides.filter(r => r.status === 'COMPLETED').length,
      cancelled: allRides.filter(r => r.status === 'CANCELLED').length,
      totalRevenue: allRides
        .filter(r => r.status === 'COMPLETED' && r.fare)
        .reduce((sum, r) => sum + Number(r.fare), 0),
      averageFare: 0,
      averageDistance: 0,
      averageDuration: 0
    };

    // Calculate averages
    const ridesWithFare = allRides.filter(r => r.fare);
    const ridesWithDistance = allRides.filter(r => r.distance);
    const ridesWithDuration = allRides.filter(r => r.duration);

    if (ridesWithFare.length > 0) {
      stats.averageFare = ridesWithFare.reduce((sum, r) => sum + Number(r.fare), 0) / ridesWithFare.length;
    }

    if (ridesWithDistance.length > 0) {
      stats.averageDistance = ridesWithDistance.reduce((sum, r) => sum + (r.distance || 0), 0) / ridesWithDistance.length;
    }

    if (ridesWithDuration.length > 0) {
      stats.averageDuration = ridesWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) / ridesWithDuration.length;
    }

    return stats;
  }
}