import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

// Assuming a NotificationService exists to handle the actual sending.
import { NotificationService } from '../notification.service';

interface AccountActivatedPayload {
  userId: string;
  email: string;
}

@Injectable()
export class UserListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('account.activated')
  handleAccountActivated(payload: AccountActivatedPayload) {
    console.log(`Received account.activated event for user ${payload.userId}`);
    const message = {
      title: "You're Approved!",
      body: "Congratulations, you're approved! You can now go online and start receiving ride requests.",
    };
    this.notificationService.sendPushNotification(payload.userId, message);
  }
}