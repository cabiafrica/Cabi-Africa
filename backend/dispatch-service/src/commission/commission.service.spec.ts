import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';
import { PrismaService } from '@cabi/backend/database';
import { BadgeTier } from '@prisma/client';

describe('CommissionService', () => {
    let service: CommissionService;
    let prisma: PrismaService;

    const mockPrismaService = {
        driverProfile: {
            findUnique: jest.fn(),
        },
        transactionLedger: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        driverSavingsPreference: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommissionService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<CommissionService>(CommissionService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculateTripPayout', () => {
        it('should calculate payout correctly for a standard driver', async () => {
            const mockDriver = {
                id: 'driver-1',
                totalRidesCompleted: 100,
                badgeStatus: [],
                savingsPreference: { personalSavingRate: 5 }
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            const result = await service.calculateTripPayout({
                baseFare: 1000,
                driverProfileId: 'driver-1',
                tripId: 'trip-1'
            });

            expect(result.baseFare).toBe(1000);
            expect(result.platformCommission).toBe(200); // 20%
            expect(result.driverShare).toBe(800); // 80%
            expect(result.personalSavingsAmount).toBe(40); // 5% of 800
            expect(result.driverNetTakeHome).toBe(760);
        });

        it('should apply grace period bonuses for new drivers', async () => {
            const mockDriver = {
                id: 'new-driver',
                totalRidesCompleted: 10,
                badgeStatus: [],
                savingsPreference: null
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            const result = await service.calculateTripPayout({
                baseFare: 1000,
                driverProfileId: 'new-driver'
            });

            expect(result.badgeBonusActive).toBe(true);
            expect(result.badgeBonusAmount).toBe(30); // 3% of 1000
        });
    });
});
