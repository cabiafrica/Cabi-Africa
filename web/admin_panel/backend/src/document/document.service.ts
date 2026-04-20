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
    const mockDocuments: UploadedDocument[] = [];

    // Mock user lookup
    const mockUsers: Record<string, {name: string}> = {};

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