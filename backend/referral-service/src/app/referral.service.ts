import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LedgerEntryType, Prisma } from '@prisma/client';
import { PrismaService } from '@cabi/backend/database';
import { NotificationService } from '@cabi/backend/notification-service';

export const REFERRAL_CONFIG_KEY = 'referral_config';
export const PROMO_CONFIG_KEY = 'promo_config';

export interface ReferralConfig {
  driverProgram: {
    enabled: boolean;
    l1Percentage: number; // 2%
    l2Percentage: number; // 1%
    maxL1Drivers: number; // 10
    maxL2Drivers: number; // 100
  };
  passengerProgram: {
    enabled: boolean; // Admin promo toggle
    l1Percentage: number; // 2%
    l2Percentage: number; // 1%
    paxReferDriverFirstWeekPercent: number; // e.g. 2% on driver's 1st week
    firstWeekDurationDays: number; // 7 days
    startDate?: string;
    endDate?: string;
  };
  qualifiers: {
    requiredBadgeCode: string; // e.g. 'ROAD_MASTER' or 'ELITE'
    grandfatherExisting: boolean; // true - previously referred remain grandfathered
    disqualifyingFareThreshold: number; // 300 KES
    maxPlatformFeeDeductionPercent: number; // 40% max deduction from platform net
    escrowHoldingHours: number; // 72 hours
  };
  fraudDetection: {
    deviceFingerprintBlock: boolean; // Block if IMEI/device ID matches referrer
    maxReferrerTripDensity: number; // 0.30 (30% trips between pair)
    minTripsForDensityCheck: number; // 5
    immediateSuspension: boolean; // true
  };
  saccoMatchingPool: {
    enabled: boolean; // Driver opt-in
    defaultSavingsPercent: number; // e.g. 25% to SACCO
  };
}

export interface PromoConfig {
  isActive: boolean;
  startDate: string;
  endDate: string;
  splits: {
    system: number;
    driver: number;
    upline1: number;
    upline2: number;
  };
  requiredBadgeId: string;
}

