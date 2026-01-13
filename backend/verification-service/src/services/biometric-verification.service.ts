import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BiometricVerificationStatus } from '../dto/biometric-verification.dto';

interface BiometricVerification {
    id: string;
    userId: string;
    documentVerificationId: string;
    selfieUrl: string;
    livenessScore: number;
    matchScore: number;
    status: BiometricVerificationStatus;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class BiometricVerificationService {
    private readonly logger = new Logger(BiometricVerificationService.name);
    private verifications: Map<string, BiometricVerification> = new Map();
    // Simulate user state for last check time (in production, use DB)
    private lastChecks: Map<string, Date> = new Map();
    private readonly uploadDir = path.join(process.cwd(), 'uploads', 'selfies');

    constructor() {
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
     * Check if a user needs to perform a biometric check
     * Logic:
     * 1. If never checked, return true
     * 2. If random check needed (5% probability on every call)
     * 3. If regular check needed (> 24 hours since last check)
     */
    async isBiometricCheckRequired(userId: string): Promise<{ required: boolean; reason?: 'INITIAL' | 'RANDOM' | 'REGULAR' }> {
        const lastCheck = this.lastChecks.get(userId);

        // 1. Initial check (never checked before)
        if (!lastCheck) {
            return { required: true, reason: 'INITIAL' };
        }

        const now = new Date();
        const timeDiff = now.getTime() - lastCheck.getTime();
        const hoursSinceLastCheck = timeDiff / (1000 * 60 * 60);

        // 2. Regular check (e.g. every 24 hours)
        if (hoursSinceLastCheck > 24) {
            return { required: true, reason: 'REGULAR' };
        }

        // 3. Random check (5% chance)
        if (Math.random() < 0.05) {
            return { required: true, reason: 'RANDOM' };
        }

        return { required: false };
    }

    async uploadSelfie(
        userId: string,
        documentVerificationId: string,
        file: Express.Multer.File,
    ): Promise<BiometricVerification> {
        try {
            this.logger.log(
                `Processing selfie upload for user ${userId}, document verification ${documentVerificationId}`,
            );

            // Generate unique ID
            const verificationId = crypto.randomUUID();

            // Save file to disk
            const fileName = `${verificationId}-${Date.now()}.${file.mimetype.split('/')[1]}`;
            const filePath = path.join(this.uploadDir, fileName);
            await fs.writeFile(filePath, file.buffer);

            // Perform basic liveness checks
            const livenessScore = await this.performLivenessCheck(file.buffer);

            // Mock match score
            const matchScore = 0.85;

            // Determine status based on scores
            let status = BiometricVerificationStatus.PENDING;
            if (livenessScore > 0.7 && matchScore > 0.75) {
                status = BiometricVerificationStatus.VERIFIED;
                // Update last check time on success
                this.lastChecks.set(userId, new Date());
            } else if (livenessScore < 0.5 || matchScore < 0.6) {
                status = BiometricVerificationStatus.FAILED;
            }

            const verification: BiometricVerification = {
                id: verificationId,
                userId,
                documentVerificationId,
                selfieUrl: filePath,
                livenessScore,
                matchScore,
                status,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            this.verifications.set(verificationId, verification);

            return verification;
        } catch (error) {
            this.logger.error('Error uploading selfie:', error);
            throw new Error('Failed to process selfie upload');
        }
    }

    private async performLivenessCheck(imageBuffer: Buffer): Promise<number> {
        try {
            const fileSize = imageBuffer.length;
            if (fileSize < 50 * 1024) {
                return 0.3;
            } else if (fileSize < 200 * 1024) {
                return 0.6;
            } else {
                return 0.9;
            }
        } catch (error) {
            this.logger.error('Error performing liveness check:', error);
            return 0.5;
        }
    }

    async getVerification(verificationId: string): Promise<BiometricVerification> {
        const verification = this.verifications.get(verificationId);
        if (!verification) {
            throw new NotFoundException('Biometric verification not found');
        }
        return verification;
    }

    async getUserVerifications(userId: string): Promise<BiometricVerification[]> {
        return Array.from(this.verifications.values()).filter(
            (v) => v.userId === userId,
        );
    }

    async getByDocumentVerification(
        documentVerificationId: string,
    ): Promise<BiometricVerification | null> {
        const verifications = Array.from(this.verifications.values()).filter(
            (v) => v.documentVerificationId === documentVerificationId,
        );
        return verifications.length > 0 ? verifications[0] : null;
    }
}
