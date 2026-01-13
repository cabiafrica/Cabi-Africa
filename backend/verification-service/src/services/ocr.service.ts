import { Injectable, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);

    /**
     * Preprocess image for better OCR accuracy
     * - Convert to grayscale
     * - Increase contrast
     * - Resize if too small
     */
    async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
        try {
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();

            // Resize if image is too small (min width 800px for good OCR)
            let processedImage = image;
            if (metadata.width && metadata.width < 800) {
                processedImage = processedImage.resize(800);
            }

            // Convert to grayscale and increase contrast
            const processed = await processedImage
                .grayscale()
                .normalize()
                .sharpen()
                .toBuffer();

            return processed;
        } catch (error) {
            this.logger.error('Error preprocessing image:', error);
            throw new Error('Failed to preprocess image');
        }
    }

    /**
     * Extract text from image using Tesseract OCR
     */
    async extractText(imageBuffer: Buffer): Promise<string> {
        try {
            this.logger.log('Starting OCR text extraction...');

            // Preprocess the image
            const processedImage = await this.preprocessImage(imageBuffer);

            // Perform OCR
            const result = await Tesseract.recognize(processedImage, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
            });

            this.logger.log('OCR extraction completed');
            return result.data.text;
        } catch (error) {
            this.logger.error('Error extracting text:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    /**
     * Extract text with confidence scores for each word
     */
    async extractTextWithConfidence(
        imageBuffer: Buffer,
    ): Promise<{ text: string; confidence: number }> {
        try {
            const processedImage = await this.preprocessImage(imageBuffer);

            const result = await Tesseract.recognize(processedImage, 'eng');

            return {
                text: result.data.text,
                confidence: result.data.confidence / 100,
            };
        } catch (error) {
            this.logger.error('Error extracting text with confidence:', error);
            throw new Error('Failed to extract text with confidence');
        }
    }

    /**
     * Parse National ID fields from extracted text
     */
    parseNationalId(text: string): any {
        const lines = text.split('\n').map((line) => line.trim());

        const result: any = {};

        // Extract ID Number (8 digits)
        const idNumberMatch = text.match(/\b(\d{8})\b/);
        if (idNumberMatch) {
            result.idNumber = idNumberMatch[1];
        }

        // Extract dates (DD/MM/YYYY format)
        const dateMatches = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g);
        if (dateMatches && dateMatches.length > 0) {
            result.dateOfBirth = dateMatches[0];
            if (dateMatches.length > 1) {
                result.dateOfIssue = dateMatches[1];
            }
        }

        // Extract gender (M or F)
        const genderMatch = text.match(/\b(M|F)\b/);
        if (genderMatch) {
            result.gender = genderMatch[1];
        }

        // Extract full name (usually appears after "Full Name:" or similar)
        const nameMatch = text.match(/(?:Full Name|Name)[:\s]+([A-Z\s]+)/i);
        if (nameMatch) {
            result.fullName = nameMatch[1].trim();
        } else {
            // Try to find capitalized name (3 parts typical for Kenyan names)
            const capitalizedNameMatch = text.match(/\b([A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,})\b/);
            if (capitalizedNameMatch) {
                result.fullName = capitalizedNameMatch[1];
            }
        }

        // Extract district (common Kenyan districts)
        const districtMatch = text.match(/\b(NAIROBI|MOMBASA|KISUMU|NAKURU|ELDORET|THIKA)\b/i);
        if (districtMatch) {
            result.districtOfBirth = districtMatch[1].toUpperCase();
        }

        return result;
    }

    /**
     * Parse Driver's License fields from extracted text
     */
    parseDriversLicense(text: string): any {
        const result: any = {};

        // Extract License Number (DL-XXXXXXX format)
        const licenseMatch = text.match(/\b(DL-?\d{7})\b/i);
        if (licenseMatch) {
            result.licenseNumber = licenseMatch[1].toUpperCase();
        }

        // Extract ID Number (8 digits)
        const idNumberMatch = text.match(/\b(\d{8})\b/);
        if (idNumberMatch) {
            result.idNumber = idNumberMatch[1];
        }

        // Extract dates
        const dateMatches = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g);
        if (dateMatches && dateMatches.length > 0) {
            result.dateOfBirth = dateMatches[0];
            if (dateMatches.length > 1) {
                result.dateOfIssue = dateMatches[1];
            }
            if (dateMatches.length > 2) {
                result.expiryDate = dateMatches[2];
            }
        }

        // Extract name
        const nameMatch = text.match(/(?:Name)[:\s]+([A-Z\s]+)/i);
        if (nameMatch) {
            result.name = nameMatch[1].trim();
        } else {
            const capitalizedNameMatch = text.match(/\b([A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,})\b/);
            if (capitalizedNameMatch) {
                result.name = capitalizedNameMatch[1];
            }
        }

        // Extract classes (e.g., BCE, A, B, etc.)
        const classesMatch = text.match(/(?:Classes?)[:\s]+([A-Z]+)/i);
        if (classesMatch) {
            result.classes = classesMatch[1];
        }

        // Extract blood group
        const bloodGroupMatch = text.match(/\b([ABO][\+\-])\b/);
        if (bloodGroupMatch) {
            result.bloodGroup = bloodGroupMatch[1];
        }

        return result;
    }

    /**
     * Parse Passport fields from extracted text
     */
    parsePassport(text: string): any {
        const result: any = {};

        // Extract passport number (alphanumeric, typically 7-9 characters)
        const passportMatch = text.match(/\b([A-Z]{1,2}\d{6,8})\b/);
        if (passportMatch) {
            result.passportNumber = passportMatch[1];
        }

        // Extract dates
        const dateMatches = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g);
        if (dateMatches && dateMatches.length > 0) {
            result.dateOfBirth = dateMatches[0];
            if (dateMatches.length > 1) {
                result.dateOfIssue = dateMatches[1];
            }
            if (dateMatches.length > 2) {
                result.expiryDate = dateMatches[2];
            }
        }

        // Extract nationality
        const nationalityMatch = text.match(/(?:Nationality)[:\s]+([A-Z\s]+)/i);
        if (nationalityMatch) {
            result.nationality = nationalityMatch[1].trim();
        }

        // Extract full name
        const nameMatch = text.match(/(?:Name|Surname)[:\s]+([A-Z\s]+)/i);
        if (nameMatch) {
            result.fullName = nameMatch[1].trim();
        }

        return result;
    }
}
