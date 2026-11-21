import assert from 'node:assert/strict';
import { DisputeService } from '../backend/dispatch-service/src/dispute/dispute.service';
import { CorporateService } from '../backend/dispatch-service/src/corporate/corporate.service';
import { LostAndFoundService } from '../backend/dispatch-service/src/lost-and-found/lost-and-found.service';
import { UssdService } from '../backend/dispatch-service/src/ussd/ussd.service';
import { sanitizeChatMessage } from '../backend/dispatch-service/src/chat/pii-filter.util';

// ============================================================================
// Mock Infrastructure (Prisma, Pricing, RideService, SafetySmsService)
// ============================================================================
const sentSmsLog: Array<{ to: string; message: string }> = [];

const mockSmsService: any = {
  sendSms: async (to: string, message: string) => {
    sentSmsLog.push({ to, message });
    return { success: true, messageId: `sms_${Date.now()}` };
  },
};

const mockPricingService: any = {
  getCategoryPricing: async (_category: string) => ({
    baseFare: 150,
    perKmRate: 45,
    perMinRate: 5,
    minimumFare: 250,
  }),
};

const mockRides = new Map<string, any>([
  [
    'trip_normal_01',
    {
      id: 'trip_normal_01',
      tripCode: 'TRP-NRM01',
      passengerId: 'usr_rider_01',
      driverId: 'drv_01',
      // Nairobi CBD (-1.286389, 36.817223) -> Westlands (-1.2683, 36.8111) ~ 2.1km raw -> 2.6km optimal
      pickupLocation: { latitude: -1.286389, longitude: 36.817223, address: 'Kenyatta Ave, CBD' },
      dropoffLocation: { latitude: -1.2683, longitude: 36.8111, address: 'Sarit Centre, Westlands' },
      distance: 2.8, // ~7.7% variance (Normal)
      fare: 280,
      requestedVehicleType: 'STANDARD',
      passenger: { id: 'usr_rider_01', phone: '+254712000111', firstName: 'Wanjiku' },
      driver: { id: 'drv_01', userId: 'usr_drv_01', user: { phone: '+254722000222', firstName: 'Kamau' } },
    },
  ],
  [
    'trip_detour_01',
    {
      id: 'trip_detour_01',
      tripCode: 'TRP-DTR01',
      passengerId: 'usr_rider_01',
      driverId: 'drv_01',
      // CBD (-1.286389, 36.817223) -> Kilimani (-1.2896, 36.7830) ~ 3.8km raw -> 4.8km optimal
      pickupLocation: { latitude: -1.286389, longitude: 36.817223, address: 'CBD' },
      dropoffLocation: { latitude: -1.2896, longitude: 36.7830, address: 'Yaya Centre, Kilimani' },
      distance: 8.5, // ~77% detour anomaly!
      fare: 680, // Fair fare = 150 + 4.8*45 = 366 -> Overcharge = 314 KES (<= 500)
      requestedVehicleType: 'STANDARD',
      passenger: { id: 'usr_rider_01', phone: '+254712000111', firstName: 'Wanjiku' },
      driver: { id: 'drv_01', userId: 'usr_drv_01', user: { phone: '+254722000222', firstName: 'Kamau' } },
    },
  ],
  [
    'trip_detour_02',
    {
      id: 'trip_detour_02',
      tripCode: 'TRP-DTR02',
      passengerId: 'usr_rider_01',
      driverId: 'drv_01',
      pickupLocation: { latitude: -1.286389, longitude: 36.817223 },
      dropoffLocation: { latitude: -1.2896, longitude: 36.7830 },
      distance: 8.2,
      fare: 650,
      requestedVehicleType: 'STANDARD',
      passenger: { id: 'usr_rider_01', phone: '+254712000111', firstName: 'Wanjiku' },
      driver: { id: 'drv_01', userId: 'usr_drv_01', user: { phone: '+254722000222', firstName: 'Kamau' } },
    },
  ],
  [
    'trip_detour_03',
    {
      id: 'trip_detour_03',
      tripCode: 'TRP-DTR03',
      passengerId: 'usr_rider_01',
      driverId: 'drv_01',
      pickupLocation: { latitude: -1.286389, longitude: 36.817223 },
      dropoffLocation: { latitude: -1.2896, longitude: 36.7830 },
      distance: 8.9,
      fare: 700,
      requestedVehicleType: 'STANDARD',
      passenger: { id: 'usr_rider_01', phone: '+254712000111', firstName: 'Wanjiku' },
      driver: { id: 'drv_01', userId: 'usr_drv_01', user: { phone: '+254722000222', firstName: 'Kamau' } },
    },
  ],
]);

