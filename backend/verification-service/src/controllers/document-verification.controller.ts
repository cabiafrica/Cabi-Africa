import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DocumentVerificationService } from '../services/document-verification.service';
import {
  UploadDocumentDto,
  ValidateDocumentDto,
  DocumentVerificationResponseDto,
  ValidationResponseDto,
} from '../dto/document-verification.dto';
import { VerificationDocumentType, VerificationStatus } from '@prisma/client';

@Controller('v1/verification/document')
export class DocumentVerificationController {
  private readonly logger = new Logger(DocumentVerificationController.name);

  constructor(
    private readonly documentVerificationService: DocumentVerificationService,
  ) {}

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
        // continue to token check
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

  private assertAdmin(req: any): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new HttpException('Authentication required for administrative verification operations.', HttpStatus.UNAUTHORIZED);
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || perms.some((p: string) => p.startsWith('VERIFICATION_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new HttpException('Administrative verification privileges required.', HttpStatus.FORBIDDEN);
    }
  }

  private assertSelfOrAdmin(req: any, targetUserId: string): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new HttpException('Authentication required to access verification resources.', HttpStatus.UNAUTHORIZED);
    }
    const callerId = user.id || user.sub || user.userId;
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || perms.some((p: string) => p.startsWith('VERIFICATION_') || p === 'SUPER_ADMIN');
    if (callerId !== targetUserId && !isAdmin) {
      throw new HttpException('You are not authorized to access another user verification documents.', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Upload document for verification
   * POST /api/v1/verification/document/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('document'))
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
  ): Promise<DocumentVerificationResponseDto> {
    this.assertSelfOrAdmin(req, uploadDto.userId);
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Validate file type (images only)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG and PNG images are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new HttpException(
          'File too large. Maximum size is 5MB',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Uploading document: ${uploadDto.documentType} for user ${uploadDto.userId}`,
      );

      const verification =
        await this.documentVerificationService.uploadDocument(
          uploadDto.userId,
          uploadDto.documentType as any,
          file,
        );

      return {
        id: verification.id,
        userId: verification.userId,
        documentType: verification.documentType,
        extractedFields: verification.extractedData,
        status: verification.status,
        createdAt: verification.createdAt,
      };
    } catch (error) {
      this.logger.error('Error uploading document:', error);
      throw new HttpException(
        error.message || 'Failed to upload document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin review of document
   * POST /api/v1/verification/document/review
   */
  @Post('review')
  async adminReview(
    @Req() req: any,
    @Body()
    reviewDto: {
      verificationId: string;
      status: any;
      rejectionReason?: string;
      categories?: string[];
    },
  ): Promise<any> {
    this.assertAdmin(req);
    try {
      return await this.documentVerificationService.adminReview(
        reviewDto.verificationId,
        reviewDto.status,
        reviewDto.rejectionReason,
        reviewDto.categories,
      );
    } catch (error) {
      this.logger.error('Error in admin review:', error);
      throw new HttpException(
        error.message || 'Failed to process admin review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get verification status
   * GET /api/v1/verification/document/:id
   */
  @Get(':id')
  async getVerification(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<DocumentVerificationResponseDto> {
    try {
      const verification =
        await this.documentVerificationService.getVerification(id);

      if (!verification) {
        throw new HttpException('Verification not found', HttpStatus.NOT_FOUND);
      }

      this.assertSelfOrAdmin(req, verification.userId);

      return {
        id: verification.id,
        userId: verification.userId,
        documentType: verification.documentType,
        extractedFields: verification.extractedData,
        status: verification.status,
        createdAt: verification.createdAt,
      };
    } catch (error) {
      this.logger.error('Error getting verification:', error);
      throw new HttpException(
        error.message || 'Verification not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Get all verifications for a user
   * GET /api/v1/verification/document/user/:userId
   */
  @Get('user/:userId')
  async getUserVerifications(
    @Req() req: any,
    @Param('userId') userId: string,
  ): Promise<DocumentVerificationResponseDto[]> {
    this.assertSelfOrAdmin(req, userId);
    try {
      const verifications =
        await this.documentVerificationService.getUserVerifications(userId);

      return verifications.map((v) => ({
        id: v.id,
        userId: v.userId,
        documentType: v.documentType,
        extractedFields: v.extractedData,
        status: v.status,
        createdAt: v.createdAt,
      }));
    } catch (error) {
      this.logger.error('Error getting user verifications:', error);
      throw new HttpException(
        error.message || 'Failed to get verifications',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
