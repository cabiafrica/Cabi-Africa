import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationProvider, NotificationPayload } from './notification.provider';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EmailProvider extends NotificationProvider implements OnModuleInit {
  readonly channel = 'email';
  private transporter: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  async onModuleInit() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log('Nodemailer transporter configured with Ethereal');

      await this.loadTemplates();
      handlebars.registerHelper('currentYear', () => new Date().getFullYear());
    } catch (error) {
      this.logger.error('Failed to initialize EmailProvider', error);
    }
  }

  private async loadTemplates() {
    const templateDir = path.join(__dirname, '..', 'templates');
    const files = await fs.readdir(templateDir);
    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const templateId = file.replace('.hbs', '');
        const source = await fs.readFile(path.join(templateDir, file), 'utf8');
        this.templates.set(templateId, handlebars.compile(source));
        this.logger.log(`Loaded email template: ${templateId}`);
      }
    }
  }

  async send(payload: NotificationPayload): Promise<void> {
    const { to, data, templateId } = payload;
    if (!templateId || !this.templates.has(templateId)) {
      this.logger.error(`Email template '${templateId}' not found.`);
      return;
    }

    const template = this.templates.get(templateId);
    const subject = data.subject || 'Cabi Notification';
    const html = template(data);

    if (!this.transporter) {
      this.logger.error('Nodemailer transporter is not initialized. Cannot send email.');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"Cabi" <no-reply@cabi.example.com>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent via template '${templateId}' to ${to}. Message ID: ${info.messageId}`);
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }
}