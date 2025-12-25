import { Test, TestingModule } from '@nestjs/testing';
import { PayoutService, mockPayouts, mockAvailableBalances } from './payout.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PayoutDto } from '@cabi/shared/interfaces';

describe('PayoutService', () => {
  let service: PayoutService;

  // Define initial state for mocks
  const initialMockPayouts: PayoutDto[] = [
    { id: 'payout-1', driverId: 'driver-123', driverName: 'John Doe', amount: 150.75, currency: 'KES', status: 'Pending', requestedAt: '2024-08-20T10:00:00Z', paymentMethod: 'M-Pesa' },
    { id: 'payout-2', driverId: 'driver-456', driverName: 'Jane Smith', amount: 230.00, currency: 'KES', status: 'Pending', requestedAt: '2024-08-20T11:30:00Z', paymentMethod: 'Bank Transfer' },
    { id: 'payout-3', driverId: 'driver-123', driverName: 'John Doe', amount: 100.00, currency: 'KES', status: 'Paid', requestedAt: '2024-08-15T09:00:00Z', processedAt: '2024-08-15T10:00:00Z', paymentMethod: 'M-Pesa' },
    { id: 'payout-4', driverId: 'driver-789', driverName: 'Peter Jones', amount: 50.20, currency: 'KES', status: 'Pending', requestedAt: '2024-08-21T08:00:00Z', paymentMethod: 'M-Pesa' },
  ];

  const initialMockBalances = {
    'driver-123': 250.0,
    'driver-456': 50.0,
  };

  beforeEach(async () => {
    // Reset mock data before each test to ensure isolation
    mockPayouts.length = 0;
    mockPayouts.push(...JSON.parse(JSON.stringify(initialMockPayouts)));

    Object.keys(mockAvailableBalances).forEach(key => delete mockAvailableBalances[key]);
    Object.assign(mockAvailableBalances, JSON.parse(JSON.stringify(initialMockBalances)));

    const module: TestingModule = await Test.createTestingModule({
      providers: [PayoutService],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated payouts sorted by requestedAt descending by default', async () => {
      const result = await service.findAll();
      expect(result.data.length).toBe(4);
      expect(result.total).toBe(4);
      expect(new Date(result.data[0].requestedAt).getTime()).toBeGreaterThan(new Date(result.data[1].requestedAt).getTime());
    });
  });

  describe('markAsPaid', () => {
    it('should mark a pending payout as paid and set processedAt', async () => {
      const payoutId = 'payout-2'; // This one is 'Pending'
      const adminId = 'test-admin';
      const result = await service.markAsPaid(payoutId, adminId);

      expect(result.status).toBe('Paid');
      expect(result.processedAt).toBeDefined();
      expect(new Date(result.processedAt).getTime()).toBeCloseTo(new Date().getTime(), -3);
    });

    it('should not change an already paid payout', async () => {
      const payoutId = 'payout-3'; // This one is already 'Paid'
      const initialPayout = (await service.findAll()).find(p => p.id === payoutId);
      const result = await service.markAsPaid(payoutId, 'test-admin');

      expect(result.status).toBe('Paid');
      // The processedAt date should not have changed
      expect(result.processedAt).toEqual(initialPayout.processedAt);
    });

    it('should throw NotFoundException for a non-existent payout ID', async () => {
      const nonExistentId = 'payout-999';
      await expect(service.markAsPaid(nonExistentId, 'test-admin')).rejects.toThrow(
        new NotFoundException(`Payout with ID ${nonExistentId} not found.`),
      );
    });
  });

  describe('requestPayout', () => {
    const driverId = 'driver-123';
    const initialBalance = mockAvailableBalances[driverId];

    it('should create a new payout, reduce the balance, and return the new payout object', async () => {
      const requestAmount = 100;
      const initialPayoutCount = mockPayouts.length;

      const result = await service.requestPayout(driverId, requestAmount, 'M-Pesa');

      expect(result).toBeDefined();
      expect(result.driverId).toBe(driverId);
      expect(result.amount).toBe(requestAmount);
      expect(result.status).toBe('Pending');

      // Check that balance was reduced
      expect(mockAvailableBalances[driverId]).toBe(initialBalance - requestAmount);

      // Check that a new payout was added to the list
      expect(mockPayouts.length).toBe(initialPayoutCount + 1);
    });

    it('should throw BadRequestException if requested amount is greater than balance', async () => {
      const requestAmount = initialBalance + 50;
      await expect(service.requestPayout(driverId, requestAmount, 'M-Pesa')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if requested amount is zero', async () => {
      await expect(service.requestPayout(driverId, 0, 'M-Pesa')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if requested amount is negative', async () => {
      await expect(service.requestPayout(driverId, -50, 'M-Pesa')).rejects.toThrow(BadRequestException);
    });
  });
});