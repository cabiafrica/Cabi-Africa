import { computeTripSplit, TripSplitInput } from './sacco.service';
import { FinancialConsentService } from './financial-consent.service';

describe('Financial Services & Sacco Engine', () => {
    describe('computeTripSplit - Mathematical & Priority Waterfall Tests', () => {
        it('should correctly calculate non-enrolled driver split (82% driver, 18% cabi, 0% sacco)', () => {
            const result = computeTripSplit({
                fare: 1000,
                driverEnrolled: false,
                incentiveActive: false,
                cabiCommissionPct: 0.18,
                mandatoryRemittancePct: 0.02,
            });

            expect(result.cabiAmount).toBe(180);
            expect(result.saccoAmount).toBe(0);
            expect(result.driverAmount).toBe(820);
            expect(result.breakdown.driverPct).toBe(0.82);
            expect(result.breakdown.cabiPct).toBe(0.18);
            expect(result.breakdown.saccoPct).toBe(0);
            expect(result.breakdown.minTakeHomeGuaranteed).toBe(true);
        });

        it('should correctly calculate enrolled driver split without incentive (80% driver, 18% cabi, 2% sacco)', () => {
            const result = computeTripSplit({
                fare: 1000,
                driverEnrolled: true,
                incentiveActive: false,
                cabiCommissionPct: 0.18,
                mandatoryRemittancePct: 0.02,
            });

            expect(result.cabiAmount).toBe(180);
            expect(result.saccoAmount).toBe(20);
            expect(result.driverAmount).toBe(800);
            expect(result.breakdown.driverPct).toBe(0.80);
            expect(result.breakdown.cabiPct).toBe(0.18);
            expect(result.breakdown.saccoPct).toBe(0.02);
            expect(result.breakdown.incentiveActive).toBe(false);
            expect(result.breakdown.minTakeHomeGuaranteed).toBe(true);
        });

        it('should fund the 3% incentive directly from Cabi commission (80% driver, 15% cabi, 5% sacco)', () => {
            const result = computeTripSplit({
                fare: 1000,
                driverEnrolled: true,
                incentiveActive: true,
                cabiCommissionPct: 0.18,
                mandatoryRemittancePct: 0.02,
                incentivePct: 0.03,
            });

            // Cabi retains 15% (18% - 3%)
            expect(result.cabiAmount).toBe(150);
            expect(result.breakdown.cabiPct).toBe(0.15);

            // Sacco receives 5% total (2% driver contribution + 3% Cabi incentive)
            expect(result.saccoAmount).toBe(50);
            expect(result.breakdown.saccoPct).toBe(0.05);

            // Driver still retains their 80% take-home
            expect(result.driverAmount).toBe(800);
            expect(result.breakdown.driverPct).toBe(0.80);
            expect(result.breakdown.incentiveActive).toBe(true);
            expect(result.breakdown.minTakeHomeGuaranteed).toBe(true);
        });

        it('should handle multi-service voluntary deductions within the 15% cap', () => {
            const result = computeTripSplit({
                fare: 2000,
                driverEnrolled: true,
                incentiveActive: true,
                cabiCommissionPct: 0.18,
                mandatoryRemittancePct: 0.02, // 2% Sacco
                incentivePct: 0.03,
                maxVoluntaryDeductionPct: 0.15,
                voluntaryDeductions: [
                    { serviceType: 'INSURANCE_HEALTH', requestedPct: 0.03 }, // 3%
                    { serviceType: 'INVESTMENT_MMF', requestedPct: 0.04 },  // 4%
                ]
            });

            // Total voluntary deductions: 2% Sacco + 3% Health + 4% MMF = 9% <= 15% cap
            expect(result.totalVoluntaryDeductionAmount).toBe(180); // 9% of 2000
            expect(result.breakdown.totalVoluntaryDeductionsPct).toBeCloseTo(0.09);
            expect(result.breakdown.isDeductionCapped).toBe(false);

            // Cabi takes 15% (300 KES)
            expect(result.cabiAmount).toBe(300);

            // Sacco gets 2% (40) + 3% Cabi incentive (60) = 100 KES (5%)
            expect(result.saccoAmount).toBe(100);

            // Driver take-home: 100% - 15% Cabi - 9% deductions = 76% (1520 KES)
            expect(result.driverAmount).toBe(1520);
            expect(result.breakdown.driverPct).toBeCloseTo(0.76);
            expect(result.breakdown.minTakeHomeGuaranteed).toBe(true);
        });

        it('should strictly enforce the 15% voluntary cap using the priority waterfall and guarantee min 65% take-home', () => {
            // Driver requests: Sacco 2%, Vehicle Insurance 4%, Health Insurance 3%, MMF 10%
            // Total requested = 2% + 4% + 3% + 10% = 19% (exceeds 15% cap!)
            const result = computeTripSplit({
                fare: 1000,
                driverEnrolled: true,
                incentiveActive: false, // 18% Cabi commission
                cabiCommissionPct: 0.18,
                mandatoryRemittancePct: 0.02,
                maxVoluntaryDeductionPct: 0.15,
                minDriverTakeHomePct: 0.65,
                voluntaryDeductions: [
                    { serviceType: 'INSURANCE_VEHICLE', requestedPct: 0.04 }, // Priority 3
                    { serviceType: 'INSURANCE_HEALTH', requestedPct: 0.03 },  // Priority 3
                    { serviceType: 'INVESTMENT_MMF', requestedPct: 0.10 },    // Priority 4
                ]
            });

            // Priority 2: Sacco gets 2% (remains 13%)
            // Priority 3: Vehicle Ins gets 4% (remains 9%), Health Ins gets 3% (remains 6%)
            // Priority 4: MMF requested 10%, but only 6% remains -> capped to 6%
            expect(result.breakdown.isDeductionCapped).toBe(true);
            expect(result.breakdown.totalVoluntaryDeductionsPct).toBeCloseTo(0.15);
            expect(result.totalVoluntaryDeductionAmount).toBe(150);

            const mmfItem = result.itemizedDeductions.find(d => d.serviceType === 'INVESTMENT_MMF');
            expect(mmfItem?.isCapped).toBe(true);
            expect(mmfItem?.appliedPct).toBeCloseTo(0.06);

            // Driver Take-Home: 100% - 18% Cabi - 15% Cap = 67% (guaranteed >= 65% minimum)
            expect(result.breakdown.driverPct).toBeCloseTo(0.67);
            expect(result.driverAmount).toBe(670);
            expect(result.breakdown.minTakeHomeGuaranteed).toBe(true);
        });
    });

    describe('FinancialConsentService - Opt-Out & Next-Month Cycle Tests', () => {
        it('should correctly calculate the 1st day of the next calendar month cycle (1 month)', () => {
            // Mid September 2026 -> October 1st 2026
            const sepDate = new Date(Date.UTC(2026, 8, 19, 14, 30, 0));
            const nextMonth = FinancialConsentService.calculateOptOutEffectiveDate(1, sepDate);

            expect(nextMonth.getUTCFullYear()).toBe(2026);
            expect(nextMonth.getUTCMonth()).toBe(9); // October
            expect(nextMonth.getUTCDate()).toBe(1);
            expect(nextMonth.getUTCHours()).toBe(0);
            expect(nextMonth.getUTCMinutes()).toBe(0);
            expect(nextMonth.getUTCSeconds()).toBe(0);
        });

        it('should correctly calculate 3 months notice duration', () => {
            // Mid September 2026 + 3 months -> December 1st 2026
            const sepDate = new Date(Date.UTC(2026, 8, 19));
            const effectiveDate = FinancialConsentService.calculateOptOutEffectiveDate(3, sepDate);

            expect(effectiveDate.getUTCFullYear()).toBe(2026);
            expect(effectiveDate.getUTCMonth()).toBe(11); // December (0-indexed 11)
            expect(effectiveDate.getUTCDate()).toBe(1);
        });

        it('should correctly calculate 6 months notice duration', () => {
            // Mid September 2026 + 6 months -> March 1st 2027
            const sepDate = new Date(Date.UTC(2026, 8, 19));
            const effectiveDate = FinancialConsentService.calculateOptOutEffectiveDate(6, sepDate);

            expect(effectiveDate.getUTCFullYear()).toBe(2027);
            expect(effectiveDate.getUTCMonth()).toBe(2); // March (0-indexed 2)
            expect(effectiveDate.getUTCDate()).toBe(1);
        });

        it('should correctly calculate 1 year (12 months) notice duration', () => {
            // Mid September 2026 + 12 months -> October 1st 2027
            const sepDate = new Date(Date.UTC(2026, 8, 19));
            const effectiveDate = FinancialConsentService.calculateOptOutEffectiveDate(12, sepDate);

            expect(effectiveDate.getUTCFullYear()).toBe(2027);
            expect(effectiveDate.getUTCMonth()).toBe(9); // October
            expect(effectiveDate.getUTCDate()).toBe(1);
        });
    });
});

