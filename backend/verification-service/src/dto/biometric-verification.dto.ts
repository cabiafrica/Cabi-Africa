export enum BiometricVerificationStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    FAILED = 'FAILED',
    REQUIRES_RETAKE = 'REQUIRES_RETAKE',
}

export class UploadSelfieDto {
    userId: string;
    documentVerificationId: string;
}

export class BiometricVerificationResponseDto {
    id: string;
    userId: string;
    documentVerificationId: string;
    livenessScore: number;
    matchScore: number;
    status: string;
    createdAt: Date;
}
