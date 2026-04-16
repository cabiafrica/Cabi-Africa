import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
// Mocking imports for services that would be in other libs
class UserService {
  async activateDriver(driverId: string) { console.log(`UserService: Activating driver ${driverId}`); }
}
class NotificationService {
  sendNotification(payload: Record<string, unknown>) { console.log('NotificationService: Sending notification:', payload); }
}
class EventEmitter {
  publish(event: string, payload: unknown) { console.log(`EventBus: Publishing event '${event}' with payload:`, payload); }
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  // In a real app, these would be properly injected via NestJS DI
  private readonly userService = new UserService();
  private readonly notificationService = new NotificationService();
  private readonly eventEmitter = new EventEmitter();

  // Mock data store
  private documents: { id: string; driverId: string; type: string; status: string; fileUrl: string; required?: boolean }[] = [
    { id: 'doc-1', driverId: 'driver-789', type: 'Driver\'s License', status: 'Pending Review', fileUrl: '/mock-document.png', required: true },
    { id: 'doc-2', driverId: 'driver-789', type: 'Vehicle Insurance', status: 'Pending Review', fileUrl: '/mock-document.png', required: true },
    { id: 'doc-3', driverId: 'driver-789', type: 'Background Check', status: 'Approved', fileUrl: '/mock-document.png', required: true },
    { id: 'doc-4', driverId: 'driver-101', type: 'Driver\'s License', status: 'Pending Review', fileUrl: '/mock-document.png' },
  ];

  async updateDocumentStatus(docId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) {
    this.logger.log(`Updating status for document ${docId} to ${status}`);

    const docIndex = this.documents.findIndex(d => d.id === docId);
    if (docIndex === -1) {
      throw new NotFoundException(`Document with ID ${docId} not found.`);
    }

    if (status === 'Rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      throw new BadRequestException('A rejection reason is required when rejecting a document.');
    }

    const doc = this.documents[docIndex];
    doc.status = status;

    // Notify the driver
    const notificationTitle = `Your ${doc.type} has been ${status}`;
    const notificationBody = status === 'Rejected'
      ? `Reason: ${rejectionReason}. Please upload a new document.`
      : 'You are one step closer to getting on the road!';

    this.notificationService.sendNotification({
      userId: doc.driverId,
      title: notificationTitle,
      body: notificationBody,
    });

    // Check if all documents for this driver are now approved
    await this.checkAndActivateDriver(doc.driverId);

    return doc;
  }

  private async checkAndActivateDriver(driverId: string) {
    const driverDocs = this.documents.filter(d => d.driverId === driverId);
    // A document is considered required if the 'required' flag is explicitly true or not defined.
    const requiredDocs = driverDocs.filter(d => d.required === true || d.required === undefined);
    const allApproved = requiredDocs.every(d => d.status === 'Approved');

    if (allApproved && requiredDocs.length > 0) {
      this.logger.log(`All documents for driver ${driverId} are approved. Activating driver...`);
      try {
        await this.userService.activateDriver(driverId);
        this.notificationService.sendNotification({
          userId: driverId,
          title: 'Welcome Aboard!',
          body: 'Your account has been activated. You can now go online and start accepting rides.',
        });
      } catch (error) {
        this.logger.error(`Failed to activate driver ${driverId}`, error);
        // In a real app, you might have retry logic or flag the user for manual review.
      }
    } else {
      this.logger.log(`Driver ${driverId} still has pending or rejected documents.`);
    }
  }
}