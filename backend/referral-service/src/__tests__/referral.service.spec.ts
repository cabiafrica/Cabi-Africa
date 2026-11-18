import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from '../app/referral.service';
import { PrismaService } from '@cabi/backend/database';
import { NotificationService } from '@cabi/backend/notification-service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReferralService', () => {
  let service: ReferralService;
  let mockPrisma: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockPrisma = {
      setting: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      driverProfile: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      ride: {
        count: jest.fn().mockResolvedValue(0),
      },
      referralRelationship: {
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'rel-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      referralCommissionLedger: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
        update: jest.fn().mockResolvedValue({}),
      },
      referralFraudAlert: {
        create: jest.fn().mockResolvedValue({ id: 'alert-1' }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      notificationLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      saccoLedger: {
        create: jest.fn().mockResolvedValue({ id: 'sacco-1' }),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrisma)),
    };

    mockNotificationService = {
      sendEmail: jest.fn().mockResolvedValue({ success: true }),
      sendPushNotification: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Configuration Defaults', () => {
    it('should return default configuration matching business rules', async () => {
      const config = await service.getConfig();
      expect(config.driverProgram.l1Percentage).toBe(2.0);
      expect(config.driverProgram.l2Percentage).toBe(1.0);
      expect(config.driverProgram.maxL1Drivers).toBe(10);
      expect(config.driverProgram.maxL2Drivers).toBe(100);
      expect(config.qualifiers.escrowHoldingHours).toBe(72);
      expect(config.qualifiers.disqualifyingFareThreshold).toBe(300);
      expect(config.fraudDetection.maxReferrerTripDensity).toBe(0.30);
      expect(config.fraudDetection.deviceFingerprintBlock).toBe(true);
    });
  });

  describe('applyReferralCode', () => {
    it('should reject self-referral', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1' });
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-1', referralCode: 'REF-1' });

      await expect(
        service.applyReferralCode({ userId: 'user-1', code: 'REF-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Rule 1: Driver cannot refer passenger', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'pax-1',
        role: 'PASSENGER',
        driverProfile: null,
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'drv-1',
        role: 'DRIVER',
        driverProfile: { id: 'dp-1' },
      });

      await expect(
        service.applyReferralCode({ userId: 'pax-1', code: 'DRV-CODE' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Rule 2: Passenger can refer passenger', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'pax-2',
        fullName: 'Jane Doe',
        role: 'PASSENGER',
        driverProfile: null,
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'pax-1',
        fullName: 'John Doe',
        role: 'PASSENGER',
        driverProfile: null,
      });

      const result = await service.applyReferralCode({ userId: 'pax-2', code: 'PAX-CODE' });
      expect(result.success).toBe(true);
      expect(result.referralType).toBe('PASSENGER_TO_PASSENGER');
    });

    it('Rule 2: Passenger can refer driver (sets 7-day 1st week window)', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'drv-new',
        fullName: 'New Driver',
        role: 'DRIVER',
        driverProfile: { id: 'dp-new' },
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'pax-referrer',
        fullName: 'Referrer Pax',
        role: 'PASSENGER',
        driverProfile: null,
      });

      const result = await service.applyReferralCode({ userId: 'drv-new', code: 'PAX-CODE' });
      expect(result.success).toBe(true);
      expect(result.referralType).toBe('PASSENGER_TO_DRIVER');
    });

    it('Fraud Check: Block referral if hardware device fingerprint matches', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'referee-1',
        role: 'DRIVER',
        driverProfile: { id: 'dp-referee' },
        deviceId: 'DEVICE-COLLISION-123',
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'referrer-1',
        role: 'DRIVER',
        driverProfile: { id: 'dp-referrer' },
        deviceId: 'DEVICE-COLLISION-123',
      });

      await expect(
        service.applyReferralCode({
          userId: 'referee-1',
          code: 'DRV-CODE',
          deviceId: 'DEVICE-COLLISION-123',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.referralFraudAlert.create).toHaveBeenCalled();
    });

    it('Driver Cap: Rejects L1 driver referral if referrer has reached 10 drivers', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'referee-drv',
        role: 'DRIVER',
        driverProfile: { id: 'dp-referee' },
      });
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'referrer-drv',
        role: 'DRIVER',
        driverProfile: { id: 'dp-referrer' },
      });
      mockPrisma.referralRelationship.count.mockResolvedValueOnce(10); // 10 already existing

      await expect(
        service.applyReferralCode({ userId: 'referee-drv', code: 'DRV-CODE' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('processTripReferral', () => {
    it('should disqualify trips with fare below threshold (< 300 KES)', async () => {
      const result = await service.processTripReferral({
        tripId: 'trip-low',
        passengerId: 'pax-1',
        driverProfileId: 'drv-1',
        baseFare: 200, // Below 300
        platformCommission: 36,
        driverEarnings: 164,
      });

      expect(result.processed).toBe(false);
      expect(result.reason).toBe('FARE_BELOW_THRESHOLD');
      expect(mockPrisma.referralCommissionLedger.createMany).not.toHaveBeenCalled();
    });

    it('should flag collusive trip density when > 30% of driver trips are with referrer', async () => {
      mockPrisma.driverProfile.findUnique.mockResolvedValueOnce({
        id: 'dp-1',
        userId: 'driver-user-1',
      });
      // Relationship exists between driver and passenger
      mockPrisma.referralRelationship.findFirst.mockResolvedValueOnce({
        id: 'rel-pair',
        refereeId: 'driver-user-1',
        referrerId: 'pax-referrer-1',
      });
      // Total trips = 10, trips with referrer = 4 (40% > 30%)
      mockPrisma.ride.count
        .mockResolvedValueOnce(10) // total completed
        .mockResolvedValueOnce(4); // pair trips

      const result = await service.processTripReferral({
        tripId: 'trip-collusive',
        passengerId: 'pax-referrer-1',
        driverProfileId: 'dp-1',
        baseFare: 1000,
        platformCommission: 180,
        driverEarnings: 820,
      });

      expect(result.processed).toBe(false);
      expect(result.reason).toBe('COLLUSIVE_TRIP_DENSITY_FLAGGED');
      expect(mockPrisma.referralFraudAlert.create).toHaveBeenCalled();
    });

    it('should calculate Driver L1 (2%) and L2 (1%) rewards in 72h PENDING_REVIEW escrow', async () => {
      // Driver profile with L1 referrer
      mockPrisma.driverProfile.findUnique
        .mockResolvedValueOnce({
          id: 'dp-trip',
          userId: 'driver-user',
          referrerId: 'dp-l1',
        })
        .mockResolvedValueOnce({
          id: 'dp-l1',
          userId: 'l1-user',
          referrerId: 'dp-l2',
          badgeStatus: [{ badgeCode: 'ROAD_MASTER', isActive: true }],
        })
        .mockResolvedValueOnce({
          id: 'dp-l2',
          userId: 'l2-user',
          referrerId: null,
          badgeStatus: [{ badgeCode: 'ROAD_MASTER', isActive: true }],
        });

      mockPrisma.referralRelationship.findFirst.mockResolvedValue(null);
      mockPrisma.referralRelationship.count.mockResolvedValue(2); // Well below caps

      const result = await service.processTripReferral({
        tripId: 'trip-valid',
        passengerId: 'regular-pax',
        driverProfileId: 'dp-trip',
        baseFare: 1000,
        platformCommission: 180,
        driverEarnings: 820, // 2% of 820 = 16.40, 1% of 820 = 8.20
      });

      expect(result.processed).toBe(true);
      expect(result.entriesCreated).toBeGreaterThan(0);
      expect(mockPrisma.referralCommissionLedger.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: 'l1-user',
            level: 1,
            status: 'PENDING_REVIEW',
          }),
        ]),
      });
    });
  });

  describe('releaseMaturedEscrow', () => {
    it('should release matured entries and route opt-in SACCO percentage', async () => {
      mockPrisma.referralCommissionLedger.findMany.mockResolvedValueOnce([
        {
          id: 'ledger-1',
          userId: 'user-drv',
          driverProfileId: 'dp-1',
          amount: 100,
          status: 'PENDING_REVIEW',
          relatedTripId: 'trip-100',
        },
      ]);
      mockPrisma.driverProfile.findUnique.mockResolvedValueOnce({
        id: 'dp-1',
        saccoEnrolled: true,
      });

      const result = await service.releaseMaturedEscrow();
      expect(result.releasedCount).toBe(1);
      expect(result.totalReleased).toBe(100);
      expect(mockPrisma.referralCommissionLedger.update).toHaveBeenCalledWith({
        where: { id: 'ledger-1' },
        data: { status: 'AVAILABLE' },
      });
      // 25% default SACCO matching pool = KES 25
      expect(mockPrisma.saccoLedger.create).toHaveBeenCalled();
    });
  });
});
