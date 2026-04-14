import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import { DocumentVerificationService } from '../services/document-verification.service';
import { BiometricVerificationService } from '../services/biometric-verification.service';
import {
  AiDocumentVerificationService,
  DocumentType as AiDocumentType,
} from '../services/ai-document-verification.service';
import {
  UploadPassengerIdDto,
  UploadCertificateOfGoodConductDto,
  UploadPassengerPhotoDto,
  UploadPassengerSelfieDto,
  PassengerVerificationStatusDto,
  CompletePassengerVerificationDto,
  AdminVerificationConfigDto,
  SearchVerifiedPassengersDto,
} from '../dto/passenger-verification.dto';
import { VerificationDocumentType as DocumentType } from '@prisma/client';

interface PassengerVerificationConfig {
  requireNationalId: boolean;
  requirePassengerPhoto: boolean;
  requireSelfieVerification: boolean;
  requireFingerprint: boolean;
  selfieReverificationDays: number;
  fingerprintReverificationDays: number;
  maxTripsBeforeVerification: number;
  maxTripsWithUnverified: number;
  autoVerifyOnDocumentUpload: boolean;
  requireAdminApproval: boolean;
}

@Controller('api/v1/verification/passenger')
export class PassengerVerificationController {
  private readonly logger = new Logger(PassengerVerificationController.name);
  private verificationConfig: PassengerVerificationConfig = {
    requireNationalId: true,
    requirePassengerPhoto: true,
    requireSelfieVerification: true,
    requireFingerprint: false,
    selfieReverificationDays: 30,
    fingerprintReverificationDays: 90,
    maxTripsBeforeVerification: 1,
    maxTripsWithUnverified: 1,
    autoVerifyOnDocumentUpload: true,
    requireAdminApproval: false,
  };
  private passengerStates: Map<string, any> = new Map();

  constructor(
    private readonly documentVerificationService: DocumentVerificationService,
    private readonly biometricVerificationService: BiometricVerificationService,
    private readonly aiDocumentVerificationService: AiDocumentVerificationService,
  ) {}

  /**
   * Upload passenger ID (National ID)
   * POST /api/v1/verification/passenger/id
   * Uses AI for automatic document verification
   */
  @Post('id')
  @UseInterceptors(FileInterceptor('document'))
  async uploadPassengerId(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPassengerIdDto,
  ): Promise<any> {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG and PNG images are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Uploading passenger ID for user ${uploadDto.userId}`);

      // Run AI document analysis in parallel with traditional verification
      const [verification, aiAnalysis] = await Promise.all([
        this.documentVerificationService.uploadDocument(
          uploadDto.userId,
          'PASSENGER_ID' as DocumentType,
          file,
        ),
        this.aiDocumentVerificationService
          .analyzeDocument(file.buffer, 'NATIONAL_ID' as AiDocumentType)
          .catch((err) => {
            this.logger.warn(`AI analysis failed: ${err.message}`);
            return null;
          }),
      ]);

      const state = this.getOrCreatePassengerState(uploadDto.userId);

      // Determine if AI verification passed
      let aiVerified = false;
      let aiConfidence = 0;

      if (aiAnalysis) {
        aiVerified = aiAnalysis.isValid && aiAnalysis.confidence >= 0.7;
        aiConfidence = aiAnalysis.confidence;

        // Cross-verify with user-provided data
        const fieldMatch = this.aiDocumentVerificationService.verifyFieldsMatch(
          aiAnalysis.extractedFields,
          {
            fullName: uploadDto.fullName,
            idNumber: uploadDto.idNumber,
          },
        );

        state.aiAnalysis = {
          documentType: aiAnalysis.documentType,
          confidence: aiConfidence,
          isValid: aiVerified,
          extractedFields: aiAnalysis.extractedFields,
          validationErrors: aiAnalysis.validationErrors,
          warnings: aiAnalysis.warnings,
          faceDetected: aiAnalysis.faceDetected,
          quality: aiAnalysis.documentQuality,
          expiryStatus: aiAnalysis.expiryStatus,
          fieldsMatch: fieldMatch,
        };
      }

      // Determine final verification status
      const status = aiVerified
        ? 'VERIFIED'
        : verification.status === 'VERIFIED'
        ? 'VERIFIED'
        : 'PENDING';

      state.idVerification = {
        id: verification.id,
        status: status,
        idNumber: uploadDto.idNumber,
        fullName: uploadDto.fullName,
        aiVerified,
        aiConfidence,
        uploadedAt: new Date(),
      };

      const requiresSelfie = this.verificationConfig.requireSelfieVerification;

      // Generate appropriate message based on AI analysis
      let message = '';
      if (aiVerified) {
        message = 'ID verified successfully with AI. Please upload your photo.';
      } else if (aiAnalysis && aiAnalysis.warnings.length > 0) {
        message = `ID uploaded. ${aiAnalysis.warnings.join(
          ' ',
        )} Please proceed.`;
      } else {
        message = requiresSelfie
          ? 'ID uploaded. Please upload photo and complete selfie verification.'
          : 'ID uploaded. You can now continue.';
      }

      return {
        success: true,
        verificationId: verification.id,
        status: status,
        aiAnalysis: {
          confidence: aiConfidence,
          isValid: aiVerified,
          documentType: aiAnalysis?.documentType,
          quality: aiAnalysis?.documentQuality,
          warnings: aiAnalysis?.warnings,
          errors: aiAnalysis?.validationErrors,
        },
        message,
        nextStep: requiresSelfie ? 'UPLOAD_PHOTO' : 'COMPLETE',
        requiresSelfie,
      };
    } catch (error) {
      this.logger.error('Error uploading passenger ID:', error);
      throw new HttpException(
        error.message || 'Failed to upload ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload Certificate of Good Conduct
   * POST /api/v1/verification/passenger/certificate
   * Uses AI for automatic document verification
   */
  @Post('certificate')
  @UseInterceptors(FileInterceptor('document'))
  async uploadCertificateOfGoodConduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadCertificateOfGoodConductDto,
  ): Promise<any> {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG, PNG, and PDF are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Uploading Certificate of Good Conduct for user ${uploadDto.userId}`,
      );

