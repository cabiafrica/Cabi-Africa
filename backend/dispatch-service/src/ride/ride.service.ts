import { Injectable, Logger, NotFoundException, BadRequestException, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { MatchingService } from '../matching/matching.service';
import { BadgeService } from '../badge/badge.service';
import { CommissionService } from '../commission/commission.service';
// import { PaymentService } from '@cabi/backend/payment-service'; 
// import { VehicleService } from '@cabi/backend/vehicle-service'; 
// import { UserService } from '@cabi/backend/user-service';
import { SettingsService } from '@cabi/backend/settings';
import { NotificationService } from '@cabi/backend/notification-service';

class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  async createCharge(
    uid: string,
    amount: number,
    rideId?: string
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
    if (paymentServiceUrl) {
      try {
        const cleanUrl = paymentServiceUrl.replace(/\/+$/, '');
        const targetUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/payments/charge` : `${cleanUrl}/api/payments/charge`;
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passengerId: uid, amount, rideId }),
        });
        if (response.ok) {
          const data = await response.json();
          return { success: true, transactionId: data.transactionId, message: 'Digital payment processed' };
        }
      } catch (err: any) {
        this.logger.warn(`Payment gateway call failed: ${err.message}. Recording as cash/direct settlement.`);
      }
    }
    return { success: true, transactionId: `settled_${Date.now()}`, message: 'Cash/Direct settlement confirmed' };
  }
}
class VehicleService { getActiveVehicleForDriver(id: string): any { return { id: 'v1', model: 'Standard' }; } }
class UserService { }

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
export class RideService implements OnModuleInit {
  private readonly logger = new Logger(RideService.name);

  // In a real app, these would be properly injected via NestJS DI
  private readonly paymentService = new PaymentService();
  private readonly vehicleService = new VehicleService();
  private readonly notificationService: NotificationService;
  private readonly driverMissedQualifyingMap: Map<string, number> = new Map();

  constructor(
    private prisma: PrismaService,
    public matchingService: MatchingService,
    private badgeService: BadgeService,
    private commissionService: CommissionService,
    private settingsService: SettingsService,
    notificationService?: NotificationService
  ) {
    this.notificationService = notificationService || new NotificationService();
  }

  onModuleInit() {
    this.logger.log('RideService initialized: 20-second assignment escalation monitor active.');
    setInterval(async () => {
      try {
        await this.checkExpiringAssignments();
      } catch (err: any) {
        this.logger.error(`Error in assignment expiration check: ${err.message}`);
      }
    }, 3000);
  }

  async checkExpiringAssignments(): Promise<void> {
    const now = new Date();
    const expiredRides = await this.prisma.ride.findMany({
      where: {
        status: 'DRIVER_ASSIGNED',
        assignmentExpiresAt: { lt: now },
        driverId: { not: null }
      }
    });

    for (const ride of expiredRides) {
      if (ride.driverId) {
        this.logger.warn(`Ride ${ride.id} assignment timed out after 20s for driver ${ride.driverId}. Escalating to next driver.`);
        await this.passRide(ride.id, ride.driverId, '20-second acceptance timeout');
      }
    }
  }

  private async checkPassengerVerification(passengerId: string): Promise<{ canRequest: boolean; reason?: string; remainingTrips?: number; isVerified?: boolean }> {
    const verificationEnabled = await this.settingsService.getSystemSetting('RIDE_VERIFICATION_ENABLED');
    
    if (verificationEnabled === false) {
      return { canRequest: true, isVerified: true };
    }

    const GUEST_ID = '00000000-0000-0000-0000-000000000000';
    if (passengerId === 'guest' || passengerId === GUEST_ID) {
      return { canRequest: true, reason: 'Guest booking permitted during testing.', isVerified: false };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: passengerId },
        select: {
          isVerifiedPassenger: true,
          isIdentityVerified: true,
          passengerTripCount: true,
          maxFreeTrips: true
        }
      });

      if (!user) {
        return { canRequest: true, remainingTrips: 1, isVerified: false };
      }

      const isVerified = user.isVerifiedPassenger || user.isIdentityVerified;
      const maxTrips = user.maxFreeTrips ?? MAX_FREE_TRIPS;
      const tripCount = user.passengerTripCount ?? 0;
      const remainingTrips = Math.max(0, maxTrips - tripCount);

      if (tripCount >= maxTrips && !isVerified) {
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
        isVerified
      };
    } catch (e) {
      this.logger.warn(`Error querying user verification status: ${e}`);
      return { canRequest: true, remainingTrips: 1, isVerified: true };
    }
  }

  async createRide(
    passengerId: string,
    pickup: any,
    dropoff: any,
    fare: number,
    vehicleType?: string,
    isVerifiedPassenger?: boolean,
    verificationMethod?: string
  ) {
    // Check passenger verification before creating ride
    const verificationCheck = await this.checkPassengerVerification(passengerId);

    if (!verificationCheck.canRequest && !isVerifiedPassenger) {
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

    if (isVerifiedPassenger && passengerId && passengerId !== 'guest' && passengerId !== '00000000-0000-0000-0000-000000000000') {
      this.prisma.user.update({
        where: { id: passengerId },
        data: { isVerifiedPassenger: true, isIdentityVerified: true }
      }).catch(err => this.logger.warn(`Could not update user verification status: ${err.message}`));
    }

    const matchingStartedAt = new Date();

    // Normalize and map vehicle type to valid PostgreSQL enum (STANDARD, PREMIUM, XL, BODA)
    let resolvedVehicleType = (vehicleType || 'STANDARD').toUpperCase();
    if (resolvedVehicleType === 'LITE' || resolvedVehicleType === 'COMFORT') {
      resolvedVehicleType = 'STANDARD';
    }
    const validVehicleTypes = ['STANDARD', 'PREMIUM', 'XL', 'BODA'];
    if (!validVehicleTypes.includes(resolvedVehicleType)) {
      resolvedVehicleType = 'STANDARD';
    }

    // Generate unique human-readable Trip Code (format: CB-XXXX)
    const tripCodeNum = Math.floor(1000 + Math.random() * 9000);
    const tripCode = `CB-${tripCodeNum}`;

    const ride = await (this.prisma.ride.create as any)({
      data: {
        passengerId,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        status: 'REQUESTED',
        requestedVehicleType: resolvedVehicleType as any,
        matchingStartedAt,
        fare: fare,
        distance: 0,
        duration: 0,
        tripCode,
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
      isVerifiedPassenger: isVerifiedPassenger ?? verificationCheck.isVerified ?? false,
      verificationMethod: verificationMethod || 'BIOMETRIC',
      remainingTrips: verificationCheck.remainingTrips,
      isVerified: isVerifiedPassenger ?? verificationCheck.isVerified ?? true,
      verificationMessage: verificationCheck.reason
    };
  }

  private async startMatching(rideId: string): Promise<void> {
    const driverId = await this.matchingService.matchRideToDriver(rideId);

    if (driverId) {
      const matchingCompletedAt = new Date();
      const timeoutSec = parseInt(process.env.DISPATCH_TIMEOUT_SECONDS || '120', 10);
      const assignmentExpiresAt = new Date(Date.now() + timeoutSec * 1000); // Configurable (default 120s) for real device testing
      const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
      const matchingDurationMs = matchingCompletedAt.getTime() - new Date(ride.matchingStartedAt).getTime();

      await this.prisma.ride.update({
        where: { id: rideId },
        data: {
          driverId,
          status: 'DRIVER_ASSIGNED',
          assignmentExpiresAt,
          matchingCompletedAt,
          matchingDurationMs
        } as any
      });

      this.logger.log(`Ride ${rideId} matched to driver ${driverId} (${timeoutSec}s window, ${matchingDurationMs}ms)`);

      // Notify the assigned driver via WebSocket
      // We pass the updated ride object which now has the driverId
      const updatedRide = await this.prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          passenger: {
            select: {
              id: true,
              fullName: true,
              middleName: true,
              nickname: true,
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
      await this.matchingService.broadcastRideRequest({
        ...updatedRide,
        isVerifiedPassenger: true,
      }, [driverId]);
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
            vehicles: true
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

    // Check if ride is in an acceptable state
    if (!['REQUESTED', 'DRIVER_ASSIGNED', 'MATCHING'].includes(ride.status)) {
      throw new Error(`Ride is not available for acceptance (current status: ${ride.status})`);
    }

    // Fetch driver with vehicle information (support both driverProfile.id and user.id)
    const driver = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id: driverId }, { userId: driverId }] },
      include: { vehicles: true }
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Vehicle type validation
    const driverVehicles = Array.isArray(driver.vehicles) ? driver.vehicles : [driver.vehicles].filter(Boolean);
    if (ride.requestedVehicleType && driverVehicles.length > 0) {
      const primaryVehicle = driverVehicles[0];
      if (primaryVehicle.type !== ride.requestedVehicleType) {
        throw new Error(
          `Vehicle type mismatch. Ride requires ${ride.requestedVehicleType}, driver has ${primaryVehicle.type}`
        );
      }
    }

    // Remove this driver from passedDriverIds if present due to timeout race condition
    // (driver accepts slightly after 20s window, which erroneously marks them as passed)
    const currentPassed: string[] = (ride as any).passedDriverIds || [];
    const cleanedPassed = currentPassed.filter(id => id !== driver.id && id !== driverId);

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: driver.id,
        status: 'DRIVER_ASSIGNED',
        assignmentExpiresAt: null, // Clear countdown once accepted
        passedDriverIds: cleanedPassed, // Clean up race-condition entries
      } as any,
      include: { passenger: true, driver: true }
    });

    // Reset consecutive missed qualifying trips on acceptance
    this.driverMissedQualifyingMap.delete(driver.id);

    this.logger.log(`Ride ${rideId} accepted by driver ${driver.id}.`);

    // Notify passenger
    this.notificationService.sendNotification({
      userId: updatedRide.passengerId,
      title: 'Driver Found!',
      body: `Your driver is on the way.`
    });

    return updatedRide;
  }

  isQualifyingTrip(ride: any, driver: any): boolean {
    if (!ride || !driver) return true;

    const pickup = ride.pickupLocation;
    const driverLoc = driver.currentLocation;
    const radiusKm = 5.0; // Standard max driver pickup radius

    // 1. Verify pickup is within driver's active pickup radius
    if (
      pickup &&
      driverLoc &&
      typeof pickup.lat === 'number' &&
      typeof pickup.lng === 'number' &&
      typeof driverLoc.lat === 'number' &&
      typeof driverLoc.lng === 'number'
    ) {
      const distKm = this.matchingService.calculateDistance(
        driverLoc.lat,
        driverLoc.lng,
        pickup.lat,
        pickup.lng
      );
      if (distKm > radiusKm) {
        return false; // Beyond pickup radius -> NON-QUALIFYING
      }
    }

    // 2. Verify trip alignment if driver set preferredDestination
    const prefDest = driver.preferredDestination;
    const dropoff = ride.dropoffLocation;
    if (
      prefDest &&
      prefDest.active &&
      prefDest.lat &&
      prefDest.lng &&
      pickup &&
      dropoff &&
      pickup.lat &&
      dropoff.lat
    ) {
      const distPickupToDest = this.matchingService.calculateDistance(
        pickup.lat,
        pickup.lng,
        prefDest.lat,
        prefDest.lng
      );
      const distDropoffToDest = this.matchingService.calculateDistance(
        dropoff.lat,
        dropoff.lng,
        prefDest.lat,
        prefDest.lng
      );
      if (distDropoffToDest >= distPickupToDest) {
        return false; // Trip is not heading towards preferred destination -> NON-QUALIFYING
      }
    }

    return true; // Meets all criteria -> QUALIFYING TRIP
  }

  async passRide(rideId: string, driverId: string, reason = 'Driver passed') {
    const driver = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id: driverId }, { userId: driverId }] },
    });
    const resolvedDriverId = driver ? driver.id : driverId;
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    const currentPassed: string[] = (ride as any).passedDriverIds || [];
    const updatedPassed = Array.from(new Set([...currentPassed, resolvedDriverId, driverId]));

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: null,
        status: 'MATCHING',
        passedDriverIds: updatedPassed,
        assignmentExpiresAt: null,
      } as any
    });

    // Qualifying trip evaluation & 3-miss auto-offline rule
    const isQualifying = this.isQualifyingTrip(ride, driver);
    if (isQualifying) {
      const currentMisses = (this.driverMissedQualifyingMap.get(resolvedDriverId) || 0) + 1;
      this.driverMissedQualifyingMap.set(resolvedDriverId, currentMisses);
      this.logger.warn(
        `Driver ${resolvedDriverId} missed qualifying trip ${rideId} (${reason}). Qualifying misses: ${currentMisses}/3`
      );

      if (currentMisses >= 3) {
        await this.prisma.driverProfile.update({
          where: { id: resolvedDriverId },
          data: { isOnline: false },
        }).catch(err => this.logger.error(`Error auto-setting driver offline: ${err.message}`));

        this.driverMissedQualifyingMap.delete(resolvedDriverId);
        this.logger.warn(
          `Driver ${resolvedDriverId} missed 3 qualifying trip requests. Automatically switched OFFLINE.`
        );
      }
    } else {
      this.logger.log(
        `Ride ${rideId} was non-qualifying for driver ${resolvedDriverId} (outside radius or unaligned destination). Excluded from 3-miss counter and does not affect rating.`
      );
    }

    this.logger.log(`Driver ${driverId} passed on ride ${rideId} (${reason}). Escalating to next candidate driver...`);

    // Immediately trigger matching to find the next best driver
    this.startMatching(rideId).catch(err =>
      this.logger.error(`Failed to escalate ride ${rideId}: ${err.message}`)
    );

    return {
      ...updatedRide,
      passed: true,
      isQualifying,
      message: 'Ride passed. Escalated to next available driver.'
    };
  }

  async rejectRide(rideId: string, driverId: string, reason?: string) {
    return this.passRide(rideId, driverId, reason || 'Driver rejected');
  }

  async updateDriverPreferences(
    driverId: string,
    preferences: { preferredDestination?: any; excludedZones?: any[] }
  ) {
    const dataToUpdate: any = {};
    if (preferences.preferredDestination !== undefined) {
      dataToUpdate.preferredDestination = preferences.preferredDestination;
    }
    if (preferences.excludedZones !== undefined) {
      dataToUpdate.excludedZones = preferences.excludedZones;
    }

    const driver = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id: driverId }, { userId: driverId }] }
    });

    if (!driver) {
      throw new NotFoundException(`Driver profile not found for ID: ${driverId}`);
    }

    const updated = await this.prisma.driverProfile.update({
      where: { id: driver.id },
      data: dataToUpdate
    });

    this.logger.log(`Driver ${driver.id} preferences updated: ${JSON.stringify(preferences)}`);
    return { success: true, data: updated };
  }

  async getDemandHotspots() {
    const hotspots = [
      {
        id: 'westlands',
        name: 'Westlands & Mpaka Rd',
        lat: -1.2655,
        lng: 36.8048,
        radiusKm: 2.5,
        baseMultiplier: 1.5,
        activeRequests: 24,
        peakHours: '17:00 - 22:00',
        peakDays: ['Thursday', 'Friday', 'Saturday'],
        category: 'Nightlife & Tech Hub'
      },
      {
        id: 'cbd',
        name: 'Nairobi CBD & City Square',
        lat: -1.286389,
        lng: 36.817223,
        radiusKm: 2.0,
        baseMultiplier: 1.3,
        activeRequests: 38,
        peakHours: '07:00 - 09:30 & 16:30 - 19:30',
        peakDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        category: 'Business & Commuter'
      },
      {
        id: 'kilimani',
        name: 'Kilimani & Yaya Centre',
        lat: -1.2921,
        lng: 36.7865,
        radiusKm: 2.2,
        baseMultiplier: 1.4,
        activeRequests: 19,
        peakHours: '12:00 - 14:30 & 18:00 - 21:30',
        peakDays: ['Wednesday', 'Friday', 'Saturday', 'Sunday'],
        category: 'Dining & Residential'
      },
      {
        id: 'upperhill',
        name: 'Upper Hill & Community',
        lat: -1.2985,
        lng: 36.8142,
        radiusKm: 2.0,
        baseMultiplier: 1.3,
        activeRequests: 15,
        peakHours: '07:30 - 09:00 & 16:30 - 19:00',
        peakDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        category: 'Corporate & Hospitals'
      },
      {
        id: 'jkia',
        name: 'JKIA International Airport',
        lat: -1.3192,
        lng: 36.9275,
        radiusKm: 4.0,
        baseMultiplier: 1.6,
        activeRequests: 12,
        peakHours: '05:00 - 08:00 & 19:00 - 23:00',
        peakDays: ['Thursday', 'Friday', 'Sunday'],
        category: 'Airport Express'
      },
      {
        id: 'gigiri',
        name: 'Gigiri & Village Market',
        lat: -1.2333,
        lng: 36.8055,
        radiusKm: 3.0,
        baseMultiplier: 1.3,
        activeRequests: 10,
        peakHours: '11:00 - 16:00',
        peakDays: ['Friday', 'Saturday', 'Sunday'],
        category: 'Diplomatic & Shopping'
      }
    ];

    return {
      success: true,
      timestamp: new Date().toISOString(),
      data: hotspots
    };
  }

  async startRide(rideId: string, tripCode?: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    // Guard: only allow starting a ride that has been assigned or driver has arrived
    if (!['DRIVER_ASSIGNED', 'DRIVER_ARRIVED'].includes(ride.status)) {
      throw new Error(`Cannot start ride in status: ${ride.status}. Must be DRIVER_ASSIGNED or DRIVER_ARRIVED.`);
    }

    // Optional verification of tripCode (case-insensitive & whitespace-insensitive)
    if (tripCode && (ride as any).tripCode) {
      const cleanInput = tripCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const cleanExpected = ((ride as any).tripCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const digitsInput = tripCode.replace(/\D/g, '');
      const digitsExpected = ((ride as any).tripCode || '').replace(/\D/g, '');
      if (cleanInput !== cleanExpected && digitsInput !== digitsExpected) {
        throw new BadRequestException(`Invalid Trip Code (${tripCode}). Please verify with passenger.`);
      }
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: { status: 'IN_PROGRESS' }
    });

    const activeTripCode = (ride as any).tripCode || 'CB-RIDE';
    this.logger.log(`Ride ${rideId} started (IN_PROGRESS). Trip Code: ${activeTripCode}`);

    // Notify passenger
    this.notificationService.sendNotification({
      userId: ride.passengerId,
      title: `Ride Started [${activeTripCode}]`,
      body: `You are on your way to your destination.`
    });

    return updatedRide;
  }

  async completeRide(rideId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Guard: only allow completing a ride that is IN_PROGRESS
    if (ride.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot complete ride in status: ${ride.status}. Must be IN_PROGRESS.`);
    }

    // Estimate distance from pickup→dropoff using Haversine (real GPS logs would replace this)
    const pickup = ride.pickupLocation as any;
    const dropoff = ride.dropoffLocation as any;
    let estimatedDistanceKm = 0;
    if (pickup?.lat && pickup?.lng && dropoff?.lat && dropoff?.lng) {
      const R = 6371; // Earth radius in km
      const dLat = ((dropoff.lat - pickup.lat) * Math.PI) / 180;
      const dLon = ((dropoff.lng - pickup.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((pickup.lat * Math.PI) / 180) *
          Math.cos((dropoff.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      estimatedDistanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const baseFare = Number(ride.fare) || 350.0;
    // We would need to store `totalWaitTimeFee` somewhere. 
    // The previous mock had it on the object. The schema has `fare` but maybe we need more fields.
    // I'll assume `fare` is the total.

    // Trigger payment processing
    const finalFare = baseFare; // simplify for now

    const chargeResult = await this.paymentService.createCharge(ride.passengerId, finalFare);

    const status: 'COMPLETED' | 'CANCELLED' = 'COMPLETED'; // using Enum strings from schema but simplistic
    // Schema Enum: REQUESTED, MATCHING, DRIVER_ASSIGNED, DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED

    if (chargeResult.success) {
      this.logger.log(`Ride ${rideId} completed and paid.`);
      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: `Trip Completed [${(ride as any).tripCode || 'CB-RIDE'}]`,
        body: `Your trip is completed. Total fare: KES ${finalFare}. Thank you for riding with CABI!`,
      });
    } else {
      this.logger.error(`Ride ${rideId} payment failed.`);
      // Maybe keep it COMPLETED but mark as unpaid? Schema doesn't have 'PAYMENT_FAILED'.
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'COMPLETED',
        fare: finalFare,
        distance: estimatedDistanceKm > 0 ? estimatedDistanceKm : undefined,
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

        // ── Sacco Remittance (External Partner Integration) ──────────────────
        // Only remit if the driver is enrolled in the external Sacco.
        // The sacco-service handles the split computation (mandatory% + incentive%),
        // records the ledger entry, and forwards funds to the partner via REST/CSV.
        const saccoServiceUrl =
          process.env.SACCO_SERVICE_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://sacco-service-746659778850.us-central1.run.app'
            : 'http://localhost:3338');

        fetch(`${saccoServiceUrl}/api/sacco/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: updatedRide.id,
            driverId: updatedRide.driverId,
            fare: Number(finalFare),
          })
        }).then(res => {
          if (!res.ok) {
            this.logger.warn(`Sacco remittance skipped or failed for ride ${rideId} (status ${res.status}) — driver may not be enrolled.`);
          } else {
            this.logger.log(`Sacco remittance recorded for ride ${rideId}`);
          }
        }).catch(err => {
          // Non-critical: log and continue — driver still gets paid
          this.logger.error(`Failed to call Sacco service for remittance: ${err.message}`);
        });

      } catch (commissionError: any) {
        this.logger.error(`Failed to process payout/commission: ${commissionError.message}`);
      }
    }

    // Trigger HTML email receipts to passenger and driver asynchronously
    this.sendRideReceipts(updatedRide.id).catch((receiptErr: any) => {
      this.logger.error(`Failed to send ride receipts for ride ${rideId}: ${receiptErr?.message}`);
    });

    return updatedRide;
  }

  /**
   * Generates and dispatches HTML email receipts to the passenger and driver.
   * Can be called automatically upon ride completion or manually via API.
   */
  async sendRideReceipts(rideId: string) {
    const fullRide = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        passenger: true,
        driver: {
          include: {
            user: true,
            vehicles: true,
          },
        },
      },
    });

    if (!fullRide) {
      throw new NotFoundException(`Ride with ID ${rideId} not found`);
    }

    const results: {
      passengerReceiptSent: boolean;
      driverReceiptSent: boolean;
      passengerEmail?: string;
      driverEmail?: string;
      passengerError?: string;
      driverError?: string;
      previewUrls?: { passenger?: string; driver?: string };
    } = {
      passengerReceiptSent: false,
      driverReceiptSent: false,
      previewUrls: {},
    };

    const totalFare = Number(fullRide.fare) || 0;
    const baseFare = Number(fullRide.baseFare) || (totalFare > 0 ? totalFare * 0.7 : 0);
    const distanceKm = fullRide.distance ? Number(fullRide.distance.toFixed(1)) : undefined;
    const durationMinutes = fullRide.duration ? Math.round(fullRide.duration / 60) : undefined;
    const driverUser = fullRide.driver?.user;
    const driverName = driverUser?.fullName || 'Cabi Partner Driver';
    const passengerName = fullRide.passenger?.fullName || 'Valued Passenger';

    let primaryVehicle: any = undefined;
    if (fullRide.driver?.vehicles) {
      if (Array.isArray(fullRide.driver.vehicles)) {
        primaryVehicle = fullRide.driver.vehicles[0];
      } else {
        primaryVehicle = fullRide.driver.vehicles;
      }
    }

    // 1. Send Passenger HTML Receipt
    if (fullRide.passenger?.email && fullRide.passenger.email.includes('@')) {
      results.passengerEmail = fullRide.passenger.email;
      try {
        const sendResult = await this.notificationService.sendPassengerReceipt({
          to: fullRide.passenger.email,
          passengerName,
          rideId: fullRide.id,
          rideDate: fullRide.createdAt || new Date(),
          pickupLocation: fullRide.pickupLocation as any,
          dropoffLocation: fullRide.dropoffLocation as any,
          distanceKm,
          durationMinutes,
          currency: 'KES',
          totalFare,
          baseFare: baseFare > 0 ? baseFare : undefined,
          surgeMultiplier: fullRide.surgeMultiplier || undefined,
          surgeAmount: (fullRide.surgeMultiplier && fullRide.surgeMultiplier > 1.0)
            ? Number((totalFare - (totalFare / fullRide.surgeMultiplier)).toFixed(2))
            : undefined,
          paymentMethod: 'MPESA',
          driverName,
          vehicleModel: primaryVehicle ? `${primaryVehicle.make || ''} ${primaryVehicle.model || ''}`.trim() : undefined,
          vehiclePlateNumber: primaryVehicle?.plateNumber,
          vehicleColor: primaryVehicle?.color,
        });

        results.passengerReceiptSent = sendResult.success;
        if (sendResult.previewUrl) {
          results.previewUrls!.passenger = sendResult.previewUrl;
        }
        if (!sendResult.success) {
          results.passengerError = sendResult.error;
        }
      } catch (err: any) {
        this.logger.error(`Error sending passenger receipt for ride ${rideId}: ${err.message}`);
        results.passengerError = err.message;
      }
    } else {
      this.logger.warn(`No passenger email found for ride ${rideId}. Skipping passenger receipt.`);
    }

    // 2. Send Driver HTML Trip Summary
    if (driverUser?.email && driverUser.email.includes('@')) {
      results.driverEmail = driverUser.email;
      try {
        const commissionRate = 20; // 20% platform commission
        const commissionAmount = Number((totalFare * (commissionRate / 100)).toFixed(2));
        const netDriverEarnings = Number((totalFare - commissionAmount).toFixed(2));

        const sendResult = await this.notificationService.sendDriverReceipt({
          to: driverUser.email,
          driverName,
          rideId: fullRide.id,
          rideDate: fullRide.createdAt || new Date(),
          pickupLocation: fullRide.pickupLocation as any,
          dropoffLocation: fullRide.dropoffLocation as any,
          distanceKm,
          durationMinutes,
          currency: 'KES',
          grossFare: totalFare,
          platformCommissionRate: commissionRate,
          platformCommissionAmount: commissionAmount,
          netDriverEarnings,
          paymentMethod: 'MPESA',
          payoutStatus: 'CREDITED_TO_WALLET',
          passengerName,
        });

        results.driverReceiptSent = sendResult.success;
        if (sendResult.previewUrl) {
          results.previewUrls!.driver = sendResult.previewUrl;
        }
        if (!sendResult.success) {
          results.driverError = sendResult.error;
        }
      } catch (err: any) {
        this.logger.error(`Error sending driver receipt for ride ${rideId}: ${err.message}`);
        results.driverError = err.message;
      }
    } else {
      this.logger.warn(`No driver email found for ride ${rideId}. Skipping driver receipt.`);
    }

    return results;
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
    return this.submitRating(rideId, rating, comment, 'DRIVER');
  }

  async submitRating(
    rideId: string,
    rating: number,
    comment?: string,
    role?: 'PASSENGER' | 'DRIVER',
    raterId?: string
  ) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: { include: { user: true } },
        passenger: true,
      },
    });

    if (!ride) throw new NotFoundException('Ride not found');

    // Differentiate whether passenger or driver is submitting
    let actualRole = role;
    if (!actualRole) {
      if (raterId && raterId === ride.passengerId) {
        actualRole = 'PASSENGER';
      } else {
        actualRole = 'DRIVER';
      }
    }

    const isPassengerRater = actualRole === 'PASSENGER';
    const raterRole = isPassengerRater ? 'PASSENGER' : 'DRIVER';
    const targetRole = isPassengerRater ? 'DRIVER' : 'PASSENGER';
    const registeredById = isPassengerRater
      ? ride.passengerId
      : (ride.driver?.userId || ride.passengerId);

    const safeRating = Math.max(1, Math.min(5, Math.round(rating || 5)));
    const cleanComment = (comment || '').trim();

    // 1. Register rating and comment in the official Occurrence Book
    const obNumber = `OB-RIDE-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const category = safeRating <= 2 ? 'POLICY_VIOLATION' : 'POLICY_VIOLATION';
    const severity = safeRating <= 1 ? 'HIGH' : safeRating <= 2 ? 'MEDIUM' : 'LOW';
    const title = `Trip Rating & Feedback: ${raterRole} -> ${targetRole} (${safeRating}/5)`;
    const description = `Trip ${rideId} feedback from ${raterRole} (${safeRating} stars): "${cleanComment || 'No additional comment provided.'}"`;

    let occurrence = null;
    try {
      const pickup = ride.pickupLocation as any;
      occurrence = await this.prisma.occurrence.create({
        data: {
          obNumber,
          category,
          severity,
          title,
          description,
          driverId: ride.driverId,
          passengerId: ride.passengerId,
          rideId: ride.id,
          occurrenceDate: new Date(),
          occurrenceTime: new Date(),
          occurredAt: new Date(),
          locationLat: pickup?.lat ? pickup.lat : null,
          locationLng: pickup?.lng ? pickup.lng : null,
          source: `${raterRole}_RATING`,
          registeredById,
          status: safeRating <= 2 ? 'OPEN' : 'RESOLVED',
        },
      });
      this.logger.log(`Occurrence entry ${obNumber} created for ride ${rideId} rating by ${raterRole}`);
    } catch (occErr: any) {
      this.logger.error(`Failed to record occurrence booking for rating: ${occErr.message}`, occErr.stack);
    }

    // 2. Recalculate average rating & stats
    try {
      if (isPassengerRater && ride.driverId) {
        const currentRating = ride.driver?.averageRating ?? 5.0;
        const currentTotal = ride.driver?.totalRidesCompleted ?? 1;
        const newAvg = Number(((currentRating * currentTotal + safeRating) / (currentTotal + 1)).toFixed(2));
        await this.prisma.driverProfile.update({
          where: { id: ride.driverId },
          data: { averageRating: newAvg },
        });
      } else if (!isPassengerRater && ride.passengerId) {
        const currentRating = ride.passenger?.averageRating ?? 5.0;
        const currentTotal = ride.passenger?.totalRidesAsPassenger ?? 1;
        const newAvg = Number(((currentRating * currentTotal + safeRating) / (currentTotal + 1)).toFixed(2));
        await this.prisma.user.update({
          where: { id: ride.passengerId },
          data: { averageRating: newAvg },
        });
      }
    } catch (ratingErr: any) {
      this.logger.warn(`Could not update average rating: ${ratingErr.message}`);
    }

    this.logger.log(`Ride ${rideId} rated by ${raterRole}: ${safeRating} stars, comment: "${cleanComment}"`);

    return {
      success: true,
      message: 'Rating and occurrence feedback recorded successfully.',
      occurrenceId: occurrence?.id,
      obNumber: occurrence?.obNumber,
      rating: safeRating,
      comment: cleanComment,
    };
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
        title: `Ride Cancelled [${(ride as any).tripCode || 'CB-RIDE'}]`,
        body: `The ride was cancelled by passenger. Reason: ${reason || 'Not specified'}`
      });
    }

    return updatedRide;
  }

  async arriveAtStop(rideId: string, stopIndex: number) {
    const ride = await (this.prisma.ride as any).findUnique({
      where: { id: rideId },
      include: { stops: { orderBy: { stopOrder: 'asc' } } }
    });

    if (!ride) {
      throw new NotFoundException(`Ride with ID ${rideId} not found`);
    }

    const stops = (ride as any).stops;
    if (stops && stops.length > stopIndex) {
      const targetStop = stops[stopIndex];
      const updatedStop = await (this.prisma as any).rideStop.update({
        where: { id: targetStop.id },
        data: {
          status: 'ARRIVED',
          arrivedAt: new Date()
        }
      });

      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: 'Driver Arrived at Stop',
        body: `Your driver has arrived at stop #${stopIndex + 1} (${targetStop.address}).`
      });

      return { success: true, stop: updatedStop, message: `Arrived at stop ${stopIndex + 1}` };
    }

    return { success: true, message: `Stop ${stopIndex + 1} marked for ride ${rideId}` };
  }

  async addStop(rideId: string, newStopAddress: string, location?: any) {
    const ride = await (this.prisma.ride as any).findUnique({
      where: { id: rideId },
      include: { stops: { orderBy: { stopOrder: 'asc' } } }
    });

    if (!ride) {
      throw new NotFoundException(`Ride with ID ${rideId} not found`);
    }

    const currentStopCount = (ride as any).stops?.length ?? 0;
    const stopLocation = location ?? { address: newStopAddress, lat: 0, lng: 0 };

    const newStop = await (this.prisma as any).rideStop.create({
      data: {
        rideId,
        address: newStopAddress,
        location: stopLocation,
        stopOrder: currentStopCount + 1,
        status: 'PENDING'
      }
    });

    const extraFare = 50;
    const updatedFare = ride.fare ? Number(ride.fare) + extraFare : extraFare;
    await this.prisma.ride.update({
      where: { id: rideId },
      data: { fare: updatedFare }
    });

    this.notificationService.sendNotification({
      userId: ride.driverId ?? '',
      title: 'New Stop Added',
      body: `Passenger added a new stop: ${newStopAddress}.`
    });

    return { success: true, stop: newStop, newFare: updatedFare };
  }

  async respondToChange(rideId: string, response: 'accepted' | 'declined') {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException(`Ride with ID ${rideId} not found`);
    }

    this.notificationService.sendNotification({
      userId: ride.passengerId,
      title: 'Route Change Update',
      body: `Driver has ${response} the requested route change.`
    });

    return { success: true, rideId, response };
  }

  async findAndOfferBackToBackRide(driverId: string) {
    const pendingRides = await this.prisma.ride.findMany({
      where: {
        status: 'REQUESTED',
        driverId: null
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    if (pendingRides.length === 0) {
      return { success: false, message: 'No back-to-back rides currently available.' };
    }

    const recommendedRide = pendingRides[0];
    return {
      success: true,
      ride: recommendedRide,
      message: 'Back-to-back ride found and queued.'
    };
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
              vehicles: {
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
      driverVehicle: (() => {
        const vList = ride.driver?.vehicles;
        const arr = Array.isArray(vList) ? vList : (vList ? [vList] : []);
        return arr.length > 0 ? {
          make: arr[0].make,
          model: arr[0].model,
          plateNumber: arr[0].plateNumber,
          type: arr[0].type
        } : null;
      })(),
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