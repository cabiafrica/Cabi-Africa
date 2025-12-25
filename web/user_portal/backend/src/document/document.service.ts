import { Injectable, Logger } from '@nestjs/common';
import { DocumentStatus, DriverDocument } from './document.model';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  // Mock database for documents
  private documents: DriverDocument[] = [];

  /**
   * Handles the upload of a document for a driver.
   * @param driverId The ID of the driver uploading the document.
   * @param documentType The type of document being uploaded (e.g., 'dl').
   * @param file The uploaded file object.
   * @returns The newly created or updated document record.
   */
  async handleUpload(
    driverId: string,
    documentType: string,
    file: Express.Multer.File,
  ): Promise<DriverDocument> {
    this.logger.log(`Handling upload for driver ${driverId}, doc type: ${documentType}`);

    // In a real app, this would upload the file to a cloud storage (e.g., S3)
    // and return a secure URL.
    const fileUrl = `https://fake-storage.com/${driverId}/${file.originalname}`;
    this.logger.log(`File stored at: ${fileUrl}`);

    const newDocument: DriverDocument = {
      id: `doc-${Math.random().toString(36).substring(2, 9)}`,
      driverId,
      documentType,
      fileUrl,
      status: DocumentStatus.PENDING_REVIEW, // Set status to 'Pending Review'
      uploadedAt: new Date(),
    };

    this.documents.push(newDocument);
    return newDocument;
  }
}