      // Run AI document analysis
      const aiAnalysis =
        await this.aiDocumentVerificationService.analyzeDocument(
          file.buffer,
          'CERTIFICATE_OF_GOOD_CONDUCT' as AiDocumentType,
        );

      const state = this.getOrCreatePassengerState(uploadDto.userId);

      // Determine if AI verification passed
      const aiVerified = aiAnalysis.isValid && aiAnalysis.confidence >= 0.7;

      state.certificateVerification = {
        id: crypto.randomUUID(),
        status: aiVerified ? 'VERIFIED' : 'PENDING',
        certificateNumber: uploadDto.certificateNumber,
        fullName: uploadDto.fullName,
        aiVerified,
        aiConfidence: aiAnalysis.confidence,
        documentType: aiAnalysis.documentType,
        extractedFields: aiAnalysis.extractedFields,
        quality: aiAnalysis.documentQuality,
        uploadedAt: new Date(),
      };

      return {
        success: true,
        verificationId: state.certificateVerification.id,
        status: state.certificateVerification.status,
        aiAnalysis: {
          confidence: aiAnalysis.confidence,
          isValid: aiVerified,
          documentType: aiAnalysis.documentType,
          quality: aiAnalysis.documentQuality,
          extractedFields: aiAnalysis.extractedFields,
          warnings: aiAnalysis.warnings,
          errors: aiAnalysis.validationErrors,
        },
        message: aiVerified
          ? 'Certificate verified successfully!'
          : 'Certificate uploaded. Please ensure the document is clear and valid.',
      };
    } catch (error) {
      this.logger.error('Error uploading certificate:', error);
      throw new HttpException(
        error.message || 'Failed to upload certificate',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload passport photo (professional avatar)
   * POST /api/v1/verification/passenger/photo
   */
  @Post('photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPassengerPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPassengerPhotoDto,
  ): Promise<any> {
    try {
      if (!file) {
        throw new HttpException('No photo uploaded', HttpStatus.BAD_REQUEST);
      }

      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG and PNG images are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Uploading passport photo for user ${uploadDto.userId}`);

      const verification =
        await this.documentVerificationService.uploadDocument(
          uploadDto.userId,
          'PASSENGER_PASSPORT_PHOTO' as DocumentType,
          file,
        );

      const state = this.getOrCreatePassengerState(uploadDto.userId);
      state.photoVerification = {
        id: verification.id,
        status: verification.status,
        photoUrl: verification.imageUrl,
      };

      const requiresSelfie = this.verificationConfig.requireSelfieVerification;

      return {
        success: true,
        verificationId: verification.id,
        status: verification.status,
        message: requiresSelfie
          ? 'Photo uploaded. Please complete selfie verification to verify your identity.'
          : 'Photo uploaded successfully.',
        nextStep: requiresSelfie ? 'SELFIE_VERIFICATION' : 'COMPLETE',
        requiresSelfie,
      };
    } catch (error) {
      this.logger.error('Error uploading passport photo:', error);
      throw new HttpException(
        error.message || 'Failed to upload photo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload selfie for liveness and face matching
   * POST /api/v1/verification/passenger/selfie
   */
  @Post('selfie')
  @UseInterceptors(FileInterceptor('selfie'))
  async uploadSelfie(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPassengerSelfieDto,
  ): Promise<any> {
    try {
      if (!file) {
        throw new HttpException('No selfie uploaded', HttpStatus.BAD_REQUEST);
      }

      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG and PNG images are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Uploading selfie for user ${uploadDto.userId}`);

      const verification = await this.biometricVerificationService.uploadSelfie(
        uploadDto.userId,
        uploadDto.documentVerificationId,
        file,
      );

      const state = this.getOrCreatePassengerState(uploadDto.userId);
      state.selfieVerification = {
        id: verification.id,
        status: verification.status,
        livenessScore: verification.livenessScore,
        matchScore: verification.matchScore,
      };

      const isVerified = verification.status === 'VERIFIED';

      return {
        success: true,
        verificationId: verification.id,
        status: verification.status,
        livenessScore: verification.livenessScore,
        matchScore: verification.matchScore,
        message: isVerified
          ? 'Selfie verification successful! Your account is now verified.'
          : 'Selfie verification failed. Please try again.',
        isVerified,
      };
    } catch (error) {
      this.logger.error('Error uploading selfie:', error);
      throw new HttpException(
        error.message || 'Failed to process selfie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify fingerprint (Biometric)
   * POST /api/v1/verification/passenger/fingerprint
   */
  @Post('fingerprint')
  async verifyFingerprint(
    @Body() body: { userId: string; fingerprintData: string },
  ): Promise<any> {
    try {
      this.logger.log(`Verifying fingerprint for user ${body.userId}`);

      // In production, integrate with fingerprint SDK
      // For now, simulate successful verification
      const isVerified =
        body.fingerprintData && body.fingerprintData.length > 0;

      const state = this.getOrCreatePassengerState(body.userId);
      state.fingerprintVerification = {
        id: crypto.randomUUID(),
        status: isVerified ? 'VERIFIED' : 'FAILED',
        verifiedAt: isVerified ? new Date() : null,
        fingerprintTemplate: body.fingerprintData,
      };

      return {
        success: isVerified,
        message: isVerified
          ? 'Fingerprint verified successfully!'
          : 'Fingerprint verification failed. Please try again.',
        status: isVerified ? 'VERIFIED' : 'FAILED',
      };
    } catch (error) {
      this.logger.error('Error verifying fingerprint:', error);
      throw new HttpException(
        error.message || 'Failed to verify fingerprint',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get passenger verification status
   * GET /api/v1/verification/passenger/status/:userId
   */
  @Get('status/:userId')
  async getPassengerVerificationStatus(
    @Param('userId') userId: string,
  ): Promise<PassengerVerificationStatusDto> {
    const state = this.passengerStates.get(userId);

    const hasId = state?.idVerification?.status === 'VERIFIED';
    const hasPhoto = state?.photoVerification?.status === 'VERIFIED';
    const hasSelfie = state?.selfieVerification?.status === 'VERIFIED';

    let verificationLevel: 'NONE' | 'BASIC' | 'SELFIE' | 'BIOMETRIC' = 'NONE';
    let isVerified = false;

    if (hasId && hasPhoto && hasSelfie) {
      verificationLevel = 'SELFIE';
      isVerified = true;
    } else if (hasId) {
      verificationLevel = 'BASIC';
    }

    const requiredDocuments: string[] = [];
    if (this.verificationConfig.requireNationalId && !hasId) {
      requiredDocuments.push('National ID');
    }
    if (this.verificationConfig.requirePassengerPhoto && !hasPhoto) {
      requiredDocuments.push('Passport Photo');
    }
    if (this.verificationConfig.requireSelfieVerification && !hasSelfie) {
      requiredDocuments.push('Selfie Verification');
    }

    const passengerTripCount = state?.tripCount || 0;
    const maxTrips = this.verificationConfig.maxTripsWithUnverified;
    const remainingFreeTrips = Math.max(0, maxTrips - passengerTripCount);
    const requiresVerification = passengerTripCount >= maxTrips && !isVerified;

    let message: string | undefined;
    if (requiresVerification) {
      message =
        'You have reached the maximum number of trips. Please verify your identity to continue using the service.';
    } else if (!isVerified && requiredDocuments.length > 0) {
      message = `Please complete verification to enjoy faster service. You have ${remainingFreeTrips} trip(s) remaining before verification is required.`;
    }

    return {
      userId,
      isVerified,
      verificationLevel,
      remainingFreeTrips,
      requiresVerification,
      requiredDocuments,
      message,
    };
  }

  /**
   * Check if passenger can request a trip
   * GET /api/v1/verification/passenger/can-request/:userId
   */
  @Get('can-request/:userId')
  async canRequestTrip(@Param('userId') userId: string): Promise<any> {
    const status = await this.getPassengerVerificationStatus(userId);

    const state = this.getOrCreatePassengerState(userId);

    return {
      canRequest: !status.requiresVerification || status.isVerified,
      reason:
        status.requiresVerification && !status.isVerified
          ? 'Verification required'
          : 'OK',
      remainingTrips: status.remainingFreeTrips,
      isVerified: status.isVerified,
      verificationLevel: status.verificationLevel,
      message: status.message,
    };
  }

  /**
   * Record trip completion for unverified passengers
   * POST /api/v1/verification/passenger/trip-completed/:userId
   */
  @Post('trip-completed/:userId')
  async recordTripCompleted(@Param('userId') userId: string): Promise<any> {
    const state = this.getOrCreatePassengerState(userId);
    state.tripCount = (state.tripCount || 0) + 1;

    const status = await this.getPassengerVerificationStatus(userId);

    return {
      tripRecorded: true,
      tripCount: state.tripCount,
      requiresVerification: status.requiresVerification,
      message: status.message,
    };
  }

  /**
   * Update verification configuration (Admin)
   * PUT /api/v1/verification/config
   */
  @Put('config')
  async updateVerificationConfig(
    @Body() config: AdminVerificationConfigDto,
  ): Promise<any> {
    this.verificationConfig = {
      ...this.verificationConfig,
      ...config,
    };

    return {
      success: true,
      message: 'Verification configuration updated',
      config: this.verificationConfig,
    };
  }

  /**
   * Get verification configuration (Admin)
   * GET /api/v1/verification/config
   */
  @Get('config')
  async getVerificationConfig(): Promise<PassengerVerificationConfig> {
    return this.verificationConfig;
  }

  /**
   * Search verified passengers (Admin)
   * GET /api/v1/verification/passengers
   */
  @Get('passengers')
  async searchVerifiedPassengers(
    @Query('searchTerm') searchTerm?: string,
    @Query('verificationLevel')
    verificationLevel?: 'BASIC' | 'SELFIE' | 'BIOMETRIC',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<any> {
    const passengers = Array.from(this.passengerStates.entries())
      .filter(([_, state]) => {
        if (
          verificationLevel === 'BASIC' &&
          state.idVerification?.status !== 'VERIFIED'
        ) {
          return false;
        }
        if (
          verificationLevel === 'SELFIE' &&
          state.selfieVerification?.status !== 'VERIFIED'
        ) {
          return false;
        }
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const fullName = state.idVerification?.fullName?.toLowerCase() || '';
          const idNumber = state.idVerification?.idNumber || '';
          if (
            !fullName.includes(searchLower) &&
            !idNumber.includes(searchLower)
          ) {
            return false;
          }
        }
        return true;
      })
      .map(([userId, state]) => ({
        userId,
        isVerified: state.selfieVerification?.status === 'VERIFIED',
        verificationLevel:
          state.selfieVerification?.status === 'VERIFIED'
            ? 'SELFIE'
            : state.idVerification?.status === 'VERIFIED'
            ? 'BASIC'
            : 'NONE',
        fullName: state.idVerification?.fullName,
        idNumber: state.idVerification?.idNumber,
        photoUrl: state.photoVerification?.photoUrl,
        verifiedAt:
          state.selfieVerification?.createdAt ||
          state.idVerification?.createdAt,
      }));

    const startIndex = (page - 1) * limit;
    const paginatedPassengers = passengers.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      passengers: paginatedPassengers,
      total: passengers.length,
      page,
      limit,
      totalPages: Math.ceil(passengers.length / limit),
    };
  }

  /**
   * Mark passenger as fully verified (Admin)
   * PUT /api/v1/verification/passenger/verify/:userId
   */
  @Put('verify/:userId')
  async manuallyVerifyPassenger(@Param('userId') userId: string): Promise<any> {
    const state = this.getOrCreatePassengerState(userId);

    if (state.idVerification) {
      state.idVerification.status = 'VERIFIED';
    }
    if (state.photoVerification) {
      state.photoVerification.status = 'VERIFIED';
    }
    if (state.selfieVerification) {
      state.selfieVerification.status = 'VERIFIED';
    }

    return {
      success: true,
      userId,
      message: 'Passenger manually verified',
      isVerified: true,
    };
  }

  private getOrCreatePassengerState(userId: string): any {
    if (!this.passengerStates.has(userId)) {
      this.passengerStates.set(userId, {
        tripCount: 0,
        idVerification: null,
        photoVerification: null,
        selfieVerification: null,
      });
    }
    return this.passengerStates.get(userId);
  }
}
