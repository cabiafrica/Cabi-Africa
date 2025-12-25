import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUpcomingPayout', () => {
    it('should correctly sum unpaid transactions for a given driver', async () => {
      const driverId = 'driver-123'; // This driver has unpaid transactions of 1500 + 250
      const result = await service.getUpcomingPayout(driverId);
      expect(result.estimatedAmount).toBe(1750);
    });

    it('should return an estimated amount of 0 for a driver with no unpaid transactions', async () => {
      const driverId = 'driver-unknown'; // This driver has no transactions in the mock data
      const result = await service.getUpcomingPayout(driverId);
      expect(result.estimatedAmount).toBe(0);
    });

    it('should calculate the next payout date as the upcoming Friday', async () => {
      // Mock the current date to be Monday, July 15, 2024
      const mockDate = new Date('2024-07-15T10:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = await service.getUpcomingPayout('any-driver');

      // The next Friday should be July 19, 2024, at 5 PM (17:00)
      const expectedDate = new Date('2024-07-19T17:00:00Z');

      // Adjust for timezone differences in test environment if necessary
      expectedDate.setMinutes(expectedDate.getMinutes() - expectedDate.getTimezoneOffset());

      expect(result.payoutDate.toISOString().split('T')[0]).toBe(expectedDate.toISOString().split('T')[0]);

      // Restore the original Date object
      (global.Date as any).mockRestore();
    });

    it('should calculate the payout date for the following week if today is Friday', async () => {
      // Mock the current date to be Friday, July 19, 2024
      const mockDate = new Date('2024-07-19T10:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = await service.getUpcomingPayout('any-driver');

      // The next Friday should be July 26, 2024
      expect(result.payoutDate.getDate()).toBe(26);
      (global.Date as any).mockRestore();
    });
  });
});