import { VerificationDocumentType } from '@prisma/client';

export class UploadDocumentDto {
  documentType: VerificationDocumentType;
  userId: string;
  idNumber?: string; // For passenger ID verification
  fullName?: string; // For passenger verification
}

export class ValidateDocumentDto {
  verificationId: string;
  providedFields: {
    [key: string]: string | number;
  };
}

export class DocumentVerificationResponseDto {
  id: string;
  userId: string;
  documentType: string;
  extractedFields: any;
  status: string;
  imageUrl?: string;
  createdAt: Date;
}

export class ValidationResponseDto {
  verificationId: string;
  status: string;
  allFieldsMatch: boolean;
  matchResults: Array<{
    field: string;
    provided: string | number;
    extracted: string | number;
    matched: boolean;
  }>;
}
