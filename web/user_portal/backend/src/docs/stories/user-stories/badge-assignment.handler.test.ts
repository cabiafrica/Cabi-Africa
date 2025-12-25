import { AdminServiceClient } from './admin.service.client';
import { PaymentServiceClient } from './payment.service.client';
import { RideServiceClient } from './ride.service.client';
import { UserRepository, User } from './user.repository';
import { handleBadgeAssignment } from './badge-assignment.handler';

// Mock all dependencies
jest.mock('./admin.service.client');
jest.mock('./ride.service.client');
jest.mock('./payment.service.client');
jest.mock('./user.repository');

describe('handleBadgeAssignment', () => {
  let mockAdminClient: jest.Mocked<AdminServiceClient>;
  let mockRideClient: jest.Mocked<RideServiceClient>;
  let mockPaymentClient: jest.Mocked<PaymentServiceClient>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminClient = new AdminServiceClient() as jest.Mocked<AdminServiceClient>;
    mockRideClient = new RideServiceClient() as jest.Mocked<RideServiceClient>;
    mockPaymentClient = new PaymentServiceClient() as jest.Mocked<PaymentServiceClient>;
    mockUserRepo = new UserRepository() as jest.Mocked<UserRepository>;

    // Re-wire the mock implementations
    (AdminServiceClient as jest.Mock).mockImplementation(() => mockAdminClient);
    (RideServiceClient as jest.Mock).mockImplementation(() => mockRideClient);
    (PaymentServiceClient as jest.Mock).mockImplementation(() => mockPaymentClient);
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepo);

    // Default mock for badge rules
    mockAdminClient.getBadgeDefinitions.mockResolvedValue([
      {
        badgeId: 'EARNING_BADGE',
        criteria: {
          minRating: 4.5,
          minCompletedTrips: 10,
        },
      },
    ]);
  });

  it('should assign a badge to a user who qualifies and does not have it', async () => {
    // Arrange
    const qualifyingUser: User = { userId: 'user-1', fullName: 'Qualified User', referralCode: 'Q1', rating: 4.8, badges: [] };
    mockUserRepo.getAllUsers.mockResolvedValue([qualifyingUser]);
    mockRideClient.getCompletedTripsForUser.mockResolvedValue(25);
    mockPaymentClient.getTotalEarningsForUser.mockResolvedValue(5000);

    // Act
    await handleBadgeAssignment();

    // Assert
    expect(mockUserRepo.updateUserBadges).toHaveBeenCalledTimes(1);
    expect(mockUserRepo.updateUserBadges).toHaveBeenCalledWith('user-1', ['EARNING_BADGE']);
  });

  it('should revoke a badge from a user who no longer qualifies', async () => {
    // Arrange
    const nonQualifyingUser: User = { userId: 'user-2', fullName: 'Unqualified User', referralCode: 'U2', rating: 4.2, badges: ['EARNING_BADGE'] };
    mockUserRepo.getAllUsers.mockResolvedValue([nonQualifyingUser]);
    mockRideClient.getCompletedTripsForUser.mockResolvedValue(5); // Does not meet trip criteria
    mockPaymentClient.getTotalEarningsForUser.mockResolvedValue(500);

    // Act
    await handleBadgeAssignment();

    // Assert
    expect(mockUserRepo.updateUserBadges).toHaveBeenCalledTimes(1);
    expect(mockUserRepo.updateUserBadges).toHaveBeenCalledWith('user-2', []);
  });

  it('should not update a user if their badge status does not change', async () => {
    // Arrange
    const alreadyQualifiedUser: User = { userId: 'user-1', fullName: 'Qualified User', referralCode: 'Q1', rating: 4.8, badges: ['EARNING_BADGE'] };
    const stillUnqualifiedUser: User = { userId: 'user-2', fullName: 'Unqualified User', referralCode: 'U2', rating: 4.2, badges: [] };
    mockUserRepo.getAllUsers.mockResolvedValue([alreadyQualifiedUser, stillUnqualifiedUser]);
    
    // Mock performance data for both
    mockRideClient.getCompletedTripsForUser.mockImplementation(async (userId) => (userId === 'user-1' ? 25 : 5));
    mockPaymentClient.getTotalEarningsForUser.mockImplementation(async (userId) => (userId === 'user-1' ? 5000 : 500));

    // Act
    await handleBadgeAssignment();

    // Assert
    expect(mockUserRepo.updateUserBadges).not.toHaveBeenCalled();
  });
});