import { Injectable, Logger } from '@nestjs/common';

// --- MOCK DEPENDENCIES FOR DEMONSTRATION ---

interface User {
  id: string;
  name: string;
  vacationStartDate?: Date;
  vacationEndDate?: Date;
}

@Injectable()
class UserService {
  private users: User[] = [
    {
      id: 'driver-on-vacation',
      name: 'Driver Jane',
      vacationStartDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
      vacationEndDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
    },
    {
      id: 'driver-active',
      name: 'Driver John',
    },
  ];

  async findUserById(userId: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === userId);
  }
}

// --- MAIN SERVICE IMPLEMENTATION ---

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'promotional' | 'transactional' | 'critical';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly userService = new UserService(); // Injected service

  async sendNotification(payload: NotificationPayload) {
    const user = await this.userService.findUserById(payload.userId);

    if (!user) {
      this.logger.warn(`User not found: ${payload.userId}. Cannot send notification.`);
      return;
    }

    // Check for active vacation period
    if (user.vacationStartDate && user.vacationEndDate) {
      const now = new Date();
      if (now >= user.vacationStartDate && now <= user.vacationEndDate) {
        // Suppress non-critical notifications
        if (payload.type === 'promotional') {
          this.logger.log(`Suppressing promotional notification for ${user.id} due to vacation mode.`);
          return;
        }
      }
    }

    this.logger.log(`Sending notification to ${user.id}: "${payload.title}"`);
    console.log('--- SENDING PUSH NOTIFICATION ---', payload);
  }
}