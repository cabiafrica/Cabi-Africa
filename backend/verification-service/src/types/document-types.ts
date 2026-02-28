export enum DocumentType {
    NATIONAL_ID = 'NATIONAL_ID',
    DRIVERS_LICENSE = 'DRIVERS_LICENSE',
    PASSPORT = 'PASSPORT',
    // Passenger-specific document types
    PASSENGER_ID = 'PASSENGER_ID',
    PASSENGER_PASSPORT_PHOTO = 'PASSENGER_PASSPORT_PHOTO',
    PASSENGER_SELFIE = 'PASSENGER_SELFIE',
    FINGERPRINT = 'FINGERPRINT',
}

export enum VerificationStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    FAILED = 'FAILED',
    REQUIRES_REUPLOAD = 'REQUIRES_REUPLOAD',
}

export interface ExtractedFields {
    [key: string]: string | number;
}

export interface NationalIdFields {
    fullName: string;
    idNumber: string;
    dateOfBirth: string;
    gender: string;
    districtOfBirth?: string;
    dateOfIssue?: string;
}

export interface DriversLicenseFields {
    name: string;
    licenseNumber: string;
    idNumber: string;
    dateOfBirth: string;
    dateOfIssue?: string;
    expiryDate?: string;
    classes?: string;
    bloodGroup?: string;
}

export interface PassportFields {
    fullName: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
    dateOfIssue?: string;
    expiryDate?: string;
}

export interface FieldMatchResult {
    field: string;
    provided: string | number;
    extracted: string | number;
    matched: boolean;
    confidence?: number;
}

export interface ValidationResult {
    allFieldsMatch: boolean;
    matchResults: FieldMatchResult[];
    status: VerificationStatus;
}
