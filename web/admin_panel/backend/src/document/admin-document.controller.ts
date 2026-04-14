import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';

// In a real app, this would be a proper JWT/Role-based guard
class AdminGuard {
  canActivate() {
    return true;
  }
}

@Controller('admin/documents')
@UseGuards(new AdminGuard())
export class AdminDocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('expiring')
  findExpiringDocuments(@Query('days') days = '30') {
    const daysAhead = parseInt(days, 10);
    if (isNaN(daysAhead)) {
      return this.documentService.getExpiringDocuments(30);
    }
    return this.documentService.getExpiringDocuments(daysAhead);
  }
}