import { Controller, Get, Post, Body, Req, Param, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DocumentService } from './document.service';
import { DocumentType, DocumentStatus } from '@prisma/client';

@Controller('documents')
export class DriverDocumentController {
  constructor(private readonly documentService: DocumentService) { }

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req?.headers?.['x-internal-api-key'];
    if (internalKey && providedKey && typeof providedKey === 'string') {
      try {
        const a = Buffer.from(internalKey);
        const b = Buffer.from(providedKey);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return { role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
        }
      } catch {
        // continue
      }
    }
    const authHeader = req?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
      if (secret) {
        try {
          return jwt.verify(token, secret);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private getAuthenticatedUserId(req: any): string {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    const userId = user.id || user.sub || user.userId;
    if (!userId) {
      throw new UnauthorizedException('Could not identify user from token.');
    }
    return userId;
  }

  private assertAdmin(req: any): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p: string) => p.startsWith('VERIFICATION_') || p.startsWith('DRIVER_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Admin verification privileges required.');
    }
  }

  @Get('me')
  getMyDocuments(@Req() req: any) {
    const userId = this.getAuthenticatedUserId(req);
    return this.documentService.findForUser(userId);
  }

  @Get('me/history')
  getMyDocumentHistory(@Req() req: any) {
    const userId = this.getAuthenticatedUserId(req);
    return this.documentService.findHistoryForUser(userId);
  }

  @Post('upload')
  async uploadDocument(@Req() req: any, @Body() body: { type: DocumentType; url: string }) {
    const userId = this.getAuthenticatedUserId(req);
    return this.documentService.uploadDocument(userId, body.type, body.url);
  }

  // Admin Endpoints
  @Get('admin/drivers/:userId/documents')
  async getDriverDocumentsForAdmin(@Req() req: any, @Param('userId') userId: string) {
    this.assertAdmin(req);
    return this.documentService.getDriverDocuments(userId);
  }

  @Post('admin/documents/:docId/status')
  async updateDocumentStatus(
    @Req() req: any,
    @Param('docId') docId: string,
    @Body() body: { status: DocumentStatus; rejectionReason?: string }
  ) {
    this.assertAdmin(req);
    return this.documentService.updateStatus(docId, body.status, body.rejectionReason);
  }
}