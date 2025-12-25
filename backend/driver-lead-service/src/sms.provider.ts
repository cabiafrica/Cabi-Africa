import { Injectable } from '@nestjs/common';
import { NotificationProvider, NotificationPayload } from './notification.provider';

@Injectable()
export class SmsProvider extends NotificationProvider {
  readonly channel = 'sms';

  async send(payload: NotificationPayload): Promise<void> {
    const { to, data, templateId } = payload;
    let message: string;

    // In a real app, you might use a template engine for SMS too.
    switch (templateId) {
      case 'forgot-email-otp':
        message = `Your Cabi verification code is: ${data.otp}. It will expire in 10 minutes.`;
        break;
      default:
        message = data.message || 'You have a new notification from Cabi.';
    }

    // This is a mock implementation. In a real app, you would use an SMS client here (e.g., Twilio).
    this.logger.log(`--- MOCK SMS SENT to ${to} ---`);
    this.logger.log(`Message: ${message}`);
  }
}