const mockPrisma: any = {
  ride: {
    findFirst: async ({ where }: any) => {
      const targetId = where?.OR?.[0]?.id || where?.OR?.[1]?.tripCode || where?.id;
      return mockRides.get(targetId) || null;
    },
    findUnique: async ({ where }: any) => mockRides.get(where?.id) || null,
  },
  user: {
    findFirst: async ({ where }: any) => ({
      id: 'usr_offline_01',
      phone: where?.OR?.[0]?.phone || '+254712345678',
      firstName: 'Offline',
      lastName: 'Rider',
    }),
    create: async ({ data }: any) => ({ id: 'usr_offline_new', ...data }),
  },
  occurrence: {
    create: async ({ data }: any) => ({ id: `occ_${Date.now()}`, ...data }),
    update: async ({ where, data }: any) => ({ id: where?.id, ...data }),
  },
};

const mockRideService: any = {
  requestRide: async (payload: any) => ({
    id: `ride_sim_${Date.now()}`,
    tripCode: 'TRP-SIM99',
    status: 'SEARCHING',
    ...payload,
  }),
  createRide: async (
    passengerId: string,
    pickup: any,
    dropoff: any,
    fare: number,
    vehicleType: string,
  ) => ({
    id: `ride_ussd_${Date.now()}`,
    tripCode: 'TRP-USSD1',
    passengerId,
    pickup,
    dropoff,
    fare,
    vehicleType,
    status: 'SEARCHING',
  }),
};

