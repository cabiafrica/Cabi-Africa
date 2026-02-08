import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationProvider, NotificationPayload } from './notification.provider';

@Injectable()
export class PushProvider extends NotificationProvider {
    channel: NotificationChannel = 'push';

    async send(payload: NotificationPayload): Promise<void> {
        this.logger.log(`[Push] Sending push notification to ${payload.to}`);
        this.logger.log(`[Push] Data: ${JSON.stringify(payload.data)}`);
        // Mock simulation
        await new Promise(resolve => setTimeout(resolve, 100));
        this.logger.log(`[Push] Success`);
    }
}
