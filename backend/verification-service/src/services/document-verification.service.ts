import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import {
    DocumentType,
    VerificationStatus,
    FieldMatchResult,
    ValidationResult,
} from '../types/document-types';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

interface DocumentVerification {
    id: string;
    userId: string;
    documentType: DocumentType;
    extractedFields: any;
    providedFields?: any;
    matchResults?: FieldMatchResult[];
    status: VerificationStatus;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class DocumentVerificationService {
    private readonly logger = new Logger(DocumentVerificationService.name);
    private verifications: Map<string, DocumentVerification> = new Map();
    private readonly uploadDir = path.join(process.cwd(), 'uploads', 'documents');

    constructor(private readonly ocrService: OcrService) {
        // Ensure upload directory exists
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
     * Upload and process document
     */
    async uploadDocument(
        userId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ): Promise<DocumentVerification> {
        try {
            this.logger.log(
                `Processing document upload for user ${userId}, type: ${documentType}`,
            );

            // Generate unique ID for verification
            const verificationId = crypto.randomUUID();

            // Save file to disk (encrypted in production)
            const fileName = `${verificationId}-${Date.now()}.${file.mimetype.split('/')[1]}`;
            const filePath = path.join(this.uploadDir, fileName);
            await fs.writeFile(filePath, file.buffer);

            // Extract text using OCR
            const extractedText = await this.ocrService.extractText(file.buffer);
            this.logger.debug(`Extracted text: ${extractedText.substring(0, 200)}...`);

            // Parse fields based on document type
            let extractedFields: any;
            switch (documentType) {
                case DocumentType.NATIONAL_ID:
                    extractedFields = this.ocrService.parseNationalId(extractedText);
                    break;
                case DocumentType.DRIVERS_LICENSE:
                    extractedFields = this.ocrService.parseDriversLicense(extractedText);
                    break;
                case DocumentType.PASSPORT:
                    extractedFields = this.ocrService.parsePassport(extractedText);
                    break;
                default:
                    throw new Error('Unsupported document type');
            }

            this.logger.log(`Extracted fields: ${JSON.stringify(extractedFields)}`);

            // Create verification record
            const verification: DocumentVerification = {
                id: verificationId,
                userId,
                documentType,
                extractedFields,
                status: VerificationStatus.PENDING,
                imageUrl: filePath,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Store in memory (use database in production)
            this.verifications.set(verificationId, verification);

            return verification;
        } catch (error) {
            this.logger.error('Error uploading document:', error);
            throw new Error('Failed to process document upload');
        }
    }

    /**
     * Validate provided fields against extracted fields
     */
    async validateDocument(
        verificationId: string,
        providedFields: any,
    ): Promise<ValidationResult> {
        const verification = this.verifications.get(verificationId);
        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        // Check if document is expired (User requirement: "passport is updated yearly")
        if (this.isDocumentExpired(verification)) {
            verification.status = VerificationStatus.REQUIRES_REUPLOAD;
            this.verifications.set(verificationId, verification);
            throw new Error('Document is expired or older than 1 year. Please upload a new document.');
        }

        this.logger.log(
            `Validating fields for verification ${verificationId}`,
        );

        const matchResults: FieldMatchResult[] = [];
        let allFieldsMatch = true;

        // Compare each provided field with extracted field
        for (const [field, providedValue] of Object.entries(providedFields)) {
            const extractedValue = verification.extractedFields[field];

            if (!extractedValue) {
                this.logger.warn(`Field ${field} not found in extracted data`);
                continue;
            }

            const matched = this.compareFields(
                field,
                providedValue as string | number,
                extractedValue as string | number,
            );

            matchResults.push({
                field,
                provided: providedValue as string | number,
                extracted: extractedValue as string | number,
                matched,
            });

            if (!matched) {
                allFieldsMatch = false;
            }
        }

        // Update verification status
        const status = allFieldsMatch
            ? VerificationStatus.VERIFIED
            : VerificationStatus.FAILED;

        verification.providedFields = providedFields;
        verification.matchResults = matchResults;
        verification.status = status;
        verification.updatedAt = new Date();

        this.verifications.set(verificationId, verification);

        return {
            allFieldsMatch,
            matchResults,
            status,
        };
    }

    /**
     * Check if document is older than 1 year
     */
    private isDocumentExpired(verification: DocumentVerification): boolean {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        return verification.createdAt < oneYearAgo;
    }

    /**
     * Compare two field values with fuzzy matching for names
     */
    private compareFields(
        field: string,
        provided: string | number,
        extracted: string | number,
    ): boolean {
        // Exact match for numbers
        if (typeof provided === 'number' || typeof extracted === 'number') {
            return provided.toString() === extracted.toString();
        }

        const providedStr = provided.toString().toLowerCase().trim();
        const extractedStr = extracted.toString().toLowerCase().trim();

        // Exact match for ID numbers, license numbers, etc.
        if (
            field.includes('Number') ||
            field.includes('number') ||
            field.includes('ID') ||
            field.includes('id')
        ) {
            // Remove hyphens and spaces for comparison
            const cleanProvided = providedStr.replace(/[-\s]/g, '');
            const cleanExtracted = extractedStr.replace(/[-\s]/g, '');
            return cleanProvided === cleanExtracted;
        }

        // Fuzzy match for names (allow for OCR errors)
        if (
            field.includes('Name') ||
            field.includes('name')
        ) {
            // Simple fuzzy matching: check if strings are similar
            return this.calculateSimilarity(providedStr, extractedStr) > 0.8;
        }

        // Date comparison (normalize format)
        if (
            field.includes('Date') ||
            field.includes('date') ||
            field.includes('Birth') ||
            field.includes('birth')
        ) {
            const providedDate = this.normalizeDate(providedStr);
            const extractedDate = this.normalizeDate(extractedStr);
            return providedDate === extractedDate;
        }

        // Default: case-insensitive exact match
        return providedStr === extractedStr;
    }

    /**
     * Calculate similarity between two strings (Levenshtein distance)
     */
    private calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1,
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Normalize date format for comparison
     */
    private normalizeDate(dateStr: string): string {
        // Try to parse common date formats and convert to YYYY-MM-DD
        const formats = [
            /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
            /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
            /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
        ];

        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                if (format === formats[0] || format === formats[2]) {
                    // DD/MM/YYYY or DD-MM-YYYY
                    return `${match[3]}-${match[2]}-${match[1]}`;
                } else {
                    // Already YYYY-MM-DD
                    return dateStr;
                }
            }
        }

        return dateStr;
    }

    /**
     * Get verification by ID
     */
    async getVerification(verificationId: string): Promise<DocumentVerification> {
        const verification = this.verifications.get(verificationId);
        if (!verification) {
            throw new NotFoundException('Verification not found');
        }
        return verification;
    }

    /**
     * Get all verifications for a user
     */
    async getUserVerifications(userId: string): Promise<DocumentVerification[]> {
        return Array.from(this.verifications.values()).filter(
            (v) => v.userId === userId,
        );
    }
}
