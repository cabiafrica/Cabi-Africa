import { Injectable } from '@nestjs/common';
import { NotificationProvider, NotificationPayload } from './notification.provider';

@Injectable()
export class SmsProvider extends NotificationProvider {
  readonly channel = 'sms';

  async send(payload: NotificationPayload): Promise<void> {
    const { to, data, templateId } = payload;
    let message: string;

    switch (templateId) {
      case 'forgot-email-otp':
        message = `Your Cabi verification code is: ${data.otp}. It will expire in 10 minutes.`;
        break;
      case 'driver-verification-otp':
        message = `Your Cabi Driver onboarding code is: ${data.otp}. Never share this code with anyone.`;
        break;
      default:
        message = data.message || 'You have a new notification from Cabi Africa.';
    }

    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    const senderId = process.env.AT_SENDER_ID; // Alphanumeric Sender ID (e.g., CABI)

    // Normalize phone number to E.164 (+254...)
    let formattedPhone = to.trim().replace(/[\s-]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `+254${formattedPhone.slice(1)}`;
    } else if (formattedPhone.startsWith('254')) {
      formattedPhone = `+${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Live Africa's Talking Cellular SMS Dispatch
    if (username && apiKey && username !== 'mock') {
      try {
        const isSandbox = username.toLowerCase() === 'sandbox';
        const endpoint = isSandbox
          ? 'https://api.sandbox.africastalking.com/version1/messaging'
          : 'https://api.africastalking.com/version1/messaging';

        const bodyParams = new URLSearchParams();
        bodyParams.append('username', username);
        bodyParams.append('to', formattedPhone);
        bodyParams.append('message', message);
        if (senderId && !isSandbox) {
          bodyParams.append('from', senderId);
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            apiKey: apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: bodyParams.toString(),
        });

        const result = await response.json().catch(() => ({}));
        this.logger.log(`[Africa's Talking SMS] Dispatched to ${formattedPhone}: HTTP ${response.status}`);
        return;
      } catch (err: any) {
        this.logger.warn(`[Africa's Talking SMS Fallback] Delivery failed: ${err?.message}`);
      }
    }

    // Development / Mock Fallback Logger
    this.logger.log(`--- [MOCK SMS DISPATCH] To: ${formattedPhone} ---`);
    this.logger.log(`Message: ${message}`);
  }
}
