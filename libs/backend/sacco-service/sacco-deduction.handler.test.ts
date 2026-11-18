import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { handleSaccoDeduction } from './sacco-deduction.handler';

// Mock the dependencies
jest.mock('./admin.service.client');
jest.mock('./transaction.repository');

describe('handleSaccoDeduction', () => {
  let mockAdminClient: jest.Mocked<AdminServiceClient>;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminClient = new AdminServiceClient() as jest.Mocked<AdminServiceClient>;
    mockTransactionRepo = new TransactionRepository() as jest.Mocked<TransactionRepository>;

    (AdminServiceClient as jest.Mock).mockImplementation(() => mockAdminClient);
    (TransactionRepository as jest.Mock).mockImplementation(() => mockTransactionRepo);
  });

  const testEvent = {
    tripId: 'trip-xyz-789',
    driverId: 'driver-abc',
    finalFare: 1000,
  };

  it('should calculate and log the correct savings amount', async () => {
    // Arrange
    mockAdminClient.getSaccoConfig.mockResolvedValue({ savingsRate: 0.05 }); // 5%
    mockAdminClient.getFareCommissionConfig.mockResolvedValue({ totalCommission: 0.2 }); // 20%

    // Act
    await handleSaccoDeduction(testEvent);

    // Assert
    // Total Commission = 1000 * 0.2 = 200
    // Savings Amount = 200 * 0.05 = 10
    expect(mockTransactionRepo.create).toHaveBeenCalledTimes(1);
    expect(mockTransactionRepo.create).toHaveBeenCalledWith({
      userId: 'driver-abc',
      amount: 10,
      type: 'Sacco_SAVING',
      relatedTripId: 'trip-xyz-789',
    });
  });

  it('should do nothing if the savings rate is zero', async () => {
    // Arrange
    mockAdminClient.getSaccoConfig.mockResolvedValue({ savingsRate: 0 });
    mockAdminClient.getFareCommissionConfig.mockResolvedValue({ totalCommission: 0.2 });

    // Act
    await handleSaccoDeduction(testEvent);

    // Assert
    expect(mockTransactionRepo.create).not.toHaveBeenCalled();
  });

  it('should do nothing if the calculated savings amount is zero or less', async () => {
    // Arrange
    mockAdminClient.getSaccoConfig.mockResolvedValue({ savingsRate: 0.05 });
    mockAdminClient.getFareCommissionConfig.mockResolvedValue({ totalCommission: 0 }); // Zero commission

    // Act
    await handleSaccoDeduction(testEvent);

    // Assert
    expect(mockTransactionRepo.create).not.toHaveBeenCalled();
  });

  it('should re-throw an error if a service call fails', async () => {
    // Arrange
    mockAdminClient.getSaccoConfig.mockRejectedValue(new Error('Admin service down'));

    // Act & Assert
    await expect(handleSaccoDeduction(testEvent)).rejects.toThrow('Admin service down');
  });
});