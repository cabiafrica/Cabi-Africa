import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DocumentAnalysisResult {
  documentType: DocumentType;
  isValid: boolean;
  confidence: number;
  extractedFields: ExtractedDocumentFields;
  validationErrors: string[];
  warnings: string[];
  faceDetected: boolean;
  faceLocation?: { x: number; y: number; width: number; height: number };
  documentQuality: DocumentQuality;
  expiryStatus?: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface ExtractedDocumentFields {
  idNumber?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  dateOfIssue?: string;
  expiryDate?: string;
  gender?: string;
  nationality?: string;
  documentNumber?: string;
  passportNumber?: string;
  licenseNumber?: string;
  bloodGroup?: string;
  address?: string;
  district?: string;
  county?: string;
  photoUrl?: string;
}

export type DocumentType = 
  | 'NATIONAL_ID' 
  | 'PASSPORT' 
  | 'DRIVERS_LICENSE' 
  | 'CERTIFICATE_OF_GOOD_CONDUCT'
  | 'ALIEN_CARD'
  | 'REFUGEE_ID'
  | 'UNKNOWN';

export type DocumentQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNREADABLE';

@Injectable()
export class AiDocumentVerificationService {
  private readonly logger = new Logger(AiDocumentVerificationService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'documents', 'ai-verified');

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
   * Main entry point: Analyze and verify a document
   */
  async analyzeDocument(
    imageBuffer: Buffer,
    expectedDocumentType?: DocumentType,
  ): Promise<DocumentAnalysisResult> {
    this.logger.log('Starting AI document analysis...');

    // Step 1: Preprocess image
    const processedImage = await this.preprocessImage(imageBuffer);

    // Step 2: Detect document type using AI
    const detectedType = expectedDocumentType || await this.detectDocumentType(processedImage);

    // Step 3: Extract text using OCR
    const ocrResult = await this.extractTextWithConfidence(processedImage);

    // Step 4: Parse fields based on document type
    const extractedFields = this.parseDocumentFields(detectedType, ocrResult.text);

    // Step 5: Validate document
    const validationErrors = this.validateDocument(detectedType, extractedFields, ocrResult.confidence);

    // Step 6: Check document quality
    const documentQuality = await this.assessDocumentQuality(processedImage, ocrResult.confidence);

    // Step 7: Detect face if applicable
    const faceDetection = await this.detectFace(processedImage);

    // Step 8: Check expiry status
    const expiryStatus = this.checkExpiryStatus(extractedFields.expiryDate);

    this.logger.log(`Document analysis complete. Type: ${detectedType}, Valid: ${validationErrors.length === 0}`);

    return {
      documentType: detectedType,
      isValid: validationErrors.length === 0 && documentQuality !== 'UNREADABLE',
      confidence: ocrResult.confidence,
      extractedFields,
      validationErrors,
      warnings: this.generateWarnings(documentQuality, validationErrors, extractedFields),
      faceDetected: faceDetection.detected,
      faceLocation: faceDetection.location,
      documentQuality,
      expiryStatus,
    };
  }

  /**
   * Detect document type using image analysis and text patterns
   */
  private async detectDocumentType(imageBuffer: Buffer): Promise<DocumentType> {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng+fra+deu');
    const textLower = text.toLowerCase();

    this.logger.log(`Detecting document type from text: ${text.substring(0, 100)}...`);

    // Check for Certificate of Good Conduct
    if (
      textLower.includes('certificate of good conduct') ||
      textLower.includes('good conduct') ||
      textLower.includes('police clearance') ||
      textLower.includes('conduct certificate')
    ) {
      return 'CERTIFICATE_OF_GOOD_CONDUCT';
    }

    // Check for Passport
    if (
      textLower.includes('passport') ||
      textLower.includes('travel document') ||
      textLower.includes('nationality') ||
      textLower.includes('surname') ||
      textLower.includes('given names')
    ) {
      return 'PASSPORT';
    }

    // Check for Driver's License
    if (
      textLower.includes('drivers license') ||
      textLower.includes('driving license') ||
      textLower.includes('dl-') ||
      textLower.includes('license class')
    ) {
      return 'DRIVERS_LICENSE';
    }

    // Check for National ID
    if (
      textLower.includes('national id') ||
      textLower.includes('identity card') ||
      textLower.includes('citizen') ||
      textLower.includes('births and deaths') ||
      textLower.includes('district')
    ) {
      return 'NATIONAL_ID';
    }

    // Check for Alien Card
    if (
      textLower.includes('alien') ||
      textLower.includes('immigration') ||
      textLower.includes('foreigner')
    ) {
      return 'ALIEN_CARD';
    }

    // Check for Refugee ID
    if (
      textLower.includes('refugee') ||
      textLower.includes('unhcr')
    ) {
      return 'REFUGEE_ID';
    }

    return 'UNKNOWN';
  }

  /**
   * Preprocess image for better analysis
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      let processedImage = sharp(imageBuffer);
      
      const metadata = await processedImage.metadata();
      
      // Resize if too small
      if (metadata.width && metadata.width < 1200) {
        processedImage = processedImage.resize(1200);
      }

      // Auto-orient based on EXIF data
      processedImage = processedImage.rotate();

      // Enhance for better OCR
      const processed = await processedImage
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

      return processed;
    } catch (error) {
      this.logger.error('Error preprocessing image:', error);
      return imageBuffer;
    }
  }

  /**
   * Extract text with confidence scores
   */
  private async extractTextWithConfidence(
    imageBuffer: Buffer,
  ): Promise<{ text: string; confidence: number }> {
    try {
      const result = await Tesseract.recognize(imageBuffer, 'eng+fra+deu', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      return {
        text: result.data.text,
        confidence: result.data.confidence / 100,
      };
    } catch (error) {
      this.logger.error('Error extracting text:', error);
      return { text: '', confidence: 0 };
    }
  }

  /**
   * Parse document-specific fields based on type
   */
  private parseDocumentFields(type: DocumentType, text: string): ExtractedDocumentFields {
    const fields: ExtractedDocumentFields = {};

    switch (type) {
      case 'NATIONAL_ID':
      case 'ALIEN_CARD':
      case 'REFUGEE_ID':
        this.parseNationalId(text, fields);
        break;
      case 'PASSPORT':
        this.parsePassport(text, fields);
        break;
      case 'DRIVERS_LICENSE':
        this.parseDriversLicense(text, fields);
        break;
      case 'CERTIFICATE_OF_GOOD_CONDUCT':
        this.parseCertificateOfGoodConduct(text, fields);
        break;
      default:
        this.parseGenericDocument(text, fields);
    }

    return fields;
  }

  private parseNationalId(text: string, fields: ExtractedDocumentFields): void {
    // Kenyan National ID numbers are 8 digits
    const idMatch = text.match(/\b(\d{8})\b/);
    if (idMatch) fields.idNumber = idMatch[1];

    // Extract dates
    const dates = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g);
    if (dates) {
      fields.dateOfBirth = dates[0];
      if (dates.length > 1) fields.dateOfIssue = dates[1];
      if (dates.length > 2) fields.expiryDate = dates[2];
    }

    // Gender
    const genderMatch = text.match(/\b(MALE|FEMALE|M|F)\b/i);
    if (genderMatch) fields.gender = genderMatch[1].toUpperCase();

    // Name - look for patterns
    const namePatterns = [
      /(?:FULL NAME|NAME)[:\s]+([A-Z][A-Z\s]+)/i,
      /\b([A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,})\b/,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.fullName = match[1].trim();
        const parts = match[1].trim().split(/\s+/);
        if (parts.length >= 2) {
          fields.firstName = parts[0];
          fields.lastName = parts[parts.length - 1];
        }
        break;
      }
    }

    // Location
    const locationPatterns = [
      /(?:DISTRICT|COUNTY)[:\s]+([A-Z\s]+)/i,
      /\b(NAIROBI|MOMBASA|KISUMU|NAKURU|ELDORET|THIKA|KAKAMEGA|MIGORI|KIAMBU)\b/i,
    ];
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.district = match[1].toUpperCase();
        break;
      }
    }
  }

  private parsePassport(text: string, fields: ExtractedDocumentFields): void {
    // Passport numbers: A1234567 or AB1234567
    const passportMatch = text.match(/\b([A-Z]{1,2}\d{7,9})\b/i);
    if (passportMatch) fields.passportNumber = passportMatch[1];

    // Extract dates
    const dates = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g);
    if (dates) {
      fields.dateOfBirth = dates[0];
      if (dates.length > 1) fields.dateOfIssue = dates[1];
      if (dates.length > 2) fields.expiryDate = dates[2];
    }

    // Nationality
    const nationalityMatch = text.match(/(?:NATIONALITY)[:\s]+([A-Z\s]+)/i);
    if (nationalityMatch) fields.nationality = nationalityMatch[1].trim();

    // Name - Surname and Given Names
    const surnameMatch = text.match(/(?:SURNAME|FAMILY NAME)[:\s]+([A-Z\s]+)/i);
    const givenMatch = text.match(/(?:GIVEN NAMES|FORENAMES)[:\s]+([A-Z\s]+)/i);
    
    if (surnameMatch || givenMatch) {
      const surname = surnameMatch?.[1]?.trim() || '';
      const given = givenMatch?.[1]?.trim() || '';
      fields.fullName = `${surname} ${given}`.trim();
      fields.lastName = surname;
      fields.firstName = given;
    }

    // Gender
    const genderMatch = text.match(/\b(MALE|FEMALE)\b/i);
    if (genderMatch) fields.gender = genderMatch[1].toUpperCase();
  }

  private parseDriversLicense(text: string, fields: ExtractedDocumentFields): void {
    // License numbers: DL-XXXXXXX
    const licenseMatch = text.match(/\b(DL-?\d{7,8})\b/i);
    if (licenseMatch) fields.licenseNumber = licenseMatch[1];

    // ID Number
    const idMatch = text.match(/\b(\d{8})\b/);
    if (idMatch) fields.idNumber = idMatch[1];

    // Dates
    const dates = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/g);
    if (dates) {
      fields.dateOfBirth = dates[0];
      if (dates.length > 1) fields.dateOfIssue = dates[1];
      if (dates.length > 2) fields.expiryDate = dates[2];
    }

    // Name
    const nameMatch = text.match(/(?:NAME)[:\s]+([A-Z\s]+)/i);
    if (nameMatch) {
      fields.fullName = nameMatch[1].trim();
      const parts = nameMatch[1].trim().split(/\s+/);
      if (parts.length >= 2) {
        fields.firstName = parts[0];
        fields.lastName = parts[parts.length - 1];
      }
    }

    // Classes
    const classesMatch = text.match(/(?:CLASS|CLASSES)[:\s]+([A-Z]+)/i);
    if (classesMatch) fields.licenseNumber = (fields.licenseNumber || '') + ' ' + classesMatch[1];
  }

  private parseCertificateOfGoodConduct(text: string, fields: ExtractedDocumentFields): void {
    // Certificate numbers
    const certMatch = text.match(/\b(CGC|CCGC|CERT|Certificate)[\s#:]+([A-Z0-9]+)\b/i);
    if (certMatch) fields.documentNumber = certMatch[2];

    // Reference number
    const refMatch = text.match(/(?:REF|REFERENCE)[:\s#]+([A-Z0-9\/]+)/i);
    if (refMatch) fields.documentNumber = (fields.documentNumber || '') + ' ' + refMatch[1];

    // Name
    const namePatterns = [
      /(?:NAME)[:\s]+([A-Z][A-Z\s]+)/i,
      /\b([A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,})\b/,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.fullName = match[1].trim();
        break;
      }
    }

    // Date of issue
    const dateMatch = text.match(/(?:DATE|ISSUED|DATED)[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if (dateMatch) fields.dateOfIssue = dateMatch[1];

    // Expiry (usually 1 year for good conduct)
    const expiryMatch = text.match(/(?:VALID|EXPIRES|EXPIRY)[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if (expiryMatch) fields.expiryDate = expiryMatch[1];
  }

  private parseGenericDocument(text: string, fields: ExtractedDocumentFields): void {
    // Try to extract any 8+ digit number as ID
    const idMatch = text.match(/\b(\d{8,})\b/);
    if (idMatch) fields.idNumber = idMatch[1];

    // Try to find a name
    const nameMatch = text.match(/\b([A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,})\b/);
    if (nameMatch) fields.fullName = nameMatch[1];
  }

  /**
   * Validate document fields
   */
  private validateDocument(
    type: DocumentType,
    fields: ExtractedDocumentFields,
    confidence: number,
  ): string[] {
    const errors: string[] = [];

    // Check OCR confidence
    if (confidence < 0.5) {
      errors.push('Document image quality is too low for reliable verification');
    }

    // Check required fields based on type
    switch (type) {
      case 'NATIONAL_ID':
      case 'ALIEN_CARD':
      case 'REFUGEE_ID':
        if (!fields.idNumber) errors.push('ID Number not found');
        if (!fields.fullName) errors.push('Full name not found');
        if (!fields.dateOfBirth) errors.push('Date of birth not found');
        break;
      case 'PASSPORT':
        if (!fields.passportNumber) errors.push('Passport number not found');
        if (!fields.fullName) errors.push('Full name not found');
        if (!fields.nationality) errors.push('Nationality not found');
        break;
      case 'DRIVERS_LICENSE':
        if (!fields.licenseNumber) errors.push('License number not found');
        if (!fields.fullName) errors.push('Full name not found');
        break;
      case 'CERTIFICATE_OF_GOOD_CONDUCT':
        if (!fields.documentNumber) errors.push('Certificate number not found');
        if (!fields.fullName) errors.push('Applicant name not found');
        break;
    }

    // Validate ID number format (Kenyan ID)
    if (fields.idNumber && !/^\d{8}$/.test(fields.idNumber)) {
      errors.push('Invalid ID number format (expected 8 digits)');
    }

    // Validate passport number format
    if (fields.passportNumber && !/^[A-Z]{1,2}\d{7,9}$/i.test(fields.passportNumber)) {
      errors.push('Invalid passport number format');
    }

    return errors;
  }

  /**
   * Assess document quality
   */
  private async assessDocumentQuality(
    imageBuffer: Buffer,
    ocrConfidence: number,
  ): Promise<DocumentQuality> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const avgColor = await this.getAverageColor(imageBuffer);

      // Check resolution
      if ((metadata.width || 0) < 800) {
        return 'POOR';
      }

      // Check OCR confidence
      if (ocrConfidence < 0.3) {
        return 'UNREADABLE';
      }
      if (ocrConfidence < 0.5) {
        return 'POOR';
      }
      if (ocrConfidence < 0.7) {
        return 'FAIR';
      }
      if (ocrConfidence < 0.85) {
        return 'GOOD';
      }

      return 'EXCELLENT';
    } catch (error) {
      this.logger.error('Error assessing document quality:', error);
      return 'FAIR';
    }
  }

  private async getAverageColor(buffer: Buffer): Promise<number> {
    try {
      const { data } = await sharp(buffer)
        .resize(10, 10)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      let sum = 0;
      for (let i = 0; i < data.length; i += 3) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      return sum / (data.length / 3);
    } catch {
      return 128;
    }
  }

  /**
   * Detect face in document image
   * Note: In production, integrate with a face detection library like face-api.js
   */
  private async detectFace(imageBuffer: Buffer): Promise<{ detected: boolean; location?: any }> {
    try {
      // Simplified face detection using image processing
      // In production, use AWS Rekognition, Google Vision API, or face-api.js
      
      const { data } = await sharp(imageBuffer)
        .resize(100, 100)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Simple heuristic: look for skin-tone like colors in upper portion
      let skinPixels = 0;
      const totalPixels = data.length / 3;
      
      for (let i = 0; i < data.length; i += 3) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Simple skin tone detection
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15 &&
            r - b > 15) {
          skinPixels++;
        }
      }

      const skinRatio = skinPixels / totalPixels;
      
      // If significant skin-tone pixels in upper portion, likely has face
      if (skinRatio > 0.1) {
        return {
          detected: true,
          location: { x: 30, y: 10, width: 40, height: 50 },
        };
      }

      return { detected: false };
    } catch (error) {
      this.logger.error('Error detecting face:', error);
      return { detected: false };
    }
  }

  /**
   * Check if document is expired
   */
  private checkExpiryStatus(expiryDateStr?: string): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | undefined {
    if (!expiryDateStr) return undefined;

    try {
      const [day, month, year] = expiryDateStr.split('/').map(Number);
      const expiryDate = new Date(year, month - 1, day);
      const now = new Date();
      
      // Check if expired
      if (expiryDate < now) {
        return 'EXPIRED';
      }

      // Check if expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (expiryDate < thirtyDaysFromNow) {
        return 'EXPIRING_SOON';
      }

      return 'VALID';
    } catch {
      return undefined;
    }
  }

  /**
   * Generate warnings based on analysis
   */
  private generateWarnings(
    quality: DocumentQuality,
    errors: string[],
    fields: ExtractedDocumentFields,
  ): string[] {
    const warnings: string[] = [];

    if (quality === 'FAIR') {
      warnings.push('Document image quality is fair. Please ensure good lighting for better verification.');
    }
    if (quality === 'POOR') {
      warnings.push('Document image quality is poor. Please retake with better lighting and focus.');
    }

    if (fields.expiryDate) {
      const status = this.checkExpiryStatus(fields.expiryDate);
      if (status === 'EXPIRING_SOON') {
        warnings.push('Document is expiring soon. Please renew to avoid service interruption.');
      }
    }

    return warnings;
  }

  /**
   * Cross-verify document fields with user-provided data
   */
  verifyFieldsMatch(
    extractedFields: ExtractedDocumentFields,
    providedFields: {
      fullName?: string;
      idNumber?: string;
      dateOfBirth?: string;
    },
  ): { matches: boolean; fieldResults: { field: string; matches: boolean }[] } {
    const fieldResults: { field: string; matches: boolean }[] = [];

    // Compare full name
    if (providedFields.fullName && extractedFields.fullName) {
      const match = this.compareNames(providedFields.fullName, extractedFields.fullName);
      fieldResults.push({ field: 'fullName', matches: match });
    }

    // Compare ID number
    if (providedFields.idNumber && extractedFields.idNumber) {
      const provided = providedFields.idNumber.replace(/\s/g, '');
      const extracted = extractedFields.idNumber.replace(/\s/g, '');
      fieldResults.push({ field: 'idNumber', matches: provided === extracted });
    }

    // Compare date of birth
    if (providedFields.dateOfBirth && extractedFields.dateOfBirth) {
      const provided = this.normalizeDate(providedFields.dateOfBirth);
      const extracted = this.normalizeDate(extractedFields.dateOfBirth);
      fieldResults.push({ field: 'dateOfBirth', matches: provided === extracted });
    }

    const allMatch = fieldResults.every(r => r.matches);

    return { matches: allMatch, fieldResults };
  }

  private compareNames(name1: string, name2: string): boolean {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    
    // Exact match
    if (n1 === n2) return true;

    // Check if all words from name1 are in name2 or vice versa
    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);

    const allWords1In2 = words1.every(w => w.length > 2 && n2.includes(w));
    const allWords2In1 = words2.every(w => w.length > 2 && n1.includes(w));

    return allWords1In2 || allWords2In1;
  }

  private normalizeDate(dateStr: string): string {
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return dateStr;
  }
}
