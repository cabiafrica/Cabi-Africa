import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface VerificationWebhookEvent {
  event:
    | 'passenger.verified'
    | 'passenger.unverified'
    | 'document.submitted'
    | 'document.approved'
    | 'document.rejected';
  timestamp: string;
  data: {
    userId: string;
    verificationLevel: string;
    documents: Record<string, any>;
    aiAnalysis?: Record<string, any>;
    reason?: string;
  };
}

@Injectable()
export class VerificationWebhookService {
  private readonly logger = new Logger(VerificationWebhookService.name);
  private webhookUrl: string;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get('VERIFICATION_WEBHOOK_URL') || '';
  }

  private validateWebhookUrl(url: string): void {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('Invalid webhook URL format');
    }
    if (parsed.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Webhook URL must use HTTPS in production');
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new BadRequestException('Unsupported webhook URL protocol');
    }
    const host = parsed.hostname.toLowerCase();
    const blockedHostPattern =
      /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1|\[::1\]|172\.(1[6-9]|2\d|3[0-1])\.)/;
    if (blockedHostPattern.test(host) || host.endsWith('.internal')) {
      throw new BadRequestException('Webhook URL cannot target internal or private network addresses');
    }
  }

  async setWebhookUrl(url: string): Promise<void> {
    this.validateWebhookUrl(url);
    this.webhookUrl = url;
    this.logger.log(`Webhook URL set to: ${url}`);
  }

  async sendWebhook(event: VerificationWebhookEvent): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.debug('No webhook URL configured, skipping notification');
      return;
    }

    try {
      this.validateWebhookUrl(this.webhookUrl);
      this.logger.log(`Sending webhook for event: ${event.event}`);

      const payload = JSON.stringify(event);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event.event,
        'X-Webhook-Timestamp': event.timestamp,
      };
      const webhookSecret = this.configService.get('VERIFICATION_WEBHOOK_SECRET');
      if (webhookSecret) {
        const signature = crypto
          .createHmac('sha256', String(webhookSecret))
          .update(`${event.timestamp}.${payload}`)
          .digest('hex');
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }

      await axios.post(this.webhookUrl, payload, {
        headers,
        timeout: 10000,
        maxRedirects: 0,
      });

      this.logger.log(`Webhook sent successfully for event: ${event.event}`);
    } catch (error) {
      this.logger.error(`Failed to send webhook: ${error.message}`);
      // Don't throw - webhook failures shouldn't break the main flow
    }
  }

  async notifyPassengerVerified(
    userId: string,
    verificationLevel: string,
    documents: Record<string, any>,
  ): Promise<void> {
    await this.sendWebhook({
      event: 'passenger.verified',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        verificationLevel,
        documents,
      },
    });
  }

  async notifyPassengerUnverified(
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.sendWebhook({
      event: 'passenger.unverified',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        verificationLevel: 'NONE',
        documents: {},
        reason,
      },
    });
  }

  async notifyDocumentSubmitted(
    userId: string,
    documentType: string,
    aiAnalysis?: Record<string, any>,
  ): Promise<void> {
    await this.sendWebhook({
      event: 'document.submitted',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        verificationLevel: 'PENDING',
        documents: { [documentType]: { submitted: true } },
        aiAnalysis,
      },
    });
  }

  async notifyDocumentApproved(
    userId: string,
    documentType: string,
  ): Promise<void> {
    await this.sendWebhook({
      event: 'document.approved',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        verificationLevel: 'PENDING',
        documents: { [documentType]: { approved: true } },
      },
    });
  }

  async notifyDocumentRejected(
    userId: string,
    documentType: string,
    reason: string,
  ): Promise<void> {
    await this.sendWebhook({
      event: 'document.rejected',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        verificationLevel: 'PENDING',
        documents: { [documentType]: { rejected: true } },
        reason,
      } as any,
    });
  }
}