// ============================================================================
// Test Runner
// ============================================================================
async function runE2ESuite() {
  console.log('==================================================================');
  console.log('🚀 CABI AFRICA — END-TO-END AUDIT SUBSYSTEMS INTEGRATION SUITE');
  console.log('==================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ↳ ${err?.message || err}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // 1. Subsystem 13: Dispute Resolution & Fare Recalculation Escrow
  // --------------------------------------------------------------------------
  console.log('📦 [1/5] Subsystem 13: Dispute Resolution & Fare Recalculation');
  const disputeService = new DisputeService(mockPrisma, mockPricingService, mockSmsService);

  await test('Normal trip (<30% variance) is NOT flagged as detour anomaly', async () => {
    const res = await disputeService.assessTripTrajectory('trip_normal_01', 'usr_rider_01');
    assert.equal(res.isDetourAnomaly, false);
    assert.ok(res.detourPercent <= 30, `Expected <=30%, got ${res.detourPercent}%`);
    assert.equal(res.eligibleForAutoVoucher, false);
  });

  let firstClaimId = '';
  await test('Detoured trip (>30% variance) triggers Tier 1 Auto-Voucher (Claim #1)', async () => {
    const smsCountBefore = sentSmsLog.length;
    const { claim, assessment } = await disputeService.fileDispute('usr_rider_01', {
      tripId: 'trip_detour_01',
      reason: 'UNAUTHORIZED_DETOUR',
      description: 'Driver took bypass without consent',
    });
    assert.equal(assessment.isDetourAnomaly, true);
    assert.ok(assessment.detourPercent > 30);
    assert.equal(claim.status, 'AUTO_RESOLVED_VOUCHER');
    assert.ok(claim.voucherCode?.startsWith('VOUCHER_ADJ_'));
    assert.ok(claim.awardedVoucherAmount > 0 && claim.awardedVoucherAmount <= 500);
    assert.ok(sentSmsLog.length >= smsCountBefore + 2, 'Expected passenger + driver SMS notifications');
    firstClaimId = claim.id;
  });

  await test('Second claim within 30 days still eligible for Tier 1 Auto-Voucher (Claim #2)', async () => {
    const { claim } = await disputeService.fileDispute('usr_rider_01', {
      tripId: 'trip_detour_02',
      reason: 'UNAUTHORIZED_DETOUR',
      description: 'Second detour incident',
    });
    assert.equal(claim.status, 'AUTO_RESOLVED_VOUCHER');
    assert.ok(claim.voucherCode?.startsWith('VOUCHER_ADJ_'));
  });

  let thirdClaimId = '';
  await test('Third claim within 30 days triggers Anti-Abuse Gate -> ESCALATED_MANUAL_AUDIT', async () => {
    const { claim, assessment } = await disputeService.fileDispute('usr_rider_01', {
      tripId: 'trip_detour_03',
      reason: 'UNAUTHORIZED_DETOUR',
      description: 'Third claim should escalate',
    });
    assert.equal(assessment.eligibleForAutoVoucher, false);
    assert.equal(assessment.recentDisputeCount, 2);
    assert.equal(claim.status, 'ESCALATED_MANUAL_AUDIT');
    assert.equal(claim.voucherCode, undefined);
    thirdClaimId = claim.id;
  });

  await test('Driver submits appeal within 48h SLA -> queued for manual audit', async () => {
    const updated = disputeService.driverSubmitAppeal(firstClaimId, 'usr_drv_01', {
      appealNotes: 'Uhuru Highway blocked due to heavy rain and police diversion',
      trafficProofUrl: 'https://traffic.cabi.africa/proof/123',
    });
    assert.equal(updated.driverAppealed, true);
    assert.equal(updated.status, 'ESCALATED_MANUAL_AUDIT');
  });

  await test('Senior Adjudicator upholds rider on escalated claim -> RESOLVED_REFUND + Voucher', async () => {
    const resolved = disputeService.adjudicateDispute(thirdClaimId, 'admin_senior_01', {
      decision: 'UPHOLD_RIDER',
      notes: 'GPS telemetry confirmed unauthorized detour.',
      adjustedAmount: 350,
    });
    assert.equal(resolved.status, 'RESOLVED_REFUND');
    assert.equal(resolved.awardedVoucherAmount, 350);
    assert.ok(resolved.voucherCode?.startsWith('VOUCHER_ADJ_'));
  });

  // --------------------------------------------------------------------------
  // 2. Subsystem 10: Corporate Account Billing & 16% KRA VAT Invoicing
  // --------------------------------------------------------------------------
  console.log('\n📦 [2/5] Subsystem 10: Corporate Billing & 16% KRA VAT Invoicing');
  const corporateService = new CorporateService(mockPrisma, mockRideService, mockSmsService);

  await test('Seeded corporate account & cost centers are accessible', () => {
    const accounts = corporateService.listAccounts();
    assert.ok(accounts.length > 0);
    const safaricom = accounts[0];
    const costCenters = corporateService.listCostCenters(safaricom.id);
    assert.ok(costCenters.length > 0);
  });

  await test('Employee policy evaluation & 16% KRA VAT consolidated invoice math', () => {
    const accounts = corporateService.listAccounts();
    const account = accounts[0];
    const costCenters = corporateService.listCostCenters(account.id);
    const cc = costCenters[0];

    const emp = corporateService.enrolEmployee({
      userId: 'usr_corp_emp_01',
      corporateAccountId: account.id,
      costCenterId: cc.id,
      fullName: 'Grace Njeri',
      email: 'grace.njeri@safaricom.co.ke',
      monthlyAllowance: 20000,
    });
    assert.equal(emp.corporateAccountId, account.id);

    const policy = corporateService.evaluateTripPolicy(
      emp,
      1200,
      new Date('2026-11-19T10:00:00'),
    );
    assert.equal(policy.canProceedAutomatically, true);
    assert.equal(policy.status, 'AUTO_APPROVED');

    const invoice = corporateService.generateMonthlyInvoice(account.id, '2026-11');
    const expectedVat = Math.round(invoice.subtotal * 0.16);
    assert.equal(invoice.vatAmount, expectedVat);
    assert.equal(invoice.totalAmount, invoice.subtotal + expectedVat);
  });

  // --------------------------------------------------------------------------
  // 3. Subsystem 11: Lost & Found Resolution Lifecycle
  // --------------------------------------------------------------------------
  console.log('\n📦 [3/5] Subsystem 11: Lost & Found Resolution Lifecycle');
  const lostAndFoundService = new LostAndFoundService(mockPrisma, mockSmsService);

  await test('Full Lost & Found lifecycle: Report -> OB# -> Custody -> 4-Digit PIN Release', async () => {
    const incident = await lostAndFoundService.reportLostItem('usr_rider_01', {
      tripId: 'trip_normal_01',
      category: 'PHONE',
      description: 'iPhone 15 Pro Black in leather case',
    });
    assert.ok(incident.obNumber.startsWith('OB/LOST/'));
    assert.equal(incident.handoverPin.length, 4);
    assert.equal(incident.standardReturnFee, 500);

    const inCustody = await lostAndFoundService.driverConfirmCustody(incident.id, 'usr_drv_01', {
      itemFound: true,
      photoUrl: 'https://storage.cabi.africa/lost/phone_123.jpg',
      driverNotes: 'Found on rear seat',
    });
    assert.equal(inCustody.status, 'DRIVER_CONFIRMED');

    const withReward = lostAndFoundService.escrowVoluntaryReward(incident.id, 300);
    assert.equal(withReward.voluntaryRewardEscrow, 300);

    const { incident: resolvedIncident, disbursedAmount } =
      await lostAndFoundService.verifyHandoverAndReleaseFunds(incident.id, 'usr_drv_01', {
        handoverPin: incident.handoverPin,
        handoverPhotoUrl: 'https://storage.cabi.africa/lost/handover_verified_123.jpg',
        resolutionNotes: 'Handed over in person at Westlands Hub',
      });
    assert.equal(resolvedIncident.status, 'RESOLVED');
    assert.equal(disbursedAmount, 800); // 500 courier + 300 voluntary reward
  });

  // --------------------------------------------------------------------------
  // 4. Subsystem 4: Offline USSD Booking (*384*222#)
  // --------------------------------------------------------------------------
  console.log('\n📦 [4/5] Subsystem 4: Offline USSD Multi-Stage Ride Booking');
  const ussdService = new UssdService(mockPrisma, mockRideService, mockSmsService);

  await test('USSD multi-stage menu flow (*384*222#) completes booking & dispatches SMS', async () => {
    const sessionId = `ussd_${Date.now()}`;
    const phone = '+254712345678';

    const step1 = await ussdService.handleUssdRequest({ sessionId, phoneNumber: phone, text: '' });
    assert.ok(step1.startsWith('CON '), `Expected CON prompt, got: ${step1}`);

    const step2 = await ussdService.handleUssdRequest({ sessionId, phoneNumber: phone, text: '1' });
    assert.ok(step2.startsWith('CON '));

    const step3 = await ussdService.handleUssdRequest({ sessionId, phoneNumber: phone, text: '1*1' });
    assert.ok(step3.startsWith('CON '));

    const step4 = await ussdService.handleUssdRequest({ sessionId, phoneNumber: phone, text: '1*1*2' });
    assert.ok(step4.startsWith('CON '));

    const step5 = await ussdService.handleUssdRequest({ sessionId, phoneNumber: phone, text: '1*1*2*1' });
    assert.ok(step5.startsWith('END '), `Expected END confirmation, got: ${step5}`);
  });

  // --------------------------------------------------------------------------
  // 5. Subsystem 2: In-Trip Chat PII Redaction
  // --------------------------------------------------------------------------
  console.log('\n📦 [5/5] Subsystem 2: In-Trip Chat PII Privacy Filter');

  await test('Redacts Kenyan phone numbers (+254 / 07xx) and emails from chat messages', () => {
    const raw = 'Call me on 0712345678 or +254722111222, email me at rider@example.com';
    const result = sanitizeChatMessage(raw);
    assert.equal(result.wasRedacted, true);
    assert.equal(result.sanitizedText.includes('0712345678'), false);
    assert.equal(result.sanitizedText.includes('+254722111222'), false);
    assert.equal(result.sanitizedText.includes('rider@example.com'), false);
  });

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n==================================================================');
  console.log(`📊 E2E INTEGRATION SUMMARY: ${passed} Passed | ${failed} Failed`);
  console.log(`📩 Total Automated SMS Dispatches Verified: ${sentSmsLog.length}`);
  console.log('==================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ESuite();
