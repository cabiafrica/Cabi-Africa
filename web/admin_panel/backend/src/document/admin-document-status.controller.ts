import { Controller, Post, Param, Body, Logger } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('admin/documents')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  
  // Mocking constructor injection
  private readonly documentService: DocumentService = new DocumentService();

  @Post(':id/status')
  updateDocumentStatus(
    @Param('id') docId: string,
    @Body() body: { status: 'Approved' | 'Rejected'; reason?: string },
  ) {
    this.logger.log(`Received request to update doc ${docId} to ${body.status}`);
    return this.documentService.updateDocumentStatus(docId, body.status, body.reason);
  }
}