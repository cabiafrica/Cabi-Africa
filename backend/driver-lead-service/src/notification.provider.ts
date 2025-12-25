import { Logger } from '@nestjs/common';

export interface NotificationPayload {
  to: string;
  data: Record<string, any>;
  templateId?: string; // e.g., 'recovery-code-alert'
}

export type NotificationChannel = 'email' | 'sms' | 'push';

export interface Notification {
  channel: NotificationChannel;
  payload: NotificationPayload;
}

export abstract class NotificationProvider {
  protected readonly logger = new Logger(this.constructor.name);
  abstract channel: NotificationChannel;
  abstract send(payload: NotificationPayload): Promise<void>;
}