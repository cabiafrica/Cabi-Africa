import { Test, TestingModule } from '@nestjs/testing';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';

// Mock PayoutService
const mockPayoutService = {
  findAll: jest.fn().mockResolvedValue([]),
  markAsPaid: jest.fn().mockImplementation((id) =>
    Promise.resolve({
      id,
      status: 'Paid',
    }),
  ),
};

describe('PayoutController', () => {
  let controller: PayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayoutController],
      providers: [
        {
          provide: PayoutService,
          useValue: mockPayoutService,
        },
      ],
    }).compile();

    controller = module.get<PayoutController>(PayoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll on the service when GET / is called', async () => {
    await controller.findAll();
    expect(mockPayoutService.findAll).toHaveBeenCalled();
  });

  it('should call markAsPaid on the service when PATCH /:id/mark-paid is called', async () => {
    const payoutId = 'payout-1';
    await controller.markAsPaid(payoutId);
    expect(mockPayoutService.markAsPaid).toHaveBeenCalledWith(payoutId, 'admin-007');
  });
});