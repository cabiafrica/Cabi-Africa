import { Injectable, Logger } from '@nestjs/common';

export interface UploadedDocument {
  id: string;
  driverId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: 'Pending Review';
  uploadedAt: string;
  expiryDate?: string; // ISO 8601 string
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  async handleDocumentUpload(driverId: string, documentType: string, file: Express.Multer.File): Promise<UploadedDocument> {
    this.logger.log(`Received document upload for driver [${driverId}]`);
    this.logger.log(`Document Type: ${documentType}, File: ${file.originalname}, Size: ${file.size} bytes`);

    // In a real application, you would:
    // 1. Upload the file.buffer to a cloud storage service (e.g., S3, Google Cloud Storage).
    // 2. Get the URL of the stored file.
    // 3. Save the document metadata (driverId, documentType, fileUrl, etc.) to a database.
    // 4. Return the database record.

    const result: UploadedDocument = { id: `doc-${Date.now()}`, driverId, documentType, fileName: file.originalname, mimeType: file.mimetype, size: file.size, status: 'Pending Review', uploadedAt: new Date().toISOString() };
    return result;
  }

  /**
   * Mocks fetching documents that are expiring soon.
   * @param days The number of days to look ahead for expiry.
   */
  async getExpiringDocuments(days: number): Promise<Record<string, unknown>[]> {
    // Mock data with expiry dates
    const mockDocuments: UploadedDocument[] = [
        { id: 'doc-1', driverId: 'driver-123', documentType: 'Driver\'s License', status: 'Approved', expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), fileName: 'dl.jpg', mimeType: 'image/jpeg', size: 123, uploadedAt: '' },
        { id: 'doc-2', driverId: 'driver-456', documentType: 'Vehicle Insurance', status: 'Approved', expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), fileName: 'ins.pdf', mimeType: 'application/pdf', size: 456, uploadedAt: '' },
        { id: 'doc-3', driverId: 'driver-789', documentType: 'PSV License', status: 'Approved', expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), fileName: 'psv.jpg', mimeType: 'image/jpeg', size: 789, uploadedAt: '' },
        { id: 'doc-4', driverId: 'driver-101', documentType: 'Driver\'s License', status: 'Pending Review', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), fileName: 'dl2.jpg', mimeType: 'image/jpeg', size: 101, uploadedAt: '' },
        { id: 'doc-5', driverId: 'driver-112', documentType: 'Driver\'s License', status: 'Approved', expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), fileName: 'dl3.jpg', mimeType: 'image/jpeg', size: 112, uploadedAt: '' }, // Already expired
    ];

    // Mock user lookup
    const mockUsers = {
        'driver-123': { name: 'John Doe' },
        'driver-456': { name: 'Jane Smith' },
    };

    const thresholdDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const now = new Date();

    const expiring = mockDocuments.filter(doc =>
        doc.status === 'Approved' &&
        doc.expiryDate &&
        new Date(doc.expiryDate) <= thresholdDate &&
        new Date(doc.expiryDate) > now
    );

    return expiring.map(doc => ({
        driverName: mockUsers[doc.driverId]?.name || 'Unknown Driver',
        ...doc,
    }));
  }
}