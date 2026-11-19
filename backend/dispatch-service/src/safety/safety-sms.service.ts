import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SafetySmsService {
  private readonly logger = new Logger(SafetySmsService.name);

  /**
   * Normalizes phone numbers to standard E.164 format (+254...)
   */
  private formatPhoneNumber(phone: string): string {
    let clean = phone.trim().replace(/[\s-]/g, '');
    if (clean.startsWith('0')) {
      clean = `+254${clean.slice(1)}`;
    } else if (clean.startsWith('254')) {
      clean = `+${clean}`;
    } else if (!clean.startsWith('+')) {
      clean = `+${clean}`;
    }
    return clean;
  }

  /**
   * Sends an SMS via Africa's Talking cellular rails with mock fallback
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(to);
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    const senderId = process.env.AT_SENDER_ID; // Alphanumeric Sender ID (e.g. CABI)

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

        this.logger.log(`[Africa's Talking SMS] Emergency SMS dispatched to ${formattedPhone}: HTTP ${response.status}`);
        return response.ok;
      } catch (err: any) {
        this.logger.warn(`[Africa's Talking SMS Fallback] Emergency SMS failed to ${formattedPhone}: ${err?.message}`);
      }
    }

    // Development / Mock Fallback Logger
    this.logger.log(`🚨 [EMERGENCY SMS DISPATCH] To: ${formattedPhone} | Message: ${message}`);
    return true;
  }

  /**
   * Sends emergency alert SMS with live tracking link to passenger's trusted contact
   */
  async sendEmergencyContactAlert(
    contactPhone: string,
    passengerName: string,
    trackingUrl: string,
    coordinates: { lat: number; lng: number }
  ): Promise<boolean> {
    const message = `🚨 CABI EMERGENCY ALERT: Your contact ${passengerName} has triggered an SOS panic signal during a trip. Live Location Map: ${trackingUrl} (Coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}). Cabi Rapid Response is monitoring.`;
    return this.sendSms(contactPhone, message);
  }

  /**
   * Sends distress alert SMS to Sacco Distress Patron / Welfare Base Commander
   */
  async sendPatronDistressAlert(
    patronPhone: string,
    callerRole: string,
    callerName: string,
    groupName: string,
    trackingUrl: string
  ): Promise<boolean> {
    const message = `🚨 SACCO DISTRESS SIGNAL: ${callerRole} ${callerName} from [${groupName}] has initiated an emergency distress broadcast. Tracking map: ${trackingUrl}. Universal Proximity Mesh activated.`;
    return this.sendSms(patronPhone, message);
  }
}
