import { Injectable, Logger } from '@nestjs/common';

// --- MOCK DEPENDENCIES FOR DEMONSTRATION ---
// In a real application, these would be imported from their respective libraries.

interface User {
  id: string;
  name: string;
  businessProfile?: {
    workEmail: string;
  };
}

interface Ride {
  id: string;
  userId: string;
  profile: 'personal' | 'business';
  date: Date;
  fare: number;
  destination: string;
}

@Injectable()
class UserService {
  // Mock data for users with business profiles
  private users: User[] = [
    {
      id: 'user-1',
      name: 'Alice',
      businessProfile: { workEmail: 'alice@corp.com' },
    },
    { id: 'user-2', name: 'Bob', businessProfile: undefined }, // No business profile
    {
      id: 'user-3',
      name: 'Charlie',
      businessProfile: { workEmail: 'charlie@corp.com' },
    },
  ];

  async findUsersWithBusinessProfiles(): Promise<User[]> {
    return this.users.filter((u) => u.businessProfile?.workEmail);
  }
}

@Injectable()
class RideService {
  // Mock data for rides taken in the last month
  private rides: Ride[] = [
    { id: 'ride-1', userId: 'user-1', profile: 'business', date: new Date('2024-07-15'), fare: 25.5, destination: 'HQ Office' },
    { id: 'ride-2', userId: 'user-1', profile: 'personal', date: new Date('2024-07-18'), fare: 15.0, destination: 'Home' },
    { id: 'ride-3', userId: 'user-1', profile: 'business', date: new Date('2024-07-22'), fare: 30.0, destination: 'Client Site' },
    { id: 'ride-4', userId: 'user-3', profile: 'business', date: new Date('2024-07-10'), fare: 45.0, destination: 'Airport' },
    { id: 'ride-5', userId: 'user-3', profile: 'business', date: new Date('2024-06-25'), fare: 20.0, destination: 'Old Trip' }, // Outside last month
  ];

  async findRidesForUser(userId: string, from: Date, to: Date, profile: 'business'): Promise<Ride[]> {
    return this.rides.filter(
      (r) => r.userId === userId && r.profile === profile && r.date >= from && r.date <= to
    );
  }
}

@Injectable()
class NotificationService {
  sendEmail(to: string, subject: string, body: string) {
    console.log('--- SENDING EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: \n${body}`);
    console.log('---------------------');
    return Promise.resolve();
  }
}

// --- MAIN SERVICE IMPLEMENTATION ---

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  // In a real app, these would be injected via NestJS DI
  private readonly userService = new UserService();
  private readonly rideService = new RideService();
  private readonly notificationService = new NotificationService();

  /**
   * Simulates a background job that runs on the first of the month.
   * It generates and sends monthly business travel summaries to users.
   */
  async generateMonthlySummaries() {
    this.logger.log('Starting monthly business summary job...');

    const users = await this.userService.findUsersWithBusinessProfiles();
    this.logger.log(`Found ${users.length} users with business profiles.`);

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const monthName = lastMonth.toLocaleString('default', { month: 'long' });

    for (const user of users) {
      const businessRides = await this.rideService.findRidesForUser(
        user.id,
        lastMonth,
        endOfLastMonth,
        'business'
      );

      if (businessRides.length > 0) {
        const totalSpent = businessRides.reduce((sum, ride) => sum + ride.fare, 0);
        const emailBody = `
          Hi ${user.name},

          Here is your business travel summary for ${monthName} ${lastMonth.getFullYear()}.

          Total Trips: ${businessRides.length}
          Total Spent: KES ${totalSpent.toFixed(2)}

          This is an automated report for your expense filing.
        `;

        await this.notificationService.sendEmail(
          user.businessProfile!.workEmail,
          `Your ${monthName} Business Travel Summary`,
          emailBody.trim()
        );
        this.logger.log(`Sent summary to ${user.businessProfile!.workEmail}`);
      }
    }

    this.logger.log('Monthly business summary job finished.');
  }
}