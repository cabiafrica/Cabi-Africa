import { Controller, UseGuards, Get, Post, Body, Req, Param } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentType, DocumentStatus } from '@prisma/client';

// In a real app, this would be a proper JWT/Role-based guard
class DriverGuard {
  canActivate() {
    console.log('DriverGuard: Allowing access for driver action.');
    return true;
  }
}

@Controller('documents')
export class DriverDocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Get('me')
  @UseGuards(new DriverGuard())
  getMyDocuments(@Req() req: any) {
    const userId = 'driver-123'; // Mock ID
    return this.documentService.findForUser(userId);
  }

  @Get('me/history')
  @UseGuards(new DriverGuard())
  getMyDocumentHistory(@Req() req: any) {
    const userId = 'driver-123'; // Mock ID
    return this.documentService.findHistoryForUser(userId);
  }

  @Post('upload')
  @UseGuards(new DriverGuard())
  async uploadDocument(@Req() req: any, @Body() body: { type: DocumentType; url: string }) {
    const userId = 'driver-123'; // Mock ID
    return this.documentService.uploadDocument(userId, body.type, body.url);
  }

  // Admin Endpoints
  @Get('admin/drivers/:userId/documents')
  async getDriverDocumentsForAdmin(@Param('userId') userId: string) {
    return this.documentService.getDriverDocuments(userId);
  }

  @Post('admin/documents/:docId/status')
  async updateDocumentStatus(
    @Param('docId') docId: string,
    @Body() body: { status: DocumentStatus; rejectionReason?: string }
  ) {
    return this.documentService.updateStatus(docId, body.status, body.rejectionReason);
  }
}