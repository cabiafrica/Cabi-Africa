import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';
import { handleFareCommission } from './fare-commission.handler';

// Mock the dependencies
jest.mock('./admin.service.client');
jest.mock('./user.service.client');
jest.mock('./transaction.repository');

describe('handleFareCommission', () => {
  let mockAdminClient: jest.Mocked<AdminServiceClient>;
  let mockUserClient: jest.Mocked<UserServiceClient>;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminClient = new AdminServiceClient() as jest.Mocked<AdminServiceClient>;
    mockUserClient = new UserServiceClient() as jest.Mocked<UserServiceClient>;
    mockTransactionRepo = new TransactionRepository() as jest.Mocked<TransactionRepository>;

    (AdminServiceClient as jest.Mock).mockImplementation(() => mockAdminClient);
    (UserServiceClient as jest.Mock).mockImplementation(() => mockUserClient);
    (TransactionRepository as jest.Mock).mockImplementation(() => mockTransactionRepo);

    // Default mock for config
    mockAdminClient.getFareCommissionConfig.mockResolvedValue({
      totalCommission: 0.2, // 20%
      systemCut: 0.5,       // 50% of commission
      upline1Cut: 0.3,      // 30% of commission
      upline2Cut: 0.2,      // 20% of commission
    });
  });

  const testEvent = {
    tripId: 'trip-abc-123',
    driverId: 'driver-xyz',
    finalFare: 1000,
  };

  it('should distribute correctly when both uplines have badges', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    mockUserClient.hasEarningBadge.mockResolvedValue(true); // Both have badges

    // Act
    await handleFareCommission(testEvent);

    // Assert
    expect(mockTransactionRepo.create).toHaveBeenCalledTimes(4);
    // Driver Earning: 1000 - (1000 * 0.2) = 800
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'driver-xyz', amount: 800 }));
    // Upline 1: (1000 * 0.2) * 0.3 = 60
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-1', amount: 60 }));
    // Upline 2: (1000 * 0.2) * 0.2 = 40
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-2', amount: 40 }));
    // System: (1000 * 0.2) * 0.5 = 100
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'SYSTEM_ACCOUNT', amount: 100 }));
  });

  it('should give Upline 1 share to system if they lack a badge', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    // Upline 1 fails, Upline 2 passes
    mockUserClient.hasEarningBadge.mockImplementation(async (userId) => userId === 'upline-2');

    // Act
    await handleFareCommission(testEvent);

    // Assert
    // Upline 1's 60 goes to system. System gets 100 (base) + 60 = 160
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'SYSTEM_ACCOUNT', amount: 160 }));
    // Upline 1 should not receive a transaction
    expect(mockTransactionRepo.create).not.toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-1' }));
  });

  it('should give Upline 2 share to system if they lack a badge', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    // Upline 1 passes, Upline 2 fails
    mockUserClient.hasEarningBadge.mockImplementation(async (userId) => userId === 'upline-1');

    // Act
    await handleFareCommission(testEvent);

    // Assert
    // Upline 2's 40 goes to system. System gets 100 (base) + 40 = 140
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'SYSTEM_ACCOUNT', amount: 140 }));
    // Upline 2 should not receive a transaction
    expect(mockTransactionRepo.create).not.toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-2' }));
  });

  it('should give both shares to system if both uplines lack badges', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    mockUserClient.hasEarningBadge.mockResolvedValue(false); // Both fail

    // Act
    await handleFareCommission(testEvent);

    // Assert
    // System gets 100 (base) + 60 (upline1) + 40 (upline2) = 200
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'SYSTEM_ACCOUNT', amount: 200 }));
  });

  it('should re-throw an error if a service call fails', async () => {
    // Arrange
    mockUserClient.getUplines.mockRejectedValue(new Error('Service Unavailable'));

    // Act & Assert
    await expect(handleFareCommission(testEvent)).rejects.toThrow('Service Unavailable');
  });
});