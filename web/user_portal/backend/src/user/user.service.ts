import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { User } from './user.model';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

// Mocking an event emitter for inter-service communication
class EventEmitter {
  publish(event: string, payload: any) { console.log(`EventBus: Publishing event '${event}' with payload:`, payload); }
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  // Mock user database
  private users: User[] = [
    {
      id: 'user-123',
      name: 'Passenger One',
      email: 'passenger@personal.com',
      status: 'pending_onboarding',
      vacationStartDate: new Date('2024-08-20'),
      vacationEndDate: new Date('2024-08-28'),
    },
    {
      id: 'driver-456',
      name: 'Driver One',
      email: 'driver@company.com',
      role: 'Driver',
      status: 'Active',
      averageRating: 4.8,
    },
  ];

  // In a real app, this would be injected via NestJS DI
  private readonly eventEmitter = new EventEmitter();

  /**
   * Updates the business profile for a given user.
   * @param userId The ID of the user to update.
   * @param profileData The new business profile data.
   * @returns The updated user object.
   */
  async updateBusinessProfile(
    userId: string,
    profileData: UpdateBusinessProfileDto,
  ): Promise<User> {
    const user = this.users.find((u) => u.id === userId);

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    user.businessProfile = {
      workEmail: profileData.workEmail,
      defaultPaymentMethodId: profileData.paymentMethodId,
      expenseCode: profileData.expenseCode,
    };

    console.log('Updated user business profile:', user);
    return user;
  }

  /**
   * Finds a user by their ID.
   * @param userId The ID of the user to find.
   * @returns The user object or undefined if not found.
   */
  async findById(userId: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === userId);
  }

  /**
   * Activates a driver's account.
   * @param driverId The ID of the driver to activate.
   * @returns The updated user object.
   */
  async activateDriver(driverId: string): Promise<User> {
    const user = this.users.find((u) => u.id === driverId);
    if (!user) {
      throw new NotFoundException(`User with ID "${driverId}" not found.`);
    }
    user.status = 'Verified';
    this.logger.log(`Driver ${driverId} has been set to 'Verified'.`);

    // Publish the AccountActivated event for other services to consume
    this.eventEmitter.publish('account.activated', { userId: driverId });

    return user;
  }

  /**
   * Gets detailed information for a single user, including recent rides.
   * @param userId The ID of the user to fetch.
   * @returns The detailed user profile.
   */
  async getUserDetails(userId: string): Promise<any> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    // Mock recent ride history
    const recentRides = [
      { id: 'ride-1', date: new Date(), status: 'Completed', fare: 250 },
      { id: 'ride-2', date: new Date(Date.now() - 86400000), status: 'Completed', fare: 150 },
      { id: 'ride-3', date: new Date(Date.now() - 172800000), status: 'Cancelled', fare: 0 },
    ];

    return {
      ...user,
      recentRides,
    };
  }

  /**
   * Updates a user's status (e.g., to suspend or deactivate).
   * @param userId The ID of the user to update.
   * @param status The new status.
   * @param reason The mandatory reason for the change.
   * @returns The updated user object.
   */
  async updateUserStatus(userId: string, status: 'Suspended' | 'Deactivated' | 'Active', reason: string): Promise<User> {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('A reason is required to change a user\'s status.');
    }

    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    this.logger.warn(`ADMIN ACTION: Changing status of user ${userId} to '${status}'. Reason: ${reason}`);
    user.status = status;
    return user;
  }
}