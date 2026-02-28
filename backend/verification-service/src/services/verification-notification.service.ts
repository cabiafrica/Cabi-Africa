import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NotificationPayload {
  type: 'SMS' | 'EMAIL' | 'PUSH';
  recipient: string;
  template: string;
  data: Record<string, any>;
}

export interface VerificationNotification {
  userId: string;
  phone?: string;
  email?: string;
  event: 'VERIFICATION_REQUIRED' | 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED' | 'DOCUMENT_REVIEWED' | 'TRIP_REJECTED';
  data: Record<string, any>;
}

@Injectable()
export class VerificationNotificationService {
  private readonly logger = new Logger(VerificationNotificationService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationNotification(notification: VerificationNotification): Promise<void> {
    const { userId, phone, email, event, data } = notification;

    this.logger.log(`Sending verification notification: ${event} to user ${userId}`);

    // Send SMS notification
    if (phone) {
      await this.sendSms(phone, this.getSmsTemplate(event, data));
    }

    // Send email notification
    if (email) {
      await this.sendEmail(email, this.getEmailSubject(event), this.getEmailTemplate(event, data));
    }

    // Send push notification (would integrate with FCM/APNs)
    await this.sendPush(userId, this.getPushTemplate(event, data));
  }

  async notifyVerificationRequired(userId: string, phone: string, email: string, remainingTrips: number): Promise<void> {
    await this.sendVerificationNotification({
      userId,
      phone,
      email,
      event: 'VERIFICATION_REQUIRED',
      data: {
        remainingTrips,
        message: `You have ${remainingTrips} trip(s) remaining. Verify your identity to continue using the service.`,
      },
    });
  }

  async notifyVerificationApproved(userId: string, phone: string, email: string): Promise<void> {
    await this.sendVerificationNotification({
      userId,
      phone,
      email,
      event: 'VERIFICATION_APPROVED',
      data: {
        message: 'Congratulations! Your account has been verified. You now enjoy priority service.',
      },
    });
  }

  async notifyVerificationRejected(userId: string, phone: string, email: string, reason: string): Promise<void> {
    await this.sendVerificationNotification({
      userId,
      phone,
      email,
      event: 'VERIFICATION_REJECTED',
      data: {
        reason,
        message: 'Your verification was rejected. Please submit new documents.',
      },
    });
  }

  async notifyTripRejected(userId: string, phone: string, email: string, driverName: string, reason: string): Promise<void> {
    await this.sendVerificationNotification({
      userId,
      phone,
      email,
      event: 'TRIP_REJECTED',
      data: {
        driverName,
        reason,
        message: `A driver (${driverName}) rejected your ride request. Reason: ${reason}. Consider verifying your identity for better service.`,
      },
    });
  }

  async notifyDocumentUnderReview(userId: string, phone: string, email: string): Promise<void> {
    await this.sendVerificationNotification({
      userId,
      phone,
      email,
      event: 'DOCUMENT_REVIEWED',
      data: {
        message: 'Your documents are under review. You will be notified once verification is complete.',
      },
    });
  }

  private async sendSms(phone: string, message: string): Promise<void> {
    this.logger.log(`[SMS] To: ${phone}, Message: ${message}`);
    
    // In production, integrate with:
    // - Twilio
    // - Africa'S Talking
    // - M-Pesa API
    // Example:
    // await twilio.messages.create({ body: message, from: '+1234567890', to: phone });
  }

  private async sendEmail(email: string, subject: string, body: string): Promise<void> {
    this.logger.log(`[EMAIL] To: ${email}, Subject: ${subject}`);
    
    // In production, integrate with:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
  }

  private async sendPush(userId: string, notification: { title: string; body: string }): Promise<void> {
    this.logger.log(`[PUSH] To: ${userId}, Title: ${notification.title}`);
    
    // In production, integrate with:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNs)
  }

  private getSmsTemplate(event: string, data: Record<string, any>): string {
    switch (event) {
      case 'VERIFICATION_REQUIRED':
        return `Cabi Africa: ${data.message} Verify now to avoid service interruption. Visit the app to complete verification.`;
      case 'VERIFICATION_APPROVED':
        return `Cabi Africa: Your account has been verified! You now enjoy priority service and unlimited rides.`;
      case 'VERIFICATION_REJECTED':
        return `Cabi Africa: Verification rejected. ${data.reason}. Please submit new documents in the app.`;
      case 'TRIP_REJECTED':
        return `Cabi Africa: ${data.message}`;
      default:
        return `Cabi Africa: Update on your verification status.`;
    }
  }

  private getEmailSubject(event: string): string {
    switch (event) {
      case 'VERIFICATION_REQUIRED':
        return 'Action Required: Verify Your Cabi Africa Account';
      case 'VERIFICATION_APPROVED':
        return 'Welcome to Cabi Africa - Account Verified!';
      case 'VERIFICATION_REJECTED':
        return 'Verification Status Update - Cabi Africa';
      case 'TRIP_REJECTED':
        return 'Ride Request Update - Cabi Africa';
      default:
        return 'Cabi Africa - Verification Update';
    }
  }

  private getEmailTemplate(event: string, data: Record<string, any>): string {
    const baseUrl = this.configService.get('APP_URL') || 'https://cabi.africa';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2E7D32; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Cabi Africa</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          ${event === 'VERIFICATION_APPROVED' ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 60px;">✅</span>
            </div>
            <h2 style="color: #2E7D32; text-align: center;">Congratulations!</h2>
          ` : event === 'VERIFICATION_REJECTED' ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 60px;">❌</span>
            </div>
            <h2 style="color: #d32f2f; text-align: center;">Verification Rejected</h2>
          ` : `
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 60px;">⚠️</span>
            </div>
            <h2 style="color: #f57c00; text-align: center;">Action Required</h2>
          `}
          
          <p style="font-size: 16px; color: #333;">${data.message}</p>
          
          ${event === 'VERIFICATION_REQUIRED' ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${baseUrl}/verify" style="background-color: #2E7D32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Now
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              You have ${data.remainingTrips} trip(s) remaining before verification is required.
            </p>
          ` : ''}
          
          ${event === 'VERIFICATION_REJECTED' ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${baseUrl}/verify" style="background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Submit New Documents
              </a>
            </div>
          ` : ''}
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Cabi Africa. All rights reserved.</p>
          <p>
            <a href="${baseUrl}/privacy" style="color: #aaa;">Privacy Policy</a> | 
            <a href="${baseUrl}/terms" style="color: #aaa;">Terms of Service</a> | 
            <a href="${baseUrl}/support" style="color: #aaa;">Support</a>
          </p>
        </div>
      </div>
    `;
  }

  private getPushTemplate(event: string, data: Record<string, any>): { title: string; body: string } {
    switch (event) {
      case 'VERIFICATION_REQUIRED':
        return {
          title: 'Verify Your Account',
          body: data.message,
        };
      case 'VERIFICATION_APPROVED':
        return {
          title: 'Account Verified!',
          body: 'Your account has been verified. Enjoy priority service!',
        };
      case 'VERIFICATION_REJECTED':
        return {
          title: 'Verification Rejected',
          body: data.reason,
        };
      case 'TRIP_REJECTED':
        return {
          title: 'Ride Request Update',
          body: data.message,
        };
      default:
        return {
          title: 'Cabi Africa',
          body: 'Update on your verification status',
        };
    }
  }
}
