import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';
import { handleFeeDistribution } from './fee-distribution.handler';

// Mock the dependencies
jest.mock('./admin.service.client');
jest.mock('./user.service.client');
jest.mock('./transaction.repository');

describe('handleFeeDistribution', () => {
  let mockAdminClient: jest.Mocked<AdminServiceClient>;
  let mockUserClient: jest.Mocked<UserServiceClient>;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    // Clear mocks and re-instantiate before each test
    jest.clearAllMocks();
    mockAdminClient = new AdminServiceClient() as jest.Mocked<AdminServiceClient>;
    mockUserClient = new UserServiceClient() as jest.Mocked<UserServiceClient>;
    mockTransactionRepo = new TransactionRepository() as jest.Mocked<TransactionRepository>;

    // Mock the constructors to return our mocked instances
    (AdminServiceClient as jest.Mock).mockImplementation(() => mockAdminClient);
    (UserServiceClient as jest.Mock).mockImplementation(() => mockUserClient);
    (TransactionRepository as jest.Mock).mockImplementation(() => mockTransactionRepo);
  });

  const testEvent = {
    userId: 'new-driver-1',
    feeAmount: 1000,
  };

  it('should correctly distribute fees for a user with a full two-tier upline', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    mockAdminClient.getFeeDistributionConfig.mockResolvedValue({
      systemCut: 0.4,
      upline1Cut: 0.4,
      upline2Cut: 0.2,
    });

    // Act
    await handleFeeDistribution(testEvent);

    // Assert
    expect(mockTransactionRepo.create).toHaveBeenCalledTimes(2);
    expect(mockTransactionRepo.create).toHaveBeenCalledWith({
      toUserId: 'upline-1',
      amount: 400, // 1000 * 0.4
      type: 'COMMISSION_UPLINE1',
      relatedUserId: 'new-driver-1',
    });
    expect(mockTransactionRepo.create).toHaveBeenCalledWith({
      toUserId: 'upline-2',
      amount: 200, // 1000 * 0.2
      type: 'COMMISSION_UPLINE2',
      relatedUserId: 'new-driver-1',
    });
  });

  it('should credit Upline 2 share to SYSTEM_ACCOUNT if Upline 2 is null', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: null,
    });
    mockAdminClient.getFeeDistributionConfig.mockResolvedValue({
      systemCut: 0.4,
      upline1Cut: 0.4,
      upline2Cut: 0.2,
    });

    // Act
    await handleFeeDistribution(testEvent);

    // Assert
    expect(mockTransactionRepo.create).toHaveBeenCalledTimes(2);
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ toUserId: 'SYSTEM_ACCOUNT', amount: 200 })
    );
  });

  it('should re-throw an error if any service call fails', async () => {
    // Arrange
    mockUserClient.getUplines.mockRejectedValue(new Error('Service Unavailable'));

    // Act & Assert
    await expect(handleFeeDistribution(testEvent)).rejects.toThrow('Service Unavailable');
  });
});