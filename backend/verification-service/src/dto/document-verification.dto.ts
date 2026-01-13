export class UploadDocumentDto {
    documentType: 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PASSPORT';
    userId: string;
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
