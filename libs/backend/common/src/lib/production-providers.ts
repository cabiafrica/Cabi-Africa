import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SmsProvider, EmailProvider } from './interfaces';

export class ProductionSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ProductionSmsProvider.name);

  /**
   * Normalizes Kenyan and East African phone numbers to E.164 format (+254...)
   */
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

  async sendSms(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
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

        const result = (await response.json().catch(() => ({}))) as any;
        const messageId = result?.SMSMessageData?.Recipients?.[0]?.messageId || `at_${Date.now()}`;
        this.logger.log(`[Africa's Talking SMS] Dispatched to ${formattedPhone}: HTTP ${response.status} (ID: ${messageId})`);
        return { success: response.ok, messageId };
      } catch (err: any) {
        this.logger.warn(`[Africa's Talking SMS Delivery Warning] Failed to ${formattedPhone}: ${err?.message}`);
        return { success: false, error: err?.message, messageId: `err_${Date.now()}` };
      }
    }

    // Local / Sandbox Fallback Logger
    this.logger.log(`📱 [SMS DISPATCH] To: ${formattedPhone} | Message: ${message}`);
    return { success: true, messageId: `mock_sms_${Date.now()}` };
  }

  async sendOtp(to: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSms(to, `Welcome to Cabi Africa! Your verification code is: ${otp}. It expires in 10 minutes.`);
  }
}

export class ProductionEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ProductionEmailProvider.name);
  private transporter: nodemailer.Transporter | null = null;
  private initializingPromise: Promise<void> | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    if (!this.initializingPromise) {
      this.initializingPromise = (async () => {
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
          this.logger.log(`[EmailProvider] Configured live SMTP transport (${host}:${port})`);
        } else {
          try {
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: { user: testAccount.user, pass: testAccount.pass },
            });
            this.logger.log('[EmailProvider] Configured Ethereal test account fallback');
          } catch {
            this.transporter = nodemailer.createTransport({ jsonTransport: true });
            this.logger.log('[EmailProvider] Configured JSON simulated fallback transport');
          }
        }
      })();
    }

    await this.initializingPromise;
    return this.transporter!;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Cabi Africa" <no-reply@cabi.africa>';
    const isHtml = /<[a-z][\s\S]*>/i.test(body);

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: isHtml ? undefined : body,
        html: isHtml ? body : undefined,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📧 [Email Dispatched (Test Preview)]: ${previewUrl}`);
      } else {
        this.logger.log(`📧 [Email Dispatched] To: ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
      }

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.warn(`📧 [Email Dispatch Warning] To: ${to} failed: ${err.message}`);
      return { success: false, error: err.message, messageId: `err_${Date.now()}` };
    }
  }
}
