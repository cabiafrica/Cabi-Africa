import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';
import { PrismaService } from '@cabi/backend/database';
import { WelfareService } from '../welfare/welfare.service';

describe('CommissionService', () => {
    let service: CommissionService;
    let prisma: PrismaService;

    const mockWelfareService = {
        calculateWelfareDeductions: jest.fn().mockResolvedValue([]),
        recordDeductions: jest.fn().mockResolvedValue([]),
    };

    const mockPrismaService = {
        driverProfile: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        transactionLedger: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        driverSavingsPreference: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        driverFinancialConsent: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        driverWealthEnrollment: {
            findMany: jest.fn().mockResolvedValue([]),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        mockWelfareService.calculateWelfareDeductions.mockResolvedValue([]);
        mockPrismaService.driverFinancialConsent.findMany.mockResolvedValue([]);
        mockPrismaService.driverWealthEnrollment.findMany.mockResolvedValue([]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommissionService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: WelfareService, useValue: mockWelfareService },
            ],
        }).compile();

        service = module.get<CommissionService>(CommissionService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculateTripPayout', () => {
        it('should calculate payout for an unenrolled driver with compulsory 10/- pension deduction (82% gross, 10/- pension, 18% platform)', async () => {
            const mockDriver = {
                id: 'driver-1',
                saccoEnrolled: false,
                totalRidesCompleted: 100,
                badgeStatus: [],
                savingsPreference: null,
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            const result = await service.calculateTripPayout({
                baseFare: 1000,
                driverProfileId: 'driver-1',
                tripId: 'trip-1'
            });

            expect(result.baseFare).toBe(1000);
            expect(result.platformCommission).toBe(180); // 18% platform commission
            expect(result.saccoAdminFee).toBe(0);         // 0% driver sacco deduction
            expect(result.badgeBonusActive).toBe(false);  // 0% platform subsidy
            expect(result.badgeBonusAmount).toBe(0);
            expect(result.platformNet).toBe(180);        // 18% kept by platform
            expect(result.driverShare).toBe(820);        // 82% gross
            expect(result.pensionDeduction).toBe(10);    // Compulsory 10/- per trip pension deduction!
            expect(result.driverNetTakeHome).toBe(810);   // 820 - 10 pension
            expect(result.totalSaccoDeposit).toBe(0);
            expect(result.driverNetTakeHome + result.platformNet + result.pensionDeduction).toBe(1000);
        });

        it('should apply 2% driver saving + 3% Cabi match = 5% Sacco deposit + 10/- pension for a new driver in Sacco', async () => {
            const mockDriver = {
                id: 'new-driver-sacco',
                saccoEnrolled: true,
                totalRidesCompleted: 10, // within grace period < 50
                badgeStatus: [],
                savingsPreference: null,
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            const result = await service.calculateTripPayout({
                baseFare: 1000,
                driverProfileId: 'new-driver-sacco',
                tripId: 'trip-new'
            });

            // Gross & Commission
            expect(result.baseFare).toBe(1000);
            expect(result.platformCommission).toBe(180); // 18% base commission

            // Sacco 2% Driver Contribution
            expect(result.saccoAdminFee).toBe(20);        // 2% from driver

            // Cabi 3% Incentive Match
            expect(result.badgeBonusActive).toBe(true);
            expect(result.badgeBonusAmount).toBe(30);     // 3% funded by Cabi

            // Total Sacco Deposit: 2% (driver) + 3% (Cabi) = 5%
            expect(result.totalSaccoDeposit).toBe(50);    // 50 KES (5%)

            // Compulsory 10/- Pension
            expect(result.pensionDeduction).toBe(10);

            // Platform Net Commission: 180 - 30 match = 150 KES (15%)
            expect(result.platformNet).toBe(150);

            // Driver Take-Home: 820 - 20 (Sacco) - 10 (pension) = 790 KES
            expect(result.driverNetTakeHome).toBe(790);

            // Exact reconciliation: Driver (790) + Platform (150) + Sacco (50) + Pension (10) = 1000 KES (100%)
            expect(result.driverNetTakeHome + result.platformNet + result.totalSaccoDeposit + result.pensionDeduction).toBe(1000);
        });

        it('should award 3% Cabi match to an established driver who maintains a top badge (ELITE / ROAD_MASTER)', async () => {
            const mockDriver = {
                id: 'elite-driver',
                saccoEnrolled: true,
                totalRidesCompleted: 350, // Beyond grace period
                badgeStatus: [
                    { badgeTier: 'ELITE', isActive: true }
                ],
                savingsPreference: null,
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            const result = await service.calculateTripPayout({
                baseFare: 2000,
                driverProfileId: 'elite-driver',
                tripId: 'trip-elite'
            });

            expect(result.saccoAdminFee).toBe(40);        // 2% of 2000 (driver)
            expect(result.badgeBonusActive).toBe(true);
            expect(result.badgeBonusAmount).toBe(60);     // 3% of 2000 (Cabi match)
            expect(result.totalSaccoDeposit).toBe(100);   // 5% total to Sacco (100 KES)
            expect(result.pensionDeduction).toBe(10);     // Compulsory 10/- pension
            expect(result.platformNet).toBe(2000 * 0.18 - 60 - (2000 * 0.03)); // 360 - 60 match - 60 rebate = 240
            expect(result.driverNetTakeHome).toBe(1640 - 40 - 10); // 1590 KES
        });

        it('should deduct only 2% driver saving without 3% match for established drivers without top badge (+ 10/- pension)', async () => {
            const mockDriver = {
                id: 'regular-driver',
                saccoEnrolled: true,
                totalRidesCompleted: 150, // Beyond grace period
                badgeStatus: [],          // No top badge
                savingsPreference: null,
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            const result = await service.calculateTripPayout({
                baseFare: 1000,
                driverProfileId: 'regular-driver',
                tripId: 'trip-reg'
            });

            expect(result.saccoAdminFee).toBe(20);        // 2% driver contribution
            expect(result.badgeBonusActive).toBe(false);  // No platform match
            expect(result.badgeBonusAmount).toBe(0);
            expect(result.totalSaccoDeposit).toBe(20);    // 2% to Sacco
            expect(result.pensionDeduction).toBe(10);     // Compulsory 10/- pension
            expect(result.platformNet).toBe(180);        // Full 18% retained by Cabi
            expect(result.driverNetTakeHome).toBe(790);   // 820 - 20 (Sacco) - 10 (pension) = 790 KES
        });

        it('should correctly process Ksh. 10 flat pension deduction on both short and long trips', async () => {
            const mockDriver = {
                id: 'pension-driver',
                saccoEnrolled: true,
                totalRidesCompleted: 10,
                badgeStatus: [],
                savingsPreference: null,
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            // Simulate welfareService returning Ksh. 10 flat pension
            mockWelfareService.calculateWelfareDeductions.mockResolvedValue([
                {
                    schemeId: 'pension-scheme-1',
                    schemeName: 'Micro-Pension Fund',
                    schemeType: 'PENSION',
                    amount: 10,
                }
            ]);

            // Short Trip: KES 200
            const shortTrip = await service.calculateTripPayout({
                baseFare: 200,
                driverProfileId: 'pension-driver',
                tripId: 'trip-short'
            });

            expect(shortTrip.pensionDeduction).toBe(10);  // Flat Ksh 10
            expect(shortTrip.saccoAdminFee).toBe(4);      // 2% of 200
            expect(shortTrip.badgeBonusAmount).toBe(6);   // 3% of 200 (Cabi match)
            expect(shortTrip.totalSaccoDeposit).toBe(10); // 5% = 10 KES
            expect(shortTrip.platformNet).toBe(36 - 6);   // 30 KES (15%)
            expect(shortTrip.driverNetTakeHome).toBe(164 - 4 - 10); // 150 KES
            expect(shortTrip.driverNetTakeHome + shortTrip.platformNet + shortTrip.totalSaccoDeposit + shortTrip.pensionDeduction).toBe(200);

            // Long Trip: KES 3000
            const longTrip = await service.calculateTripPayout({
                baseFare: 3000,
                driverProfileId: 'pension-driver',
                tripId: 'trip-long'
            });

            expect(longTrip.pensionDeduction).toBe(10);   // Still flat Ksh 10!
            expect(longTrip.saccoAdminFee).toBe(60);      // 2% of 3000
            expect(longTrip.badgeBonusAmount).toBe(90);   // 3% of 3000 (Cabi match)
            expect(longTrip.totalSaccoDeposit).toBe(150); // 5% = 150 KES
            expect(longTrip.platformNet).toBe(540 - 90);  // 450 KES (15%)
            expect(longTrip.driverNetTakeHome).toBe(2460 - 60 - 10); // 2390 KES
            expect(longTrip.driverNetTakeHome + longTrip.platformNet + longTrip.totalSaccoDeposit + longTrip.pensionDeduction).toBe(3000);
        });

        it('should continue wealth program deductions when program is in PENDING_CANCELLATION (60-day rule)', async () => {
            const mockDriver = {
                id: 'driver-cancelling',
                saccoEnrolled: false,
                totalRidesCompleted: 200,
                badgeStatus: [],
                savingsPreference: null,
            };
            mockPrismaService.driverProfile.findUnique.mockResolvedValue(mockDriver);

            // Driver has a wealth program currently under 60-day cancellation notice
            mockPrismaService.driverWealthEnrollment.findMany.mockResolvedValue([
                {
                    programId: 'mmf-program',
                    deductionPct: 0.05, // 5%
                    status: 'PENDING_CANCELLATION',
                    cancellationRequestedAt: new Date(),
                    cancellationEffectiveDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days left
                    program: { category: 'INVESTMENT_MMF' },
                }
            ]);

            const result = await service.calculateTripPayout({
                baseFare: 1000,
                driverProfileId: 'driver-cancelling',
                tripId: 'trip-cancel-pending'
            });

            // 5% of driver gross share (820) = 41 KES
            expect(result.wealthProgramDeductions).toBe(41);
            expect(result.pensionDeduction).toBe(10); // Compulsory 10/- pension
            expect(result.driverNetTakeHome).toBe(820 - 41 - 10); // 769 KES
        });
    });
});
