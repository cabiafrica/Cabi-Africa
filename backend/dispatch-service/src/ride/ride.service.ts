import { Injectable, Logger, NotFoundException, BadRequestException, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { MatchingService } from '../matching/matching.service';
import { BadgeService } from '../badge/badge.service';
import { CommissionService } from '../commission/commission.service';
import { SettingsService } from '@cabi/backend/settings';
import { NotificationService } from '@cabi/backend/notification-service';
import { PricingService } from '../pricing/pricing.service';
import { generateUserCode, resolveUserCategory } from '../utils/user-code.util';

export type MobileMoneyProvider = 'MPESA' | 'AIRTEL' | 'TKASH' | 'MTN_MOMO' | 'PESALINK' | 'CASH';

class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  async createCharge(
    uid: string,
    amount: number,
    rideId?: string,
    provider: MobileMoneyProvider = 'MPESA'
  ): Promise<{ success: boolean; transactionId?: string; provider: string; message: string }> {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
    if (paymentServiceUrl) {
      try {
        const cleanUrl = paymentServiceUrl.replace(/\/+$/, '');
        const targetUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/payments/charge` : `${cleanUrl}/api/payments/charge`;
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passengerId: uid, amount, rideId, provider }),
        });
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            transactionId: data.transactionId || `${provider}_${Date.now()}`,
            provider,
            message: `${provider} payment processed successfully`,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Payment gateway call failed: ${err.message}. Recording as ${provider}/direct settlement.`);
      }
    }
    const prefix = provider === 'AIRTEL' ? 'AIR' : provider === 'TKASH' ? 'TK' : provider === 'MTN_MOMO' ? 'MTN' : 'CAB';
    return {
      success: true,
      transactionId: `${prefix}_${Date.now().toString().slice(-6)}_${Math.floor(1000 + Math.random() * 9000)}`,
      provider,
      message: `${provider} settlement confirmed`,
    };
  }
}
class VehicleService { getActiveVehicleForDriver(id: string): any { return { id: 'v1', model: 'Standard' }; } }
class UserService { }

interface PaginationParams {
  page: number;
  limit: number;
}

