import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentVerificationService } from '../services/document-verification.service';
import {
  UploadDocumentDto,
  ValidateDocumentDto,
  DocumentVerificationResponseDto,
  ValidationResponseDto,
} from '../dto/document-verification.dto';
import { VerificationDocumentType, VerificationStatus } from '@prisma/client';

@Controller('api/v1/verification/document')
export class DocumentVerificationController {
  private readonly logger = new Logger(DocumentVerificationController.name);

  constructor(
    private readonly documentVerificationService: DocumentVerificationService,
  ) {}

  /**
   * Upload document for verification
   * POST /api/v1/verification/document/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('document'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
  ): Promise<DocumentVerificationResponseDto> {
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
    @Body()
    reviewDto: {
      verificationId: string;
      status: any;
      rejectionReason?: string;
      categories?: string[];
    },
  ): Promise<any> {
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
    @Param('id') id: string,
  ): Promise<DocumentVerificationResponseDto> {
    try {
      const verification =
        await this.documentVerificationService.getVerification(id);

      if (!verification) {
        throw new HttpException('Verification not found', HttpStatus.NOT_FOUND);
      }

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
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Get all verifications for a user
   * GET /api/v1/verification/document/user/:userId
   */
  @Get('user/:userId')
  async getUserVerifications(
    @Param('userId') userId: string,
  ): Promise<DocumentVerificationResponseDto[]> {
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
