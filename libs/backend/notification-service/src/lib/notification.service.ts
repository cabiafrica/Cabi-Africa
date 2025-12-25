import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {

    async sendSms(phoneNumber: string, message: string) {
        console.log(`[NotificationService] 📱 Sending SMS to ${phoneNumber}: "${message}"`);
        // Integration with Twilio/SNS would go here
        return { success: true, messageId: `sms_${Date.now()}` };
    }

    async sendPushNotification(userId: string, title: string, body: string, data?: any) {
        console.log(`[NotificationService] 🔔 Sending Push to ${userId}: "${title} - ${body}"`);
        // Integration with FCM/APNS would go here
        return { success: true, messageId: `push_${Date.now()}` };
    }

    async sendEmail(email: string, subject: string, content: string) {
        console.log(`[NotificationService] 📧 Sending Email to ${email}: "${subject}"`);
        // Integration with SendGrid/SES would go here
        return { success: true, messageId: `email_${Date.now()}` };
    }

    // Story 105.2: Delivery Tracking SMS
    async sendDeliveryTrackingSms(recipientPhone: string, senderName: string, tripId: string) {
        const trackingUrl = `https://cabi.app/tracking/${tripId}`;
        const message = `You have a package coming from ${senderName}! Track it here: ${trackingUrl}`;
        return this.sendSms(recipientPhone, message);
    }
    // Story 103.3: Weekly Commission Email
    async sendWeeklyCommissionSummary(email: string, name: string, amount: number, referralCount: number) {
        // Mock template loading
        // In real app: fs.readFileSync('./templates/weekly-commission-summary.hbs')
        const message = `
        Weekly Commission Summary for ${name}
        -----------------------------------
        Total Earned: KES ${amount}
        New Referrals: ${referralCount}
        
        Log in to view details.
        -----------------------------------
        `;

        console.log(`[NotificationService] 📧 Sending Weekly Commission Email to ${email}`);
        return this.sendEmail(email, 'Your Weekly Commission Summary', message);
    }

    // Story 120.9: Certificate Expiration Reminders
    async sendCertificateExpirationReminder(email: string, organizationName: string, daysUntilExpiry: number) {
        const subject = `Action Required: ${organizationName} Certificate Expiring Soon`;
        const message = `
        Certificate Expiration Notice
        -----------------------------------
        Organization: ${organizationName}
        Days Until Expiration: ${daysUntilExpiry}
        
        Your organization's registration certificate will expire in ${daysUntilExpiry} days.
        Please upload a new certificate to maintain your organization's active status.
        
        Once expired, your organization's portal features will be disabled until a new
        certificate is uploaded and verified.
        
        Log in to the Group Portal to upload a new certificate.
        -----------------------------------
        `;

        console.log(`[NotificationService] 📧 Sending Certificate Expiration Reminder to ${email} (${daysUntilExpiry} days)`);
        return this.sendEmail(email, subject, message);
    }

    async sendCertificateExpirationPushNotification(userId: string, organizationName: string, daysUntilExpiry: number) {
        const title = 'Certificate Expiring Soon';
        const body = `${organizationName}'s certificate expires in ${daysUntilExpiry} days. Upload a new certificate to maintain active status.`;

        return this.sendPushNotification(userId, title, body, {
            type: 'CERTIFICATE_EXPIRATION',
            organizationName,
            daysUntilExpiry
        });
    }
}
