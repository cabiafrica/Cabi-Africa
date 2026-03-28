import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  /**
   * Check if a user needs to perform a biometric check
   * GET /api/v1/verification/biometric/required/:userId
   */
  @Get('required/:userId')
  async isCheckRequired(
    @Param('userId') userId: string,
    @Query('userType') userType: 'DRIVER' | 'PASSENGER' = 'DRIVER',
  ): Promise<{ required: boolean; reason?: string }> {
    try {
      return await this.biometricVerificationService.isBiometricCheckRequired(
        userId,
        userType,
      );
    } catch (error) {
      this.logger.error('Error checking requirement:', error);
      throw new HttpException(
        error.message || 'Failed to check requirement',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadSelfieDto,
  ): Promise<BiometricVerificationResponseDto> {
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
    @Param('id') id: string,
  ): Promise<BiometricVerificationResponseDto> {
    try {
      const verification =
        await this.biometricVerificationService.getVerification(id);

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
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Get biometric verification by document verification ID
   * GET /api/v1/verification/biometric/document/:documentVerificationId
   */
  @Get('document/:documentVerificationId')
  async getByDocumentVerification(
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