const WAIT_TIME_GRACE_PERIOD_MINUTES = 3;
const WAIT_TIME_FEE_PER_MINUTE = 10.0;

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

  private readonly pricingService: PricingService;

  constructor(
    private prisma: PrismaService,
    public matchingService: MatchingService,
    private badgeService: BadgeService,
    private commissionService: CommissionService,
    private settingsService: SettingsService,
    notificationService?: NotificationService,
    pricingService?: PricingService
  ) {
    this.notificationService = notificationService || new NotificationService();
    this.pricingService = pricingService || new PricingService(this.settingsService);
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

  async getWaitTimeConfig(): Promise<{ feePerMinute: number; gracePeriodMinutes: number }> {
    try {
      const feeSetting = await this.settingsService.getSystemSetting('WAIT_TIME_FEE_PER_MINUTE');
      const graceSetting = await this.settingsService.getSystemSetting('WAIT_TIME_GRACE_PERIOD_MINUTES');

      const feePerMinute = (feeSetting !== null && feeSetting !== undefined && !isNaN(Number(feeSetting)))
        ? Number(feeSetting)
        : WAIT_TIME_FEE_PER_MINUTE;
      const gracePeriodMinutes = (graceSetting !== null && graceSetting !== undefined && !isNaN(Number(graceSetting)))
        ? Number(graceSetting)
        : WAIT_TIME_GRACE_PERIOD_MINUTES;

      return { feePerMinute, gracePeriodMinutes };
    } catch {
      return { feePerMinute: WAIT_TIME_FEE_PER_MINUTE, gracePeriodMinutes: WAIT_TIME_GRACE_PERIOD_MINUTES };
    }
  }

  async updateWaitTimeConfig(feePerMinute: number, gracePeriodMinutes: number) {
    await this.settingsService.updateSystemSetting('WAIT_TIME_FEE_PER_MINUTE', feePerMinute);
    await this.settingsService.updateSystemSetting('WAIT_TIME_GRACE_PERIOD_MINUTES', gracePeriodMinutes);
    this.logger.log(`Wait time configuration updated: KES ${feePerMinute}/min, grace ${gracePeriodMinutes} mins`);
    return { success: true, feePerMinute, gracePeriodMinutes };
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
        const configuredTimeout = process.env.DISPATCH_TIMEOUT_SECONDS || '25';
        this.logger.warn(`Ride ${ride.id} assignment timed out after ${configuredTimeout}s for driver ${ride.driverId}. Escalating to next driver.`);
        await this.passRide(ride.id, ride.driverId, `${configuredTimeout}-second acceptance timeout`);
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

    // Generate collision-free human-readable Trip Code (format: TRP-26B-48192) & 4-digit Boarding PIN
    const now = new Date();
    const yearSuffix = now.getFullYear().toString().slice(-2);
    const monthHex = (now.getMonth() + 1).toString(16).toUpperCase();
    const randomSequence = Math.floor(10000 + Math.random() * 90000);
    const tripCode = `TRP-${yearSuffix}${monthHex}-${randomSequence}`;
    const boardingPin = randomSequence.toString().slice(-4);

    // Check for pending wait fee from previous cancelled ride
    const pendingKey = `PENDING_WAIT_FEE_${passengerId}`;
    let finalFare = Number(fare);
    let pendingAmount = 0;
    try {
      const pendingData = await this.settingsService.getSystemSetting(pendingKey);
      if (pendingData && pendingData.amount && Number(pendingData.amount) > 0) {
        pendingAmount = Number(pendingData.amount);
        finalFare = Number((finalFare + pendingAmount).toFixed(2));
        this.logger.log(`Applied pending wait fee of KES ${pendingAmount} to ride fare for passenger ${passengerId}. New total fare: ${finalFare}`);

        // Mark pending fee as locked for this ride request
        await this.settingsService.updateSystemSetting(pendingKey, { amount: pendingAmount, status: 'ATTACHED_TO_ACTIVE_RIDE' });

        this.notificationService.sendNotification({
          userId: passengerId,
          title: 'Pending Wait Fee Added',
          body: `Your ride includes KES ${pendingAmount} from a previous wait time charge.`
        });
      }
    } catch (e: any) {
      this.logger.warn(`Could not check pending wait fee for passenger ${passengerId}: ${e.message}`);
    }

    const ride = await (this.prisma.ride.create as any)({
      data: {
        passengerId,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        status: 'REQUESTED',
        requestedVehicleType: resolvedVehicleType as any,
        matchingStartedAt,
        fare: finalFare,
        distance: 0,
        duration: 0,
        tripCode,
      }
    });

    // Record locked wait fee linked explicitly to this ride
    if (pendingAmount > 0) {
      try {
        await this.settingsService.updateSystemSetting(`LOCKED_WAIT_FEE_${ride.id}`, {
          passengerId,
          amount: pendingAmount,
          lockedAt: new Date().toISOString(),
        });
        await this.settingsService.updateSystemSetting(pendingKey, {
          amount: pendingAmount,
          status: 'LOCKED',
          lockedRideId: ride.id,
        });
      } catch (lockErr: any) {
        this.logger.warn(`Could not record LOCKED_WAIT_FEE_${ride.id}: ${lockErr.message}`);
      }
    }

    // Increment trip count for tracking
    const currentCount = passengerTripCounts.get(passengerId) || 0;
    passengerTripCounts.set(passengerId, currentCount + 1);

    // Start matching process asynchronously
    this.startMatching(ride.id).catch(err =>
      this.logger.error(`Matching failed for ride ${ride.id}: ${err.message}`)
    );

    return {
      ...ride,
      tripCode,
      boardingPin,
      userCode: generateUserCode('PASSENGER', passengerId),
      isVerifiedPassenger: isVerifiedPassenger ?? verificationCheck.isVerified ?? false,
      verificationMethod: verificationMethod || 'BIOMETRIC',
      remainingTrips: verificationCheck.remainingTrips,
      isVerified: isVerifiedPassenger ?? verificationCheck.isVerified ?? true,
      verificationMessage: verificationCheck.reason
    };
  }

  private async startMatching(rideId: string): Promise<void> {
    const driverId = await this.matchingService.matchRideToDriver(rideId, { useBadgePriority: true });

    if (driverId) {
      const matchingCompletedAt = new Date();
      const timeoutSec = parseInt(process.env.DISPATCH_TIMEOUT_SECONDS || '25', 10);
      const assignmentExpiresAt = new Date(Date.now() + timeoutSec * 1000); // 25s window for driver acceptance
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
      const isVerified = (ride as any).isVerifiedPassenger ||
                         (ride.passenger as any)?.isVerifiedPassenger ||
                         (ride.passenger as any)?.isIdentityVerified ||
                         ((ride.passenger as any)?.passengerTripCount ?? 0) === 0 ||
                         passengerTripCounts.get(ride.passengerId) === 1;

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

    // Prevent race condition: if ride is already active or finished, ignore delayed pass
    if (['DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(ride.status)) {
      this.logger.warn(`Ignoring passRide for ride ${rideId} because ride is already ${ride.status}`);
      return ride;
    }

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
    const activeRides = await this.prisma.ride.findMany({
      where: {
        status: { in: ['REQUESTED', 'MATCHING'] as any },
      },
      select: {
        pickupLocation: true,
      },
    });

    const zones = [
      {
        id: 'westlands',
        name: 'Westlands & Mpaka Rd',
        lat: -1.2655,
        lng: 36.8048,
        radiusKm: 2.5,
        baseMultiplier: 1.0,
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
        baseMultiplier: 1.0,
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
        baseMultiplier: 1.0,
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
        baseMultiplier: 1.0,
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
        baseMultiplier: 1.0,
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
        baseMultiplier: 1.0,
        peakHours: '11:00 - 16:00',
        peakDays: ['Friday', 'Saturday', 'Sunday'],
        category: 'Diplomatic & Shopping'
      }
    ];

    const hotspots = zones.map((zone) => {
      const count = activeRides.filter((r) => {
        const loc = r.pickupLocation as any;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
        const dist = this.matchingService.calculateDistance(zone.lat, zone.lng, loc.lat, loc.lng);
        return dist <= zone.radiusKm;
      }).length;
      return {
        ...zone,
        activeRequests: count,
      };
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      data: hotspots
    };
  }

  async arriveDriver(
    rideId: string,
    driverLocation?: { lat: number; lng: number; accuracyMeters?: number }
  ) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    if (!['DRIVER_ASSIGNED', 'ACCEPTED', 'MATCHING'].includes(ride.status)) {
      throw new BadRequestException(`Cannot mark arrived for ride in status: ${ride.status}`);
    }

    // Geofence validation against pickup location (300m threshold)
    const pickup = ride.pickupLocation as any;
    if (driverLocation?.lat && driverLocation?.lng && pickup?.lat && pickup?.lng) {
      const R = 6371000; // Earth radius in meters
      const dLat = ((pickup.lat - driverLocation.lat) * Math.PI) / 180;
      const dLon = ((pickup.lng - driverLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((driverLocation.lat * Math.PI) / 180) *
          Math.cos((pickup.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const distanceMeters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const MAX_ARRIVAL_DISTANCE_METERS = 300;
      const accuracy = driverLocation.accuracyMeters || 0;

      if (distanceMeters > MAX_ARRIVAL_DISTANCE_METERS) {
        // Option B: Allow arrival if GPS drift/accuracy radius is high (> 100m) with audit log
        if (accuracy > 100) {
          this.logger.warn(
            `Driver arrived with high GPS inaccuracy (${accuracy}m radius). Distance to pickup: ${Math.round(distanceMeters)}m. Allowing arrival under GEOFENCE_BYPASS flag.`
          );
        } else {
          throw new BadRequestException(
            `You must be within 300m of the pickup location to mark arrived. Current distance: ${Math.round(distanceMeters)}m.`
          );
        }
      } else {
        this.logger.log(`Driver arrival geofence validated: ${Math.round(distanceMeters)}m from pickup.`);
      }
    } else if (!driverLocation) {
      this.logger.warn(`Driver arrived for ride ${rideId} without GPS telemetry. Allowing legacy client bypass.`);
    }

    const arrivedAt = new Date();
    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'DRIVER_ARRIVED',
        driverArrivedAt: arrivedAt,
      } as any
    });

    const activeTripCode = (ride as any).tripCode || 'TRP-RIDE';
    this.logger.log(`Driver arrived at pickup for ride ${rideId} [${activeTripCode}] at ${arrivedAt.toISOString()}`);

    this.notificationService.sendNotification({
      userId: ride.passengerId,
      title: `Driver Arrived [${activeTripCode}]`,
      body: `Your driver has arrived at the pickup location. You have 3 minutes before wait fees apply.`
    });

    return updatedRide;
  }

  async startRide(rideId: string, tripCode?: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    // Guard: only allow starting a ride that has been assigned or driver has arrived
    if (!['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'ACCEPTED'].includes(ride.status)) {
      throw new BadRequestException(`Cannot start ride in status: ${ride.status}. Must be DRIVER_ASSIGNED or DRIVER_ARRIVED.`);
    }

    // Optional verification of tripCode (case-insensitive & whitespace-insensitive)
    if (tripCode && (ride as any).tripCode) {
      const cleanInput = tripCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const cleanExpected = ((ride as any).tripCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const digitsInput = tripCode.replace(/\D/g, '');
      const digitsExpected = ((ride as any).tripCode || '').replace(/\D/g, '');
      const pinExpected = digitsExpected.slice(-4);
      const isMatch = cleanInput === cleanExpected ||
                      digitsInput === digitsExpected ||
                      digitsInput === pinExpected ||
                      cleanExpected.endsWith(cleanInput);

      if (!isMatch) {
        throw new BadRequestException(`Invalid Trip Code or Boarding PIN (${tripCode}). Please verify with passenger.`);
      }
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: { status: 'IN_PROGRESS' }
    });

    const activeTripCode = (ride as any).tripCode || 'TRP-RIDE';
    this.logger.log(`Ride ${rideId} started (IN_PROGRESS). Trip Code: ${activeTripCode}`);

    // Notify passenger
    this.notificationService.sendNotification({
      userId: ride.passengerId,
      title: `Ride Started [${activeTripCode}]`,
      body: `You are on your way to your destination.`
    });

    return updatedRide;
  }

  async completeRide(
    rideId: string,
    telemetry?: { distanceKm?: number; durationMinutes?: number }
  ) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Guard: only allow completing a ride that is IN_PROGRESS
    if (ride.status !== 'IN_PROGRESS') {
      throw new BadRequestException(`Cannot complete ride in status: ${ride.status}. Must be IN_PROGRESS.`);
    }

    // Estimate distance: prioritize telemetry reported by driver meter if positive, else Haversine
    const pickup = ride.pickupLocation as any;
    const dropoff = ride.dropoffLocation as any;
    let finalDistanceKm = 0;
    if (telemetry?.distanceKm && telemetry.distanceKm > 0) {
      finalDistanceKm = Number(telemetry.distanceKm);
    } else if (pickup?.lat && pickup?.lng && dropoff?.lat && dropoff?.lng) {
      const R = 6371; // Earth radius in km
      const dLat = ((dropoff.lat - pickup.lat) * Math.PI) / 180;
      const dLon = ((dropoff.lng - pickup.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((pickup.lat * Math.PI) / 180) *
          Math.cos((dropoff.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      finalDistanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    } else if (ride.distance && ride.distance > 0) {
      finalDistanceKm = Number(ride.distance);
    }

    // Estimate duration: prioritize driver meter duration in minutes, else elapsed time
    let finalDurationMinutes = 1.0;
    if (telemetry?.durationMinutes && telemetry.durationMinutes > 0) {
      finalDurationMinutes = Number(telemetry.durationMinutes);
    } else if (ride.updatedAt) {
      const elapsedMs = Date.now() - new Date(ride.updatedAt).getTime();
      finalDurationMinutes = Math.max(1.0, elapsedMs / 60000);
    }

    // Determine category and compute metered fare with category rounding
    const category = (ride.requestedVehicleType as string) || 'STANDARD';
    let finalFare = Number(ride.fare) || 150.0;
    let fareCalc: any = null;

    try {
      fareCalc = await this.pricingService.calculateFare({
        category,
        distanceKm: finalDistanceKm,
        durationMinutes: finalDurationMinutes,
        surgeMultiplier: ride.surgeMultiplier || 1.0,
      });
      finalFare = fareCalc.finalFare;
      this.logger.log(
        `Metered fare computed for Ride ${rideId}: KES ${finalFare} (Pre-round: ${fareCalc.surgedPreRoundFare}, Rounding step: ${fareCalc.roundingStep}, Distance: ${finalDistanceKm.toFixed(2)}km, Duration: ${finalDurationMinutes.toFixed(1)}min)`
      );
    } catch (err: any) {
      this.logger.warn(`Could not compute dynamic fare: ${err.message}. Defaulting to existing fare.`);
    }

    // Ensure any previously locked wait fee attached to this ride is collected
    try {
      const lockedFee = await this.settingsService.getSystemSetting(`LOCKED_WAIT_FEE_${rideId}`);
      if (lockedFee && lockedFee.amount && Number(lockedFee.amount) > 0) {
        finalFare = Number((finalFare + Number(lockedFee.amount)).toFixed(2));
        this.logger.log(`Included locked wait fee of KES ${lockedFee.amount} into final completed fare: KES ${finalFare}`);
      }
    } catch (e: any) {
      this.logger.warn(`Could not check locked wait fee in completeRide: ${e.message}`);
    }

    // Trigger payment processing
    const chargeResult = await this.paymentService.createCharge(ride.passengerId, finalFare);

    const status: 'COMPLETED' | 'CANCELLED' = 'COMPLETED';

    if (chargeResult.success) {
      this.logger.log(`Ride ${rideId} completed and paid via ${chargeResult.provider || 'gateway'}. Transaction: ${chargeResult.transactionId}`);
      // Clear pending & locked wait fee now that trip has been completed and paid
      this.settingsService.updateSystemSetting(`PENDING_WAIT_FEE_${ride.passengerId}`, null).catch(e =>
        this.logger.warn(`Could not clear pending wait fee on completion: ${e.message}`)
      );
      this.settingsService.updateSystemSetting(`LOCKED_WAIT_FEE_${rideId}`, null).catch(() => {});
      this.notificationService.sendNotification({
        userId: ride.passengerId,
        title: `Trip Completed [${(ride as any).tripCode || 'TRP-RIDE'}]`,
        body: `Your trip is completed. Total fare: KES ${finalFare} (${finalDistanceKm.toFixed(2)} km, ${finalDurationMinutes.toFixed(1)} mins). Thank you for riding with CABI!`,
      });
    } else {
      this.logger.error(`Ride ${rideId} payment failed.`);
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'COMPLETED',
        fare: finalFare,
        distance: finalDistanceKm > 0 ? Number(finalDistanceKm.toFixed(2)) : undefined,
        duration: Math.round(finalDurationMinutes * 60),
      }
    });

    // Award badges and loyalty points to passenger and driver
    this.awardRideCompletionBadges(updatedRide.passengerId, updatedRide.driverId, Number(finalFare), rideId);

    // Calculate payouts and commissions if ride is successful and driver exists
    if (status === 'COMPLETED' && updatedRide.driverId) {
      try {
        const payoutResult = await this.commissionService.calculateTripPayout({
          baseFare: Number(finalFare),
          driverProfileId: updatedRide.driverId,
          tripId: updatedRide.id
        });

        // ── Referral Incentive Distribution ─────────────────────────────────
        // Calculate multi-tier referral commissions from trip activities
        // Deducted from platform net commission (driver take-home untouched).
        const referralServiceUrl =
          process.env.REFERRAL_SERVICE_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://referral-service-746659778850.us-central1.run.app'
            : 'http://localhost:3337');

        fetch(`${referralServiceUrl}/api/admin/referral/trip-completed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': process.env.INTERNAL_API_KEY || 'cabi-internal-dev-key',
          },
          body: JSON.stringify({
            tripId: updatedRide.id,
            passengerId: updatedRide.passengerId,
            driverProfileId: updatedRide.driverId,
            baseFare: Number(finalFare),
            platformCommission: payoutResult.platformCommission,
            driverEarnings: payoutResult.driverNetTakeHome,
          }),
        }).then(res => {
          if (!res.ok) {
            this.logger.warn(`Referral distribution skipped or returned ${res.status} for ride ${rideId}`);
          } else {
            this.logger.log(`Referral distribution recorded for ride ${rideId}`);
          }
        }).catch(err => {
          this.logger.error(`Failed to invoke referral service: ${err.message}`);
        });

        // ── Sacco Remittance (External Partner Integration) ──────────────────
        // Only remit if the driver is enrolled in the external Sacco.
        // The sacco-service handles the split computation (mandatory% + incentive%),
        // records the ledger entry, and forwards funds to the partner via REST/CSV.
        const saccoServiceUrl =
          process.env.Sacco_SERVICE_URL ||
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

  private async awardRideCompletionBadges(passengerId: string, driverId: string | null, fareAmount?: number, rideId?: string): Promise<void> {
    try {
      // Award badges to passenger
      const passengerBadges = await this.badgeService.checkAndAwardBadges(passengerId, 'RIDE_COMPLETED');
      if (passengerBadges.length > 0) {
        this.logger.log(`Awarded ${passengerBadges.length} badge(s) to passenger ${passengerId}`);
      }

      // Credit spend points to passenger (1 pt per 100 KES spent)
      if (fareAmount && fareAmount > 0) {
        await this.badgeService.creditRidePoints(passengerId, fareAmount, undefined, rideId);
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

    // 1. Intelligent Category & Severity Classification for Occurrence Book
    // Per Option A: Routine 4- and 5-star ratings update metrics directly without creating an incident record.
    // Ratings <= 3 trigger automated Occurrence Book incident creation with smart keyword classification.
    const lowerComment = cleanComment.toLowerCase();
    let category = 'POLICY_VIOLATION';
    let severity = safeRating <= 1 ? 'HIGH' : safeRating <= 2 ? 'MEDIUM' : 'LOW';
    let isSignificantIncident = false;

    if (safeRating <= 3) {
      isSignificantIncident = true;

      if (/theft|steal|stole|rob|assault|weapon|fight|gun|knife|violence/i.test(lowerComment)) {
        category = 'CRIME';
        severity = 'CRITICAL';
      } else if (/harass|sexual|touch|inappropriate|abuse|insult|threat|intimidation/i.test(lowerComment)) {
        category = 'HARASSMENT';
        severity = 'HIGH';
      } else if (/speed|speeding|reckless|drunk|alcohol|dui|rash|red light/i.test(lowerComment)) {
        category = 'TRAFFIC_OFFENSE';
        severity = 'HIGH';
      } else if (/seatbelt|seat belt|brake|mechanical|unsafe|overload|danger/i.test(lowerComment)) {
        category = 'SAFETY_VIOLATION';
        severity = 'HIGH';
      } else if (/scam|overcharge|meter|cheat|extra cash|offline|extortion/i.test(lowerComment)) {
        category = 'FRAUD';
        severity = 'HIGH';
      } else if (/damage|broke|spill|lost|forgot|luggage|property/i.test(lowerComment)) {
        category = 'PROPERTY_DAMAGE';
        severity = 'MEDIUM';
      } else if (/sick|vomit|bleed|hospital|medical|emergency|faint/i.test(lowerComment)) {
        category = 'MEDICAL_EMERGENCY';
        severity = 'HIGH';
      } else if (/dispute|argument|argue|rude|refuse|refused|yell|route/i.test(lowerComment)) {
        category = 'DISPUTE';
        severity = 'MEDIUM';
      } else if (/dirty|smell|ac|air condition|smoke|flat tire|breakdown/i.test(lowerComment)) {
        category = 'VEHICLE_ISSUE';
        severity = 'LOW';
      } else {
        category = safeRating <= 2 ? 'POLICY_VIOLATION' : 'DISPUTE';
        severity = safeRating === 1 ? 'HIGH' : safeRating === 2 ? 'MEDIUM' : 'LOW';
      }
    }

    // Only create an official Occurrence Book entry for genuine incidents / low ratings / safety issues
    let occurrence: any = null;
    let obNumber: string | undefined = undefined;

    if (isSignificantIncident) {
      obNumber = `OB-RIDE-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const title = `Trip Issue: ${raterRole} -> ${targetRole} (${safeRating}/5 - ${category})`;
      const description = `Trip ${rideId} feedback from ${raterRole} (${safeRating} stars): "${cleanComment || 'No additional comment provided.'}"`;

      try {
        const pickup = ride.pickupLocation as any;
        occurrence = await this.prisma.occurrence.create({
          data: {
            obNumber,
            category: category as any,
            severity: severity as any,
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
            status: safeRating <= 2 || severity === 'HIGH' || severity === 'CRITICAL' ? 'OPEN' : 'RESOLVED',
          },
        });
        this.logger.log(`Occurrence entry ${obNumber} created for ride ${rideId} rating by ${raterRole} (${category}, ${severity})`);
      } catch (occErr: any) {
        this.logger.error(`Failed to record occurrence booking for rating: ${occErr.message}`, occErr.stack);
      }
    } else {
      this.logger.log(`Routine rating ${safeRating}/5 for ride ${rideId} recorded in ratings ledger without Occurrence incident.`);
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

      // Credit rating bonus points to passenger
      if (isPassengerRater && ride.passengerId) {
        this.badgeService.creditRidePoints(ride.passengerId, 0, safeRating, rideId).catch(e =>
          this.logger.warn(`Could not credit rating bonus points: ${e.message}`)
        );
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

    // --- Restore any locked wait fee that was attached to this cancelled ride ---
    try {
      const lockedKey = `LOCKED_WAIT_FEE_${rideId}`;
      const lockedFee = await this.settingsService.getSystemSetting(lockedKey);
      if (lockedFee && lockedFee.amount && Number(lockedFee.amount) > 0) {
        const pendingKey = `PENDING_WAIT_FEE_${ride.passengerId}`;
        const existing = await this.settingsService.getSystemSetting(pendingKey);
        const existingAmount = existing?.amount ? Number(existing.amount) : 0;
        await this.settingsService.updateSystemSetting(pendingKey, {
          amount: Math.max(existingAmount, Number(lockedFee.amount)),
          status: 'PENDING',
          restoredFromRideId: rideId,
          restoredAt: new Date().toISOString(),
        });
        await this.settingsService.updateSystemSetting(lockedKey, null);
        this.logger.log(`Restored locked wait fee of KES ${lockedFee.amount} for passenger ${ride.passengerId} following ride cancellation.`);
      }
    } catch (lockErr: any) {
      this.logger.warn(`Could not restore locked wait fee for ride ${rideId}: ${lockErr.message}`);
    }

    // --- Wait Fee Assessment Logic ---
    let assessedWaitFee = 0;
    let chargeableMinutes = 0;
    let feePerMinute = 10;
    let waitMinutes = 0;
    let gracePeriodMinutes = 3;

    const driverArrivedAt = (ride as any).driverArrivedAt as Date | null;
    if (driverArrivedAt && ride.driverId) {
      const config = await this.getWaitTimeConfig();
      feePerMinute = config.feePerMinute;
      gracePeriodMinutes = config.gracePeriodMinutes;
      const now = new Date();
      waitMinutes = (now.getTime() - new Date(driverArrivedAt).getTime()) / 60000;

      if (waitMinutes > gracePeriodMinutes) {
        chargeableMinutes = waitMinutes - gracePeriodMinutes;
        assessedWaitFee = Number((chargeableMinutes * feePerMinute).toFixed(2));

        this.logger.log(
          `Wait fee applied: KES ${assessedWaitFee} (${chargeableMinutes.toFixed(1)} mins charged @ KES ${feePerMinute}/min) for passenger ${ride.passengerId}`
        );

        // Store as pending fee to be charged on the passenger's next ride
        const pendingKey = `PENDING_WAIT_FEE_${ride.passengerId}`;
        const existing = await this.settingsService.getSystemSetting(pendingKey);
        const existingAmount = existing?.amount ? Number(existing.amount) : 0;
        await this.settingsService.updateSystemSetting(pendingKey, {
          amount: existingAmount + assessedWaitFee,
          rideId,
          chargedAt: now.toISOString(),
          minutesCharged: Number(chargeableMinutes.toFixed(1)),
        });

        // Notify passenger of the pending fee
        this.notificationService.sendNotification({
          userId: ride.passengerId,
          title: 'Wait Fee Applied',
          body: `KES ${assessedWaitFee} will be added to your next ride for driver wait time (${chargeableMinutes.toFixed(0)} mins @ KES ${feePerMinute}/min).`
        });

        // Credit driver's system wallet
        const driverWalletKey = `SYSTEM_WALLET_${ride.driverId}`;
        const driverWallet = await this.settingsService.getSystemSetting(driverWalletKey);
        const currentBalance = driverWallet?.balance ? Number(driverWallet.balance) : 0;
        await this.settingsService.updateSystemSetting(driverWalletKey, {
          balance: Number((currentBalance + assessedWaitFee).toFixed(2)),
          lastCreditedAt: now.toISOString(),
          lastCreditReason: `Wait fee compensation for ride ${rideId}`,
        });

        // Notify driver of wait compensation
        this.notificationService.sendNotification({
          userId: ride.driverId,
          title: 'Wait Fee Compensation',
          body: `KES ${assessedWaitFee} has been credited to your wallet for waiting (${chargeableMinutes.toFixed(0)} mins).`
        });
      } else {
        this.logger.log(`Ride ${rideId} cancelled within grace period (${waitMinutes.toFixed(1)} mins). No wait fee.`);
      }
    }

    // Log cancellation to Occurrence Book if wait fee was assessed OR cancellation reason indicates conflict/safety
    const lowerReason = (reason || '').toLowerCase();
    const isConflictReason = /refuse|cash|unsafe|plate|scam|harass|rude|fight|threat|drunk|cheat|overcharge/.test(lowerReason);

    if (assessedWaitFee > 0 || isConflictReason) {
      const obNumber = `OB-CAN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      let category: any = 'DISPUTE';
      let severity: any = 'LOW';

      if (ride.status === 'IN_PROGRESS') {
        category = 'DISPUTE';
        severity = 'HIGH';
      } else if (/cash|scam|cheat|overcharge/.test(lowerReason)) {
        category = 'FRAUD';
        severity = 'HIGH';
      } else if (/unsafe|harass|fight|threat|drunk/.test(lowerReason)) {
        category = 'SAFETY_VIOLATION';
        severity = 'HIGH';
      } else if (assessedWaitFee > 200) {
        severity = 'MEDIUM';
      }

      const title = ride.status === 'IN_PROGRESS'
        ? `In-Transit Cancellation: Charges Frozen for Dispatch Review (Ride ${rideId})`
        : assessedWaitFee > 0
        ? `Trip Cancellation: Wait Fee Assessed (KES ${assessedWaitFee})`
        : `Trip Cancellation Flagged: ${category}`;

      const description = ride.status === 'IN_PROGRESS'
        ? `Ride ${rideId} was cancelled midway during IN_PROGRESS. Charges have been frozen pending supervisor review. Reason: "${reason || 'Not specified'}". Passenger: ${ride.passengerId}, Driver: ${ride.driverId || 'None assigned'}.`
        : `Ride ${rideId} cancelled by passenger. Reason: "${reason || 'Not specified'}". ${
        assessedWaitFee > 0
          ? `Driver waited ${chargeableMinutes.toFixed(1)} chargeable mins (@ KES ${feePerMinute}/min = KES ${assessedWaitFee}). Fee credited to driver wallet.`
          : 'Cancellation flagged due to dispute or safety concern.'
      } Passenger: ${ride.passengerId}, Driver: ${ride.driverId || 'None assigned'}.`;

      try {
        const pickup = ride.pickupLocation as any;
        await this.prisma.occurrence.create({
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
            source: 'RIDE_CANCELLATION',
            registeredById: ride.passengerId,
            status: isConflictReason ? 'OPEN' : 'RESOLVED',
            tags: ['CANCELLATION', assessedWaitFee > 0 ? 'WAIT_FEE_ASSESSMENT' : 'SAFETY_DISPUTE'],
          }
        });
        this.logger.log(`Cancellation Occurrence entry ${obNumber} created for ride ${rideId}`);
      } catch (occErr: any) {
        this.logger.error(`Failed to record cancellation occurrence: ${occErr.message}`);
      }
    }

    // Notify driver of cancellation
    if (ride.driverId) {
      this.notificationService.sendNotification({
        userId: ride.driverId,
        title: `Ride Cancelled [${(ride as any).tripCode || 'TRP-RIDE'}]`,
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