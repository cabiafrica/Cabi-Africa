import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async setWebhookUrl(url: string): Promise<void> {
    this.webhookUrl = url;
    this.logger.log(`Webhook URL set to: ${url}`);
  }

  async sendWebhook(event: VerificationWebhookEvent): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.debug('No webhook URL configured, skipping notification');
      return;
    }

    try {
      this.logger.log(`Sending webhook for event: ${event.event}`);

      await axios.post(this.webhookUrl, event, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event.event,
          'X-Webhook-Timestamp': event.timestamp,
        },
        timeout: 10000,
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
