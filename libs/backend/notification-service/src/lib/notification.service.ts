import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import {
  PassengerReceiptPayload,
  DriverReceiptPayload,
  ReceiptEmailResult,
} from './receipt.types';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | null = null;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private isInitialized = false;

  constructor() {
    this.registerHandlebarsHelpers();
  }

  async onModuleInit() {
    await this.initEmailTransporter();
    this.loadTemplates();
  }

  private registerHandlebarsHelpers() {
    handlebars.registerHelper('formatDecimal', (val: any, decimals = 2) => {
      const num = Number(val);
      if (isNaN(num)) return '0.00';
      return num.toLocaleString('en-KE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    });

    handlebars.registerHelper('formatDate', (dateVal: any, format = 'full') => {
      try {
        const d = dateVal ? new Date(dateVal) : new Date();
        if (isNaN(d.getTime())) return String(dateVal);
        return d.toLocaleString('en-KE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
      } catch {
        return String(dateVal);
      }
    });

    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('currentYear', () => new Date().getFullYear());
  }

  private async initEmailTransporter() {
    try {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.logger.log(`Nodemailer configured with SMTP host: ${host}:${port}`);
      } else {
        // Fallback in dev/test: Try Ethereal or create a simulated test transport
        try {
          const testAccount = await nodemailer.createTestAccount();
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
          });
          this.logger.log('Nodemailer configured with Ethereal test account');
        } catch {
          // If network is offline, create json transport that simulates sending
          this.transporter = nodemailer.createTransport({
            jsonTransport: true,
          });
          this.logger.log('Nodemailer configured with JSON fallback transport (local simulated)');
        }
      }
      this.isInitialized = true;
    } catch (error: any) {
      this.logger.warn(`Could not initialize live email transport: ${error?.message}`);
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  private getTemplateDirectories(): string[] {
    return [
      path.join(__dirname, 'templates'),
      path.join(__dirname, 'lib', 'templates'),
      path.resolve(__dirname, '../../../../libs/backend/notification-service/src/lib/templates'),
      path.resolve(process.cwd(), 'libs/backend/notification-service/src/lib/templates'),
    ];
  }

  private loadTemplates() {
    const candidateDirs = this.getTemplateDirectories();
    let loadedCount = 0;

    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith('.hbs')) {
              const templateName = file.replace('.hbs', '');
              if (!this.templates.has(templateName)) {
                const content = fs.readFileSync(path.join(dir, file), 'utf8');
                this.templates.set(templateName, handlebars.compile(content));
                loadedCount++;
              }
            }
          }
        } catch (err: any) {
          this.logger.debug(`Could not read templates from ${dir}: ${err.message}`);
        }
      }
    }
    this.logger.log(`Loaded ${loadedCount} Handlebars email templates`);
  }

  private ensureTemplate(templateName: string): handlebars.TemplateDelegate {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName)!;
    }
    // Attempt lazy re-load if not already present
    this.loadTemplates();
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName)!;
    }

    // Direct filesystem probe
    for (const dir of this.getTemplateDirectories()) {
      const filePath = path.join(dir, `${templateName}.hbs`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const compiled = handlebars.compile(content);
        this.templates.set(templateName, compiled);
        return compiled;
      }
    }

    throw new Error(`Email template '${templateName}' not found.`);
  }

  private parseLocationString(loc: any): string {
    if (!loc) return 'Unknown location';
    if (typeof loc === 'string') {
      try {
        const parsed = JSON.parse(loc);
        if (parsed.address) return parsed.address;
        if (parsed.name) return parsed.name;
      } catch {
        return loc;
      }
    }
    if (typeof loc === 'object') {
      return loc.address || loc.name || (loc.lat && loc.lng ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'Trip point');
    }
    return String(loc);
  }

  // --- HTML RECEIPT RENDERING & SENDING ---

  renderPassengerReceiptHtml(data: PassengerReceiptPayload): string {
    const template = this.ensureTemplate('passenger-receipt');
    const templateData = {
      ...data,
      currency: data.currency || 'KES',
      pickupAddress: this.parseLocationString(data.pickupLocation),
      dropoffAddress: this.parseLocationString(data.dropoffLocation),
      supportUrl: data.supportUrl || 'https://cabi.africa/support',
      rideDate: data.rideDate || new Date(),
    };
    return template(templateData);
  }

  renderDriverReceiptHtml(data: DriverReceiptPayload): string {
    const template = this.ensureTemplate('driver-receipt');
    const templateData = {
      ...data,
      currency: data.currency || 'KES',
      pickupAddress: this.parseLocationString(data.pickupLocation),
      dropoffAddress: this.parseLocationString(data.dropoffLocation),
      supportUrl: data.supportUrl || 'https://cabi.africa/driver-support',
      driverDashboardUrl: data.driverDashboardUrl || 'https://app.cabi.africa/driver/earnings',
      rideDate: data.rideDate || new Date(),
    };
    return template(templateData);
  }

  async sendPassengerReceipt(data: PassengerReceiptPayload): Promise<ReceiptEmailResult> {
    if (!data.to || !data.to.includes('@')) {
      this.logger.warn(`Skipping passenger receipt email: Invalid or missing email address "${data.to}"`);
      return { success: false, error: 'Missing or invalid passenger email address' };
    }

    try {
      if (!this.transporter) {
        await this.initEmailTransporter();
      }

      const html = this.renderPassengerReceiptHtml(data);
      const currency = data.currency || 'KES';
      const formattedTotal = Number(data.totalFare).toFixed(2);
      const subject = `Your Cabi Trip Receipt - ${currency} ${formattedTotal} [${data.rideId}]`;
      const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Cabi Africa" <receipts@cabi.africa>';

      const info = await this.transporter!.sendMail({
        from,
        to: data.to,
        subject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logger.log(`📧 Passenger receipt sent to ${data.to} (Ride: ${data.rideId}). Message ID: ${info.messageId}`);
      if (previewUrl) {
        this.logger.log(`🔗 Email Preview URL: ${previewUrl}`);
      }

      return { success: true, messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.error(`Failed to send passenger receipt email to ${data.to}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  async sendDriverReceipt(data: DriverReceiptPayload): Promise<ReceiptEmailResult> {
    if (!data.to || !data.to.includes('@')) {
      this.logger.warn(`Skipping driver receipt email: Invalid or missing email address "${data.to}"`);
      return { success: false, error: 'Missing or invalid driver email address' };
    }

    try {
      if (!this.transporter) {
        await this.initEmailTransporter();
      }

      const html = this.renderDriverReceiptHtml(data);
      const currency = data.currency || 'KES';
      const formattedNet = Number(data.netDriverEarnings).toFixed(2);
      const subject = `Trip Earnings Summary: +${currency} ${formattedNet} [${data.rideId}]`;
      const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Cabi Drive" <partner-receipts@cabi.africa>';

      const info = await this.transporter!.sendMail({
        from,
        to: data.to,
        subject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logger.log(`📧 Driver receipt sent to ${data.to} (Ride: ${data.rideId}). Message ID: ${info.messageId}`);
      if (previewUrl) {
        this.logger.log(`🔗 Email Preview URL: ${previewUrl}`);
      }

      return { success: true, messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.error(`Failed to send driver receipt email to ${data.to}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  // --- EXISTING UTILITY METHODS PRESERVED ---

  private formatPhoneNumber(phone: string): string {
    let clean = (phone || '').trim().replace(/[\s-]/g, '');
    if (clean.startsWith('0')) {
      clean = `+254${clean.slice(1)}`;
    } else if (clean.startsWith('254')) {
      clean = `+${clean}`;
    } else if (!clean.startsWith('+')) {
      clean = `+${clean}`;
    }
    return clean;
  }

  async sendSms(phoneNumber: string, message: string) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    const senderId = process.env.AT_SENDER_ID;

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

        const result = (await response.json().catch(() => ({}))) as any;
        const messageId = result?.SMSMessageData?.Recipients?.[0]?.messageId || `at_${Date.now()}`;
        this.logger.log(`[Africa's Talking SMS] Dispatched to ${formattedPhone}: HTTP ${response.status} (ID: ${messageId})`);
        return { success: response.ok, messageId };
      } catch (err: any) {
        this.logger.warn(`[Africa's Talking SMS Fallback] Failed to ${formattedPhone}: ${err?.message}`);
        return { success: false, error: err?.message, messageId: `err_${Date.now()}` };
      }
    }

    console.log(`[NotificationService] 📱 Sending SMS to ${formattedPhone}: "${message}"`);
    return { success: true, messageId: `sms_${Date.now()}` };
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    console.log(`[NotificationService] 🔔 Sending Push to ${userId}: "${title} - ${body}"`);
    return { success: true, messageId: `push_${Date.now()}` };
  }

  async sendNotification(payload: { userId: string; title: string; body: string; data?: any }) {
    return this.sendPushNotification(payload.userId, payload.title, payload.body, payload.data);
  }


  async sendEmail(email: string, subject: string, content: string) {
    console.log(`[NotificationService] 📧 Sending Email to ${email}: "${subject}"`);
    try {
      if (!this.transporter) {
        await this.initEmailTransporter();
      }
      const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Cabi Africa" <no-reply@cabi.africa>';
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      const info = await this.transporter!.sendMail({
        from,
        to: email,
        subject,
        text: isHtml ? undefined : content,
        html: isHtml ? content : undefined,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.warn(`Direct email sending error: ${err.message}`);
      return { success: true, messageId: `email_${Date.now()}` };
    }
  }

  // Story 105.2: Delivery Tracking SMS
  async sendDeliveryTrackingSms(recipientPhone: string, senderName: string, tripId: string) {
    const trackingUrl = `https://cabi.app/tracking/${tripId}`;
    const message = `You have a package coming from ${senderName}! Track it here: ${trackingUrl}`;
    return this.sendSms(recipientPhone, message);
  }

  // Story 103.3: Weekly Commission Email
  async sendWeeklyCommissionSummary(email: string, name: string, amount: number, referralCount: number) {
    let message = '';
    try {
      const template = this.ensureTemplate('weekly-commission-summary');
      message = template({ name, amount, referralCount });
    } catch {
      message = `
      Weekly Commission Summary for ${name}
      -----------------------------------
      Total Earned: KES ${amount}
      New Referrals: ${referralCount}
      
      Log in to view details.
      -----------------------------------
      `;
    }

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
      daysUntilExpiry,
    });
  }
}
