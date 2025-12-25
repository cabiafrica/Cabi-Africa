import { Injectable, Logger } from '@nestjs/common';

type DocumentStatus = 'Approved' | 'Rejected';

/**
 * Mock Notification Service. In a real application, this would integrate
 * with a push notification provider (like Firebase) or an email service.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  sendDocumentStatusNotification(
    userId: string,
    documentType: string,
    status: DocumentStatus,
    reason?: string,
  ) {
    const message =
      status === 'Approved'
        ? `Your ${documentType} has been approved.`
        : `Your ${documentType} was rejected. Reason: ${reason}`;

    this.logger.log(`Sending notification to user ${userId}: "${message}"`);
    // This is where the actual push notification/email logic would go.
    return Promise.resolve();
  }
}