export interface TripReferralInput {
  tripId: string;
  passengerId: string;
  driverProfileId: string;
  baseFare: number;
  platformCommission: number;
  driverEarnings: number;
}

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) { }

  /**
   * Retrieves active referral configuration or falls back to system defaults.
   */
  async getConfig(): Promise<ReferralConfig> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: REFERRAL_CONFIG_KEY },
    });

    if (setting && setting.value) {
      return setting.value as unknown as ReferralConfig;
    }

    const defaultConfig: ReferralConfig = {
      driverProgram: {
        enabled: true,
        l1Percentage: 2.0,
        l2Percentage: 1.0,
        maxL1Drivers: 10,
        maxL2Drivers: 100,
      },
      passengerProgram: {
        enabled: true,
        l1Percentage: 2.0,
        l2Percentage: 1.0,
        paxReferDriverFirstWeekPercent: 2.0,
        firstWeekDurationDays: 7,
      },
      qualifiers: {
        requiredBadgeCode: 'ROAD_MASTER',
        grandfatherExisting: true,
        disqualifyingFareThreshold: 300,
        maxPlatformFeeDeductionPercent: 40.0,
        escrowHoldingHours: 72,
      },
      fraudDetection: {
        deviceFingerprintBlock: true,
        maxReferrerTripDensity: 0.30,
        minTripsForDensityCheck: 5,
        immediateSuspension: true,
      },
      saccoMatchingPool: {
        enabled: true,
        defaultSavingsPercent: 25.0,
      },
    };

    return defaultConfig;
  }

  /**
   * Updates global referral configuration.
   */
  async updateConfig(config: ReferralConfig): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key: REFERRAL_CONFIG_KEY },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { value: config as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { key: REFERRAL_CONFIG_KEY, value: config as any },
    });
    this.logger.log('Referral configuration successfully updated.');
  }

  async getPromoConfig(): Promise<PromoConfig> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: PROMO_CONFIG_KEY },
    });

    if (setting && setting.value) {
      return setting.value as unknown as PromoConfig;
    }

    return {
      isActive: false,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      splits: { system: 10, driver: 80, upline1: 5, upline2: 5 },
      requiredBadgeId: '',
    };
  }

  async updatePromoConfig(config: PromoConfig): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key: PROMO_CONFIG_KEY },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { value: config as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { key: PROMO_CONFIG_KEY, value: config as any },
    });
  }

  /**
   * Applies a referral code with strict role checks, hardware fingerprint anti-fraud,
   * cyclic referral protection, and driver cap enforcement.
   */
  async applyReferralCode(params: {
    userId: string;
    code: string;
    userType?: string;
    deviceId?: string;
    imeiHash?: string;
    ipAddress?: string;
  }) {
    const { userId, code, deviceId, imeiHash, ipAddress } = params;

    // 1. Fetch referee
    const referee = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driverProfile: true },
    });

    if (!referee) {
      throw new NotFoundException('Referee user not found.');
    }

    if (referee.referredById) {
      throw new BadRequestException('User already has an attributed referrer.');
    }

    // 2. Validate referral code & Referrer
    const normalizedCode = code.trim().toUpperCase();
    const referrer = await this.prisma.user.findFirst({
      where: { referralCode: normalizedCode },
      include: {
        driverProfile: {
          include: { badgeStatus: true },
        },
        badges: {
          include: { badge: true },
        },
      },
    });

    if (!referrer) {
      throw new NotFoundException(`Referral code '${code}' is invalid.`);
    }

    if (referrer.id === userId) {
      throw new BadRequestException('Self-referral is strictly prohibited.');
    }

    const isReferrerDriver = Boolean(referrer.driverProfile || referrer.role === 'DRIVER');
    const isRefereeDriver = Boolean(referee.driverProfile || referee.role === 'DRIVER');

    // 3. ROLE-BASED CONSTRAINTS (Rule #1 & #2)
    // Driver can refer drivers only and cannot refer passenger
    if (isReferrerDriver && !isRefereeDriver) {
      throw new ForbiddenException(
        'Drivers are only authorized to refer fellow drivers. Referring passengers is not permitted.',
      );
    }
    // Passenger can refer both passengers and drivers (Allowed)

    const config = await this.getConfig();

    // 4. HARDWARE DEVICE FINGERPRINTING ANTI-FRAUD
    if (config.fraudDetection.deviceFingerprintBlock) {
      const activeDeviceId = deviceId || referee.deviceId;
      const activeImeiHash = imeiHash || referee.imeiHash;

      if (activeDeviceId || activeImeiHash) {
        const matchesReferrer =
          (activeDeviceId && activeDeviceId === referrer.deviceId) ||
          (activeImeiHash && activeImeiHash === referrer.imeiHash);

        if (matchesReferrer) {
          // Log Fraud Alert
          await (this.prisma as any).referralFraudAlert.create({
            data: {
              userId: referee.id,
              relatedUserId: referrer.id,
              ruleViolated: 'DEVICE_FINGERPRINT_MATCH',
              severity: 'CRITICAL',
              evidence: {
                refereeDeviceId: activeDeviceId,
                referrerDeviceId: referrer.deviceId,
                refereeImeiHash: activeImeiHash,
                referrerImeiHash: referrer.imeiHash,
                ipAddress,
              },
            },
          });

          throw new ForbiddenException(
            'Referral blocked: Duplicate hardware device fingerprint detected.',
          );
        }
      }
    }

    // 5. CYCLIC LOOP PREVENTION
    let currentCheckId: string | null = referrer.referredById;
    const visited = new Set<string>([referrer.id]);
    while (currentCheckId) {
      if (currentCheckId === referee.id) {
        throw new ForbiddenException(
          'Cyclic referral loop detected. Downline user cannot refer an upline user.',
        );
      }
      if (visited.has(currentCheckId)) break;
      visited.add(currentCheckId);

      const uplineUser: any = await this.prisma.user.findUnique({
        where: { id: currentCheckId },
        select: { referredById: true },
      });
      currentCheckId = uplineUser?.referredById || null;
    }

    // 6. DRIVER LEVEL 1 CAP CHECK (Up to 10 drivers)
    let referralType: 'DRIVER_TO_DRIVER' | 'PASSENGER_TO_PASSENGER' | 'PASSENGER_TO_DRIVER' =
      'PASSENGER_TO_PASSENGER';

    if (isReferrerDriver && isRefereeDriver) {
      referralType = 'DRIVER_TO_DRIVER';

      const existingL1DriversCount = await (this.prisma as any).referralRelationship.count({
        where: {
          referrerId: referrer.id,
          type: 'DRIVER_TO_DRIVER',
          isActive: true,
        },
      });

      if (existingL1DriversCount >= config.driverProgram.maxL1Drivers) {
        throw new ForbiddenException(
          `Referrer has already reached the maximum limit of ${config.driverProgram.maxL1Drivers} active Level-1 drivers.`,
        );
      }
    } else if (!isReferrerDriver && isRefereeDriver) {
      referralType = 'PASSENGER_TO_DRIVER';
    }

    // 7. BADGE QUALIFICATION SNAPSHOT (Grandfathering Support)
    const requiredBadge = config.qualifiers.requiredBadgeCode;
    let qualifiesForBadge = true;

    if (requiredBadge) {
      if (isReferrerDriver && referrer.driverProfile) {
        const hasBadge = referrer.driverProfile.badgeStatus?.some(
          (b: any) => b.badgeCode === requiredBadge && b.isActive,
        );
        qualifiesForBadge = Boolean(hasBadge);
      } else {
        const hasBadge = referrer.badges?.some(
          (b: any) => b.badge?.code === requiredBadge,
        );
        qualifiesForBadge = Boolean(hasBadge);
      }
    }

    // 8. UPDATE MODELS & CREATE RELATIONSHIP
    const firstWeekExpiresAt =
      referralType === 'PASSENGER_TO_DRIVER'
        ? new Date(Date.now() + (config.passengerProgram.firstWeekDurationDays || 7) * 24 * 60 * 60 * 1000)
        : null;

    await this.prisma.$transaction(async (tx: any) => {
      // Update User table
      await tx.user.update({
        where: { id: referee.id },
        data: {
          referredById: referrer.id,
          deviceId: deviceId || referee.deviceId,
          imeiHash: imeiHash || referee.imeiHash,
          registrationIp: ipAddress || referee.registrationIp,
        },
      });

      // Synchronize DriverProfile referrerId (Fixing Bug #1)
      if (isRefereeDriver && referee.driverProfile && referrer.driverProfile) {
        await tx.driverProfile.update({
          where: { id: referee.driverProfile.id },
          data: { referrerId: referrer.driverProfile.id },
        });
      }

      // Create ReferralRelationship entity
      await tx.referralRelationship.create({
        data: {
          referrerId: referrer.id,
          refereeId: referee.id,
          referrerDriverProfileId: referrer.driverProfile?.id || null,
          refereeDriverProfileId: referee.driverProfile?.id || null,
          type: referralType,
          isActive: true,
          isGrandfathered: true, // Grandfathered for future rewards
          qualifiedBadgeId: qualifiesForBadge ? requiredBadge : null,
          firstWeekExpiresAt,
          driverMilestoneTripsRequired: 10,
          driverMilestoneTripsCompleted: 0,
        },
      });

      // Notification log for referrer
      await tx.notificationLog.create({
        data: {
          userId: referrer.id,
          title: 'New Successful Referral!',
          body: `User ${referee.fullName} has joined using your referral code.`,
          type: 'REFERRAL_ATTRIBUTED',
          channel: 'ALL',
          metadata: {
            refereeId: referee.id,
            refereeName: referee.fullName,
            type: referralType,
          },
        },
      });
    });

    this.logger.log(
      `Referral applied successfully: Referee ${referee.id} linked to Referrer ${referrer.id} as ${referralType}`,
    );

    return {
      success: true,
      referrerId: referrer.id,
      referrerName: referrer.fullName,
      referralType,
    };
  }

  /**
   * Processes completed ride activities and calculates multi-tier referral earnings.
   * - Deducted strictly from the platform's commission (driver net untouched).
   * - Driver: 2% Level 1 (max 10 drivers), 1% Level 2 (max 100 drivers).
   * - Passenger: 2% Level 1, 1% Level 2 (promotional).
   * - Passenger referring Driver: x% of driver's 1st week earnings.
   * - Fraud check: Blocks if > 30% of driver trips are with referrer.
   * - Escrow hold: 72 hours in PENDING_REVIEW.
   */
  async processTripReferral(input: TripReferralInput): Promise<{
    processed: boolean;
    reason?: string;
    totalReferralDeduction: number;
    entriesCreated: number;
  }> {
    const { tripId, passengerId, driverProfileId, baseFare, platformCommission, driverEarnings } = input;
    const config = await this.getConfig();

    // 1. Minimum Qualifying Fare Check (Default KES 300)
    if (baseFare < config.qualifiers.disqualifyingFareThreshold) {
      this.logger.log(
        `Trip ${tripId} fare (KES ${baseFare}) below referral threshold (KES ${config.qualifiers.disqualifyingFareThreshold}). Skipping referral distribution.`,
      );
      return { processed: false, reason: 'FARE_BELOW_THRESHOLD', totalReferralDeduction: 0, entriesCreated: 0 };
    }

    // 2. Margin Safety Cap
    const maxReferralPool = platformCommission * (config.qualifiers.maxPlatformFeeDeductionPercent / 100);
    let remainingPool = maxReferralPool;
    let totalReferralDeduction = 0;
    const ledgerEntriesToCreate: any[] = [];
    const escrowReleaseAt = new Date(Date.now() + config.qualifiers.escrowHoldingHours * 60 * 60 * 1000);

    // Retrieve Driver & Passenger Details
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { user: true },
    });

    if (!driverProfile) {
      return { processed: false, reason: 'DRIVER_NOT_FOUND', totalReferralDeduction: 0, entriesCreated: 0 };
    }

    // 3. TRIP COLLUSION & DIVERSITY ANTI-FRAUD CHECK (> 30% of trips with referrer)
    if (config.fraudDetection.maxReferrerTripDensity > 0) {
      const relationship = await (this.prisma as any).referralRelationship.findFirst({
        where: {
          OR: [
            { refereeId: driverProfile.userId, referrerId: passengerId },
            { refereeId: passengerId, referrerId: driverProfile.userId },
          ],
        },
      });

      if (relationship) {
        const totalCompletedDriverTrips = await this.prisma.ride.count({
          where: { driverId: driverProfileId, status: 'COMPLETED' },
        });

        if (totalCompletedDriverTrips >= config.fraudDetection.minTripsForDensityCheck) {
          const tripsWithReferrer = await this.prisma.ride.count({
            where: {
              driverId: driverProfileId,
              passengerId: passengerId,
              status: 'COMPLETED',
            },
          });

          const density = tripsWithReferrer / totalCompletedDriverTrips;

          if (density > config.fraudDetection.maxReferrerTripDensity) {
            this.logger.warn(
              `FRAUD ALERT: High trip density (${(density * 100).toFixed(1)}%) detected between driver ${driverProfileId} and referrer passenger ${passengerId}`,
            );

            // Record Fraud Alert
            await (this.prisma as any).referralFraudAlert.create({
              data: {
                userId: driverProfile.userId,
                relatedUserId: passengerId,
                ruleViolated: 'COLLUSIVE_TRIP_DENSITY',
                severity: 'HIGH',
                evidence: {
                  tripId,
                  totalCompletedDriverTrips,
                  tripsWithReferrer,
                  density,
                  threshold: config.fraudDetection.maxReferrerTripDensity,
                },
              },
            });

            // Suspend referral relationship if immediate suspension active
            if (config.fraudDetection.immediateSuspension) {
              await (this.prisma as any).referralRelationship.update({
                where: { id: relationship.id },
                data: { isActive: false },
              });

              await this.notifyUser(
                driverProfile.userId,
                'Referral Program Notice',
                'Your referral yields have been temporarily suspended due to collusive trip density checks.',
                'FRAUD_ALERT',
              );
            }

            return {
              processed: false,
              reason: 'COLLUSIVE_TRIP_DENSITY_FLAGGED',
              totalReferralDeduction: 0,
              entriesCreated: 0,
            };
          }
        }
      }
    }

    // 4. DRIVER REFERRAL REWARDS (Driver -> Driver: L1 2%, L2 1%)
    if (config.driverProgram.enabled && driverProfile.referrerId) {
      // Fetch Level 1 Driver Referrer
      const l1DriverProfile = await this.prisma.driverProfile.findUnique({
        where: { id: driverProfile.referrerId },
        include: { user: true, badgeStatus: true },
      });

      if (l1DriverProfile) {
        // Verify L1 Cap (Up to 10 drivers)
        const l1ActiveCount = await (this.prisma as any).referralRelationship.count({
          where: {
            referrerDriverProfileId: l1DriverProfile.id,
            type: 'DRIVER_TO_DRIVER',
            isActive: true,
          },
        });

        const isL1Qualified = await this.checkUserQualification(
          l1DriverProfile.userId,
          l1DriverProfile.id,
          config.qualifiers.requiredBadgeCode,
        );

        if (isL1Qualified && l1ActiveCount <= config.driverProgram.maxL1Drivers) {
          const l1GrossCommission = driverEarnings * (config.driverProgram.l1Percentage / 100);
          const l1ActualCommission = Math.min(l1GrossCommission, remainingPool);

          if (l1ActualCommission > 0) {
            remainingPool -= l1ActualCommission;
            totalReferralDeduction += l1ActualCommission;

            ledgerEntriesToCreate.push({
              userId: l1DriverProfile.userId,
              driverProfileId: l1DriverProfile.id,
              sourceUserId: driverProfile.userId,
              sourceDriverProfileId: driverProfile.id,
              relatedTripId: tripId,
              amount: new Prisma.Decimal(l1ActualCommission.toFixed(2)),
              level: 1,
              basisAmount: new Prisma.Decimal(driverEarnings.toFixed(2)),
              percentage: new Prisma.Decimal(config.driverProgram.l1Percentage),
              status: 'PENDING_REVIEW',
              escrowReleaseAt,
            });
          }
        }

        // Level 2 Driver Referrer (Upline of L1 Driver: 1%, up to 100 drivers)
        if (l1DriverProfile.referrerId && remainingPool > 0) {
          const l2DriverProfile = await this.prisma.driverProfile.findUnique({
            where: { id: l1DriverProfile.referrerId },
            include: { user: true },
          });

          if (l2DriverProfile) {
            const l2ActiveCount = await (this.prisma as any).referralRelationship.count({
              where: {
                referrerDriverProfileId: l2DriverProfile.id,
                type: 'DRIVER_TO_DRIVER',
                isActive: true,
              },
            });

            const isL2Qualified = await this.checkUserQualification(
              l2DriverProfile.userId,
              l2DriverProfile.id,
              config.qualifiers.requiredBadgeCode,
            );

            if (isL2Qualified && l2ActiveCount <= config.driverProgram.maxL2Drivers) {
              const l2GrossCommission = driverEarnings * (config.driverProgram.l2Percentage / 100);
              const l2ActualCommission = Math.min(l2GrossCommission, remainingPool);

              if (l2ActualCommission > 0) {
                remainingPool -= l2ActualCommission;
                totalReferralDeduction += l2ActualCommission;

                ledgerEntriesToCreate.push({
                  userId: l2DriverProfile.userId,
                  driverProfileId: l2DriverProfile.id,
                  sourceUserId: driverProfile.userId,
                  sourceDriverProfileId: driverProfile.id,
                  relatedTripId: tripId,
                  amount: new Prisma.Decimal(l2ActualCommission.toFixed(2)),
                  level: 2,
                  basisAmount: new Prisma.Decimal(driverEarnings.toFixed(2)),
                  percentage: new Prisma.Decimal(config.driverProgram.l2Percentage),
                  status: 'PENDING_REVIEW',
                  escrowReleaseAt,
                });
              }
            }
          }
        }
      }
    }

    // 5. PASSENGER REFERRING DRIVER (First Week Incentive: e.g. 2% of Driver Earnings)
    const paxDriverRel = await (this.prisma as any).referralRelationship.findFirst({
      where: {
        refereeId: driverProfile.userId,
        type: 'PASSENGER_TO_DRIVER',
        isActive: true,
      },
    });

    if (paxDriverRel && remainingPool > 0) {
      const now = new Date();
      if (paxDriverRel.firstWeekExpiresAt && now <= new Date(paxDriverRel.firstWeekExpiresAt)) {
        const paxFirstWeekPct = config.passengerProgram.paxReferDriverFirstWeekPercent || 2.0;
        const paxCommission = Math.min(
          driverEarnings * (paxFirstWeekPct / 100),
          remainingPool,
        );

        if (paxCommission > 0) {
          remainingPool -= paxCommission;
          totalReferralDeduction += paxCommission;

          ledgerEntriesToCreate.push({
            userId: paxDriverRel.referrerId,
            driverProfileId: null,
            sourceUserId: driverProfile.userId,
            sourceDriverProfileId: driverProfile.id,
            relatedTripId: tripId,
            amount: new Prisma.Decimal(paxCommission.toFixed(2)),
            level: 1,
            basisAmount: new Prisma.Decimal(driverEarnings.toFixed(2)),
            percentage: new Prisma.Decimal(paxFirstWeekPct),
            status: 'PENDING_REVIEW',
            escrowReleaseAt,
          });
        }
      }

      // Increment completed trips towards milestone
      await (this.prisma as any).referralRelationship.update({
        where: { id: paxDriverRel.id },
        data: {
          driverMilestoneTripsCompleted: { increment: 1 },
        },
      });
    }

    // 6. PASSENGER REFERRAL REWARDS (Passenger -> Passenger: L1 2%, L2 1% of Spend)
    if (config.passengerProgram.enabled && remainingPool > 0) {
      const passenger = await this.prisma.user.findUnique({
        where: { id: passengerId },
        select: { referredById: true },
      });

      if (passenger?.referredById) {
        const l1PaxReferrer = await this.prisma.user.findUnique({
          where: { id: passenger.referredById },
          select: { id: true, role: true },
        });

        // Passenger cannot benefit from driver earnings, but benefits from passenger spend
        if (l1PaxReferrer && l1PaxReferrer.role === 'PASSENGER') {
          const isPaxQualified = await this.checkUserQualification(
            l1PaxReferrer.id,
            null,
            config.qualifiers.requiredBadgeCode,
          );

          if (isPaxQualified) {
            const paxL1Gross = baseFare * (config.passengerProgram.l1Percentage / 100);
            const paxL1Actual = Math.min(paxL1Gross, remainingPool);

            if (paxL1Actual > 0) {
              remainingPool -= paxL1Actual;
              totalReferralDeduction += paxL1Actual;

              ledgerEntriesToCreate.push({
                userId: l1PaxReferrer.id,
                driverProfileId: null,
                sourceUserId: passengerId,
                sourceDriverProfileId: null,
                relatedTripId: tripId,
                amount: new Prisma.Decimal(paxL1Actual.toFixed(2)),
                level: 1,
                basisAmount: new Prisma.Decimal(baseFare.toFixed(2)),
                percentage: new Prisma.Decimal(config.passengerProgram.l1Percentage),
                status: 'PENDING_REVIEW',
                escrowReleaseAt,
              });
            }
          }

          // Level 2 Passenger Referrer
          const l1User = await this.prisma.user.findUnique({
            where: { id: l1PaxReferrer.id },
            select: { referredById: true },
          });

          if (l1User?.referredById && remainingPool > 0) {
            const l2PaxReferrer = await this.prisma.user.findUnique({
              where: { id: l1User.referredById },
              select: { id: true, role: true },
            });

            if (l2PaxReferrer && l2PaxReferrer.role === 'PASSENGER') {
              const isL2Qualified = await this.checkUserQualification(
                l2PaxReferrer.id,
                null,
                config.qualifiers.requiredBadgeCode,
              );

              if (isL2Qualified) {
                const paxL2Gross = baseFare * (config.passengerProgram.l2Percentage / 100);
                const paxL2Actual = Math.min(paxL2Gross, remainingPool);

                if (paxL2Actual > 0) {
                  remainingPool -= paxL2Actual;
                  totalReferralDeduction += paxL2Actual;

                  ledgerEntriesToCreate.push({
                    userId: l2PaxReferrer.id,
                    driverProfileId: null,
                    sourceUserId: passengerId,
                    sourceDriverProfileId: null,
                    relatedTripId: tripId,
                    amount: new Prisma.Decimal(paxL2Actual.toFixed(2)),
                    level: 2,
                    basisAmount: new Prisma.Decimal(baseFare.toFixed(2)),
                    percentage: new Prisma.Decimal(config.passengerProgram.l2Percentage),
                    status: 'PENDING_REVIEW',
                    escrowReleaseAt,
                  });
                }
              }
            }
          }
        }
      }
    }

    // 7. PERSIST LEDGER ENTRIES IN BATCH
    if (ledgerEntriesToCreate.length > 0) {
      await (this.prisma as any).referralCommissionLedger.createMany({
        data: ledgerEntriesToCreate,
      });

      this.logger.log(
        `Successfully created ${ledgerEntriesToCreate.length} referral ledger entries for Trip ${tripId}. Total deducted from platform fee: KES ${totalReferralDeduction.toFixed(2)}.`,
      );
    }

    return {
      processed: true,
      totalReferralDeduction,
      entriesCreated: ledgerEntriesToCreate.length,
    };
  }

  /**
   * Releases matured referral earnings from PENDING_REVIEW (72-hour escrow) to AVAILABLE.
   * If driver has SACCO matching pool opt-in, automatically routes portion to SaccoLedger.
   */
  async releaseMaturedEscrow(): Promise<{ releasedCount: number; totalReleased: number }> {
    const now = new Date();
    const pendingEntries = await (this.prisma as any).referralCommissionLedger.findMany({
      where: {
        status: 'PENDING_REVIEW',
        escrowReleaseAt: { lte: now },
        isFraudSuspended: false,
      },
    });

    if (pendingEntries.length === 0) {
      return { releasedCount: 0, totalReleased: 0 };
    }

    const config = await this.getConfig();
    let totalReleased = 0;

    for (const entry of pendingEntries) {
      const amount = Number(entry.amount);
      totalReleased += amount;

      await this.prisma.$transaction(async (tx: any) => {
        // Mark ledger entry as AVAILABLE
        await tx.referralCommissionLedger.update({
          where: { id: entry.id },
          data: { status: 'AVAILABLE' },
        });

        // Optional SACCO Wealth Matching Pool routing for Drivers
        if (config.saccoMatchingPool.enabled && entry.driverProfileId) {
          const driverProfile = await tx.driverProfile.findUnique({
            where: { id: entry.driverProfileId },
            select: { saccoEnrolled: true },
          });

          if (driverProfile?.saccoEnrolled) {
            const saccoAllocation =
              amount * (config.saccoMatchingPool.defaultSavingsPercent / 100);

            if (saccoAllocation > 0) {
              await tx.saccoLedger.create({
                data: {
                  driverId: entry.driverProfileId,
                  amount: new Prisma.Decimal(saccoAllocation.toFixed(2)),
                  type: 'REFERRAL_INCENTIVE_SAVINGS',
                  relatedTripId: entry.relatedTripId,
                },
              });
            }
          }
        }

        // Notify user of available payout
        await tx.notificationLog.create({
          data: {
            userId: entry.userId,
            title: 'Referral Bonus Available!',
            body: `KES ${amount.toFixed(2)} from trip referral has cleared the 72-hour review and is now available in your balance.`,
            type: 'ESCROW_RELEASED',
            channel: 'ALL',
            metadata: {
              ledgerId: entry.id,
              amount,
              relatedTripId: entry.relatedTripId,
            },
          },
        });
      });
    }

    this.logger.log(`Released ${pendingEntries.length} matured escrow entries totaling KES ${totalReleased.toFixed(2)}.`);
    return { releasedCount: pendingEntries.length, totalReleased };
  }

  /**
   * Helper: Check if user meets badge qualifier requirements or is grandfathered.
   */
  private async checkUserQualification(
    userId: string,
    driverProfileId: string | null,
    requiredBadgeCode?: string,
  ): Promise<boolean> {
    if (!requiredBadgeCode) return true;

    // Check grandfathered relationships
    const grandfathered = await (this.prisma as any).referralRelationship.findFirst({
      where: { referrerId: userId, isGrandfathered: true },
    });

    if (grandfathered) {
      return true; // Grandfathered for existing downlines
    }

    if (driverProfileId) {
      const driver = await this.prisma.driverProfile.findUnique({
        where: { id: driverProfileId },
        include: { badgeStatus: true },
      });
      return Boolean(
        driver?.badgeStatus?.some(
          (b: any) => b.badgeCode === requiredBadgeCode && b.isActive,
        ),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true } },
      },
    });

    return Boolean(
      user?.badges?.some((b: any) => b.badge?.code === requiredBadgeCode),
    );
  }

  /**
   * Dispatches notifications across In-App log, Push, and Email.
   */
  async notifyUser(userId: string, title: string, body: string, type: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    // 1. Immutable database log
    await (this.prisma as any).notificationLog.create({
      data: {
        userId,
        title,
        body,
        type,
        channel: 'ALL',
      },
    });

    // 2. Email Notification
    if (user?.email) {
      try {
        await this.notificationService.sendEmail(user.email, title, body);
      } catch (err: any) {
        this.logger.warn(`Could not dispatch email to ${user.email}: ${err.message}`);
      }
    }
  }

  /**
   * Returns driver referral performance, breakdown, and grandfathered status.
   */
  async getDriverCommissions(driverProfileId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { user: true },
    });

    if (!driver) throw new NotFoundException('Driver profile not found.');

    const [availableSum, pendingSum, l1Count, l2Count, history] = await Promise.all([
      (this.prisma as any).referralCommissionLedger.aggregate({
        _sum: { amount: true },
        where: { driverProfileId, status: 'AVAILABLE' },
      }),
      (this.prisma as any).referralCommissionLedger.aggregate({
        _sum: { amount: true },
        where: { driverProfileId, status: 'PENDING_REVIEW' },
      }),
      (this.prisma as any).referralRelationship.count({
        where: { referrerDriverProfileId: driverProfileId, type: 'DRIVER_TO_DRIVER', isActive: true },
      }),
      (this.prisma as any).referralRelationship.count({
        where: { referrerDriverProfileId: driverProfileId, type: 'DRIVER_TO_DRIVER' },
      }),
      (this.prisma as any).referralCommissionLedger.findMany({
        where: { driverProfileId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      availableBalance: Number(availableSum._sum?.amount || 0),
      pendingEscrowBalance: Number(pendingSum._sum?.amount || 0),
      level1DriversCount: l1Count,
      level1DriversCap: 10,
      level2DriversCount: l2Count,
      level2DriversCap: 100,
      isGrandfathered: true,
      history: history.map((h: any) => ({
        id: h.id,
        amount: Number(h.amount),
        level: h.level,
        status: h.status,
        escrowReleaseAt: h.escrowReleaseAt,
        relatedTripId: h.relatedTripId,
        createdAt: h.createdAt,
      })),
    };
  }

  /**
   * Returns passenger referral performance and active first-week driver bonuses.
   */
  async getPassengerCommissions(userId: string) {
    const [availableSum, pendingSum, paxCount, driverCount, history] = await Promise.all([
      (this.prisma as any).referralCommissionLedger.aggregate({
        _sum: { amount: true },
        where: { userId, status: 'AVAILABLE' },
      }),
      (this.prisma as any).referralCommissionLedger.aggregate({
        _sum: { amount: true },
        where: { userId, status: 'PENDING_REVIEW' },
      }),
      (this.prisma as any).referralRelationship.count({
        where: { referrerId: userId, type: 'PASSENGER_TO_PASSENGER', isActive: true },
      }),
      (this.prisma as any).referralRelationship.count({
        where: { referrerId: userId, type: 'PASSENGER_TO_DRIVER', isActive: true },
      }),
      (this.prisma as any).referralCommissionLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      availableBalance: Number(availableSum._sum?.amount || 0),
      pendingEscrowBalance: Number(pendingSum._sum?.amount || 0),
      referredPassengersCount: paxCount,
      referredDriversCount: driverCount,
      history: history.map((h: any) => ({
        id: h.id,
        amount: Number(h.amount),
        level: h.level,
        status: h.status,
        escrowReleaseAt: h.escrowReleaseAt,
        relatedTripId: h.relatedTripId,
        createdAt: h.createdAt,
      })),
    };
  }

  /**
   * Lists in-app notification logs for audit & conflict resolution.
   */
  async getNotificationLogs(userId: string) {
    return (this.prisma as any).notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Lists unresolved fraud alerts for administrative review.
   */
  async getFraudAlerts() {
    return (this.prisma as any).referralFraudAlert.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        relatedUser: { select: { id: true, fullName: true, email: true, phone: true } },
      },
      take: 100,
    });
  }

  /**
   * Resolves a fraud alert and unfreezes payouts.
   */
  async resolveFraudAlert(alertId: string, resolutionAction: 'UNFREEZE' | 'CONFIRM_FRAUD') {
    const alert = await (this.prisma as any).referralFraudAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) throw new NotFoundException('Fraud alert not found.');

    await this.prisma.$transaction(async (tx: any) => {
      await tx.referralFraudAlert.update({
        where: { id: alertId },
        data: { isResolved: true },
      });

      if (resolutionAction === 'UNFREEZE' && alert.relatedUserId) {
        await tx.referralRelationship.updateMany({
          where: {
            OR: [
              { refereeId: alert.userId, referrerId: alert.relatedUserId },
              { refereeId: alert.relatedUserId, referrerId: alert.userId },
            ],
          },
          data: { isActive: true },
        });

        await tx.notificationLog.create({
          data: {
            userId: alert.userId,
            title: 'Referral Status Restored',
            body: 'Following administrative review, your referral account status has been restored.',
            type: 'FRAUD_CLEARED',
            channel: 'ALL',
          },
        });
      } else if (resolutionAction === 'CONFIRM_FRAUD') {
        await tx.referralCommissionLedger.updateMany({
          where: {
            userId: alert.userId,
            status: 'PENDING_REVIEW',
          },
          data: { status: 'CANCELLED', disqualificationReason: 'CONFIRMED_FRAUD_COLLUSION' },
        });
      }
    });

    return { success: true, alertId, resolutionAction };
  }

  // --- Backward Compatible Helper Methods ---
  async getReferralCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    return { code: user?.referralCode };
  }

  async getMyCommissions(driverId: string) {
    return this.getDriverCommissions(driverId);
  }

  async getDownline(userId: string, maxLevel = 2) {
    return this.fetchDownlineRecursive(userId, 1, maxLevel);
  }

  private async fetchDownlineRecursive(userId: string, currentLevel: number, maxLevel: number): Promise<any[]> {
    if (currentLevel > maxLevel) return [];

    const users = await this.prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        fullName: true,
        role: true,
        createdAt: true,
        status: true,
      },
    });

    const downline = await Promise.all(
      users.map(async (user) => {
        const children = await this.fetchDownlineRecursive(user.id, currentLevel + 1, maxLevel);
        return {
          id: user.id,
          name: user.fullName,
          status: (user as any).status || 'ACTIVE',
          level: currentLevel,
          joinedAt: user.createdAt,
          children,
        };
      }),
    );

    return downline;
  }
}
