import { NotificationService } from './notification.service';
import { PassengerReceiptPayload, DriverReceiptPayload } from './receipt.types';

describe('NotificationService - HTML Email Receipts', () => {
  let service: NotificationService;

  beforeEach(async () => {
    service = new NotificationService();
    await service.onModuleInit();
  });

  describe('Passenger Receipt', () => {
    const samplePassengerReceipt: PassengerReceiptPayload = {
      to: 'passenger@example.com',
      passengerName: 'Jane Doe',
      rideId: 'ride_test_12345',
      rideDate: new Date('2026-09-03T10:15:00Z'),
      pickupLocation: { address: 'Westlands Square, Nairobi', lat: -1.267, lng: 36.811 },
      dropoffLocation: { address: 'Jomo Kenyatta International Airport (JKIA)', lat: -1.319, lng: 36.927 },
      distanceKm: 18.5,
      durationMinutes: 35,
      currency: 'KES',
      totalFare: 1450.0,
      baseFare: 250.0,
      distanceFare: 900.0,
      timeFare: 300.0,
      surgeMultiplier: 1.2,
      surgeAmount: 241.67,
      paymentMethod: 'MPESA',
      transactionReference: 'QHJ8912KL3',
      driverName: 'Peter Kamau',
      vehicleModel: 'Toyota Fielder',
      vehiclePlateNumber: 'KDA 789B',
      vehicleColor: 'Silver',
    };

    it('should render passenger receipt HTML with correct details', () => {
      const html = service.renderPassengerReceiptHtml(samplePassengerReceipt);

      expect(html).toContain('Cabi');
      expect(html).toContain('Official Trip Receipt');
      expect(html).toContain('Jane Doe');
      expect(html).toContain('ride_test_12345');
      expect(html).toContain('KES 1,450.00');
      expect(html).toContain('Westlands Square, Nairobi');
      expect(html).toContain('Jomo Kenyatta International Airport (JKIA)');
      expect(html).toContain('Peter Kamau');
      expect(html).toContain('Toyota Fielder');
      expect(html).toContain('KDA 789B');
      expect(html).toContain('QHJ8912KL3');
      expect(html).toContain('MPESA');
    });

    it('should successfully send or simulate sending passenger receipt', async () => {
      const result = await service.sendPassengerReceipt(samplePassengerReceipt);
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should gracefully handle invalid passenger email', async () => {
      const result = await service.sendPassengerReceipt({
        ...samplePassengerReceipt,
        to: 'invalid-email',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Driver Receipt', () => {
    const sampleDriverReceipt: DriverReceiptPayload = {
      to: 'driver@example.com',
      driverName: 'Peter Kamau',
      rideId: 'ride_test_12345',
      rideDate: new Date('2026-09-03T10:15:00Z'),
      pickupLocation: 'Westlands Square, Nairobi',
      dropoffLocation: 'Jomo Kenyatta International Airport (JKIA)',
      distanceKm: 18.5,
      durationMinutes: 35,
      currency: 'KES',
      grossFare: 1450.0,
      platformCommissionRate: 18,
      platformCommissionAmount: 261.0,
      netDriverEarnings: 1189.0,
      paymentMethod: 'MPESA',
      payoutStatus: 'CREDITED_TO_WALLET',
      passengerName: 'Jane Doe',
    };

    it('should render driver receipt HTML with correct earnings breakdown', () => {
      const html = service.renderDriverReceiptHtml(sampleDriverReceipt);

      expect(html).toContain('Cabi.Drive');
      expect(html).toContain('Trip Earnings Summary');
      expect(html).toContain('Peter Kamau');
      expect(html).toContain('Your Net Earnings');
      expect(html).toContain('KES 1,189.00');
      expect(html).toContain('Gross Trip Fare');
      expect(html).toContain('KES 1,450.00');
      expect(html).toContain('Platform Service Fee (18%)');
      expect(html).toContain('- KES 261.00');
      expect(html).toContain('Westlands Square, Nairobi');
      expect(html).toContain('Jane Doe');
      expect(html).toContain('CREDITED_TO_WALLET');
    });

    it('should successfully send or simulate sending driver receipt', async () => {
      const result = await service.sendDriverReceipt(sampleDriverReceipt);
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should gracefully handle invalid driver email', async () => {
      const result = await service.sendDriverReceipt({
        ...sampleDriverReceipt,
        to: '',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
