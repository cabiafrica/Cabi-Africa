import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Notification, NotificationChannel, NotificationProvider } from './notification.provider';
import { EmailProvider } from './email.provider';
import { SmsProvider } from './sms.provider';
import { PushProvider } from './push.provider';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import * as path from 'path';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();
  private transporter: nodemailer.Transporter;
  private recoveryCodeTemplate: handlebars.TemplateDelegate;

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
  ) {
    this.registerProvider(emailProvider);
    this.registerProvider(smsProvider);
    this.registerProvider(pushProvider);
  }


  async onModuleInit() {
    // For demo/development, use ethereal mail or mock
    const account = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    try {
      const templatePath = path.join(__dirname, 'recovery-code-alert.hbs');
      const source = await fs.readFile(templatePath, 'utf8');
      this.recoveryCodeTemplate = handlebars.compile(source);

      handlebars.registerHelper('currentYear', () => new Date().getFullYear());
    } catch (error) {
      this.logger.error('Failed to load email templates', error);
    }
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

  async sendRecoveryCodeLoginAlert(email: string) {
    if (!this.transporter || !this.recoveryCodeTemplate) {
      this.logger.error('Transporter or template not initialized');
      return;
    }

    const html = this.recoveryCodeTemplate({
      loginTime: new Date().toLocaleString(),
    });

    const info = await this.transporter.sendMail({
      from: '"Cabi Security" <no-reply@cabi.example.com>',
      to: email,
      subject: 'Security Alert: A Recovery Code Was Used for Your Cabi Account',
      html,
    });

    this.logger.log(`Recovery code alert sent: ${nodemailer.getTestMessageUrl(info)}`);
  }

  async sendForgotEmailOtp(phone: string, otp: string) {
    await this.send({
      channel: 'sms',
      payload: {
        to: phone,
        data: { message: `Your Cabi verification code is: ${otp}. It expires in 10 minutes.` }
      }
    });
  }

  async sendSuspiciousLoginReportedAlert(email: string, loginEntry: any) {
    // Mock implementation for now
    this.logger.log(`Sending suspicious login alert to ${email} for session ${loginEntry.id}`);
  }
}
