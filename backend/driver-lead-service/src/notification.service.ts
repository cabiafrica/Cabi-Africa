import { Injectable, Logger } from '@nestjs/common';
import { Notification, NotificationChannel, NotificationProvider } from './notification.provider';
import { EmailProvider } from './email.provider';
import { SmsProvider } from './sms.provider';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
  ) {
    this.registerProvider(emailProvider);
    this.registerProvider(smsProvider);
  }

  private registerProvider(provider: NotificationProvider) {
    this.providers.set(provider.channel, provider);
    this.logger.log(`Registered notification provider for channel: ${provider.channel}`);
  }

  async send(notification: Notification): Promise<void> {
    const provider = this.providers.get(notification.channel);
    if (!provider) {
      this.logger.warn(`No provider found for notification channel: ${notification.channel}`);
      return;
    }
    try {
      await provider.send(notification.payload);
    } catch (error) {
      this.logger.error(`Error sending notification via ${notification.channel}`, error);
    }
  }
}