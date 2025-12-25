import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';
import { handlePromotionalFare } from './promotional-fare.handler';

// Mock the dependencies
jest.mock('./admin.service.client');
jest.mock('./user.service.client');
jest.mock('./transaction.repository');

describe('handlePromotionalFare', () => {
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

    // Default mock for an active promotion
    mockAdminClient.getPromotionalFareConfig.mockResolvedValue({
      isActive: true,
      upline1Cut: 0.02, // 2%
      upline2Cut: 0.01, // 1%
    });
  });

  const testEvent = {
    tripId: 'trip-promo-456',
    driverId: 'driver-xyz',
    passengerId: 'passenger-abc',
    finalFare: 1000,
  };

  it('should do nothing if the promotion is not active', async () => {
    // Arrange
    mockAdminClient.getPromotionalFareConfig.mockResolvedValue({
      isActive: false,
      upline1Cut: 0.02,
      upline2Cut: 0.01,
    });

    // Act
    await handlePromotionalFare(testEvent);

    // Assert
    expect(mockUserClient.getUplines).not.toHaveBeenCalled();
    expect(mockTransactionRepo.create).not.toHaveBeenCalled();
  });

  it('should distribute to both uplines if both have badges', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    mockUserClient.hasEarningBadge.mockResolvedValue(true); // Both have badges

    // Act
    await handlePromotionalFare(testEvent);

    // Assert
    expect(mockTransactionRepo.create).toHaveBeenCalledTimes(2);
    // Upline 1: 1000 * 0.02 = 20
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-1', amount: 20 }));
    // Upline 2: 1000 * 0.01 = 10
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-2', amount: 10 }));
  });

  it('should only distribute to Upline 1 if Upline 2 lacks a badge', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    // Upline 1 passes, Upline 2 fails
    mockUserClient.hasEarningBadge.mockImplementation(async (userId) => userId === 'upline-1');

    // Act
    await handlePromotionalFare(testEvent);

    // Assert
    expect(mockTransactionRepo.create).toHaveBeenCalledTimes(1);
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ toUserId: 'upline-1', amount: 20 }));
  });

  it('should create no transactions if neither upline has a badge', async () => {
    // Arrange
    mockUserClient.getUplines.mockResolvedValue({
      upline1_userId: 'upline-1',
      upline2_userId: 'upline-2',
    });
    mockUserClient.hasEarningBadge.mockResolvedValue(false); // Both fail

    // Act
    await handlePromotionalFare(testEvent);

    // Assert
    expect(mockTransactionRepo.create).not.toHaveBeenCalled();
  });
});