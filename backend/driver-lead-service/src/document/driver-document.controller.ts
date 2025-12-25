import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { DocumentService } from './document.service';

// In a real app, this would be a proper JWT/Role-based guard
class DriverGuard {
  canActivate() {
    console.log('DriverGuard: Allowing access for driver action.');
    return true;
  }
}

@Controller('documents')
@UseGuards(new DriverGuard())
export class DriverDocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('me')
  getMyDocuments(@Req() req: any) {
    // In a real NestJS app with Passport.js, the user object would be on `req.user`.
    // We'll simulate this by hardcoding the user ID for the mock.
    const userId = 'driver-123'; // req.user.id;

    return this.documentService.findForUser(userId);
  }

  @Get('me/history')
  getMyDocumentHistory(@Req() req: any) {
    // In a real NestJS app with Passport.js, the user object would be on `req.user`.
    // We'll simulate this by hardcoding the user ID for the mock.
    const userId = 'driver-123'; // req.user.id;

    return this.documentService.findHistoryForUser(userId);
  }
}