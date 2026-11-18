import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { BiometricVerificationService } from '../services/biometric-verification.service';
import {
  UploadSelfieDto,
  BiometricVerificationResponseDto,
} from '../dto/biometric-verification.dto';

@Controller('api/v1/verification/biometric')
export class BiometricVerificationController {
  private readonly logger = new Logger(BiometricVerificationController.name);

  constructor(
    private readonly biometricVerificationService: BiometricVerificationService,
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

  private assertSelfOrAdmin(req: any, targetUserId: string): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new HttpException('Authentication required to access biometric verification.', HttpStatus.UNAUTHORIZED);
    }
    const callerId = user.id || user.sub || user.userId;
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || perms.some((p: string) => p.startsWith('VERIFICATION_') || p === 'SUPER_ADMIN');
    if (callerId !== targetUserId && !isAdmin) {
      throw new HttpException('You are not authorized to access another user biometric data.', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Check if a user needs to perform a biometric check
   * GET /api/v1/verification/biometric/required/:userId
   */
  @Get('required/:userId')
  async isCheckRequired(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('userType') userType: 'DRIVER' | 'PASSENGER' = 'DRIVER',
  ): Promise<{ required: boolean; reason?: string }> {
    this.assertSelfOrAdmin(req, userId);
    try {
      return await this.biometricVerificationService.isBiometricCheckRequired(
        userId,
        userType,
      );
    } catch (error) {
      this.logger.error('Error checking requirement:', error);
      throw new HttpException(
        error.message || 'Failed to check requirement',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload selfie for biometric verification
   * POST /api/v1/verification/biometric/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('selfie'))
  async uploadSelfie(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadSelfieDto,
  ): Promise<BiometricVerificationResponseDto> {
    this.assertSelfOrAdmin(req, uploadDto.userId);
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG and PNG images are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new HttpException(
          'File too large. Maximum size is 5MB',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Uploading selfie for user ${uploadDto.userId}, document verification ${uploadDto.documentVerificationId}`,
      );

      const verification = await this.biometricVerificationService.uploadSelfie(
        uploadDto.userId,
        uploadDto.documentVerificationId,
        file,
      );

      return {
        id: verification.id,
        userId: verification.userId,
        documentVerificationId: verification.documentVerificationId,
        livenessScore: verification.livenessScore,
        matchScore: verification.matchScore,
        status: verification.status,
        createdAt: verification.createdAt,
      };
    } catch (error) {
      this.logger.error('Error uploading selfie:', error);
      throw new HttpException(
        error.message || 'Failed to upload selfie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get biometric verification status
   * GET /api/v1/verification/biometric/:id
   */
  @Get(':id')
  async getVerification(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<BiometricVerificationResponseDto> {
    try {
      const verification =
        await this.biometricVerificationService.getVerification(id);

      if (!verification) {
        throw new HttpException('Verification not found', HttpStatus.NOT_FOUND);
      }

      this.assertSelfOrAdmin(req, verification.userId);

      return {
        id: verification.id,
        userId: verification.userId,
        documentVerificationId: verification.documentVerificationId,
        livenessScore: verification.livenessScore,
        matchScore: verification.matchScore,
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
   * Get biometric verification by document verification ID
   * GET /api/v1/verification/biometric/document/:documentVerificationId
   */
  @Get('document/:documentVerificationId')
  async getByDocumentVerification(
    @Req() req: any,
    @Param('documentVerificationId') documentVerificationId: string,
  ): Promise<BiometricVerificationResponseDto | null> {
    try {
      const verification =
        await this.biometricVerificationService.getByDocumentVerification(
          documentVerificationId,
        );

      if (!verification) {
        return null;
      }

      this.assertSelfOrAdmin(req, verification.userId);

      return {
        id: verification.id,
        userId: verification.userId,
        documentVerificationId: verification.documentVerificationId,
        livenessScore: verification.livenessScore,
        matchScore: verification.matchScore,
        status: verification.status,
        createdAt: verification.createdAt,
      };
    } catch (error) {
      this.logger.error('Error getting verification:', error);
      throw new HttpException(
        error.message || 'Failed to get verification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
