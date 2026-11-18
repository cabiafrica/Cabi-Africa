import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiDocumentVerificationService } from './ai-document-verification.service';
import { VerificationNotificationService } from './verification-notification.service';
import {
  VerificationAuditService,
  AuditAction,
} from './verification-audit.service';
import { PrismaService } from '@cabi/backend/database';
import {
  VerificationDocumentType,
  VerificationStatus,
  UserStatus,
} from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocumentVerificationService {
  private readonly logger = new Logger(DocumentVerificationService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'documents');

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiDocumentVerificationService,
    private readonly notificationService: VerificationNotificationService,
    private readonly auditService: VerificationAuditService,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating upload directory:', error);
    }
  }

  /**
   * Upload and process document with AI analysis
   */
  async uploadDocument(
    userId: string,
    documentType: VerificationDocumentType,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      this.logger.log(
        `Processing AI document upload for user ${userId}, type: ${documentType}`,
      );

      // 1. Analyze with AI
      const analysis = await this.aiService.analyzeDocument(
        file.buffer,
        documentType as any,
      );
      this.logger.debug(`AI Analysis Result: ${JSON.stringify(analysis)}`);

      // 2. Save file to disk with strict path sanitization
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      };
      const safeExt = extMap[file.mimetype] || 'jpg';
      const safeUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '');
      const safeDocType = String(documentType).replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `${safeUserId}-${safeDocType}-${Date.now()}.${safeExt}`;
      const resolvedUploadDir = path.resolve(this.uploadDir);
      const filePath = path.resolve(resolvedUploadDir, fileName);
      if (!filePath.startsWith(resolvedUploadDir)) {
        throw new Error('Invalid file path detected');
      }
      await fs.writeFile(filePath, file.buffer);

      // 3. Determine initial status based on AI result
      let status: VerificationStatus = VerificationStatus.PENDING;
      let rejectionReason: string | null = null;

      if (analysis.expiryStatus === 'EXPIRED') {
        status = VerificationStatus.FAILED;
        rejectionReason = 'Document is expired';
      } else if (analysis.confidence < 0.7) {
        status = VerificationStatus.FAILED;
        rejectionReason =
          analysis.validationErrors.length > 0
            ? analysis.validationErrors.join(', ')
            : 'Document image quality is too low';
      } else if (analysis.confidence >= 0.9 && analysis.isValid) {
        status = VerificationStatus.VERIFIED;
      } else {
        status = VerificationStatus.PENDING;
      }

      // 4. Create/Update DocumentVerification in DB
      const verification = await this.prisma.documentVerification.create({
        data: {
          userId,
          documentType,
          documentImageUrl: filePath,
          extractedData: analysis.extractedFields as any,
          status,
          isValid: analysis.isValid,
          confidenceScore: analysis.confidence,
          verifiedAt:
            status === VerificationStatus.VERIFIED ? new Date() : null,
        },
      });

      // 5. Special handling for Driver Registration
      const driverProfile = await this.prisma.driverProfile.findUnique({
        where: { userId },
      });

      if (driverProfile) {
        // Update user status based on verification result
        const userStatus: UserStatus =
          status === VerificationStatus.FAILED
            ? UserStatus.REJECTED
            : status === VerificationStatus.VERIFIED
            ? UserStatus.ACTIVE
            : UserStatus.PENDING;

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            status: userStatus,
            isIdentityVerified: status === VerificationStatus.VERIFIED,
          },
        });

        // If rejected, notify user
        if (userStatus === UserStatus.REJECTED) {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
          });
          if (user) {
            await this.notificationService.notifyVerificationRejected(
              userId,
              user.phone || '',
              user.email || '',
              rejectionReason || 'AI analysis failed',
            );
          }
        }
      }

      // 5b. Special handling for Vehicle Documents
      if (
        (documentType as any) === 'VEHICLE_LOGBOOK' ||
        (documentType as any) === 'VEHICLE_INSURANCE'
      ) {
        const vehicle = await this.prisma.vehicle.findFirst({
          where: {
            driver_profiles: { userId },
          },
        });

        if (vehicle) {
          /* vehicle Schema doesn't have aiVerified/updatedAt
          await this.prisma.vehicle.update({
            where: { id: vehicle.id },
            data: {
              aiVerified: analysis.isValid && analysis.confidence >= 0.8,
              updatedAt: new Date(),
            },
          }); */

          // If it's a logbook, we might want to update the owner name if extracted
          if (
            (documentType as any) === 'VEHICLE_LOGBOOK' &&
            analysis.extractedFields.fullName
          ) {
            await this.prisma.vehicle.update({
              where: { id: vehicle.id },
              data: { ownerName: analysis.extractedFields.fullName },
            });
          }

          /* serviceCategories does not exist in Vehicle schema so we skip auto-assignment */
        }
      }

      // 6. Audit
      await this.auditService.log(userId, AuditAction.AI_ANALYSIS, {
        verificationId: verification.id,
        documentType,
        analysis,
        status,
      });

      return verification;
    } catch (error) {
      this.logger.error('Error in AI document processing:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Admin approval/rejection of document
   */
  async adminReview(
    verificationId: string,
    status: VerificationStatus,
    rejectionReason?: string,
    categories?: string[],
  ): Promise<any> {
    const verification = await this.prisma.documentVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    const updated = await this.prisma.documentVerification.update({
      where: { id: verificationId },
      data: {
        status,
        verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: verification.userId },
    });

    if (user) {
      if (status === VerificationStatus.VERIFIED) {
        await this.notificationService.notifyVerificationApproved(
          user.id,
          user.phone || '',
          user.email || '',
        );
      } else if (status === VerificationStatus.FAILED) {
        await this.notificationService.notifyVerificationRejected(
          user.id,
          user.phone || '',
          user.email || '',
          rejectionReason || 'Document did not meet requirements',
        );
      }
    }

    // If it was a driver, update registration status too
    if (
      status === VerificationStatus.VERIFIED ||
      status === VerificationStatus.FAILED
    ) {
      const driverProfile = await this.prisma.driverProfile.findUnique({
        where: { userId: verification.userId },
      });

      if (driverProfile) {
        // Set User status based on verification
        const userStatus =
          status === VerificationStatus.VERIFIED
            ? UserStatus.ACTIVE
            : UserStatus.REJECTED;

        await this.prisma.user.update({
          where: { id: verification.userId },
          data: {
            status: userStatus,
            isIdentityVerified: status === VerificationStatus.VERIFIED,
          },
        });

        // Update vehicle categories if provided
        if (
          status === VerificationStatus.VERIFIED &&
          categories &&
          categories.length > 0
        ) {
          /* await this.prisma.vehicle.update({
            where: { driverProfileId: driverProfile.id },
            data: {
              // serviceCategories: categories,
            },
          }); */
        }
      }
    }

    return updated;
  }

  async getVerification(id: string) {
    return this.prisma.documentVerification.findUnique({
      where: { id },
    });
  }

  async getUserVerifications(userId: string) {
    return this.prisma.documentVerification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
