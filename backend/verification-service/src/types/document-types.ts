export enum DocumentType {
    NATIONAL_ID = 'NATIONAL_ID',
    DRIVERS_LICENSE = 'DRIVERS_LICENSE',
    PASSPORT = 'PASSPORT',
    VEHICLE_LOGBOOK = 'VEHICLE_LOGBOOK',
    VEHICLE_INSURANCE = 'VEHICLE_INSURANCE',
    PSV_BADGE = 'PSV_BADGE',
    // Passenger-specific document types
    PASSENGER_ID = 'PASSENGER_ID',
    PASSENGER_PASSPORT_PHOTO = 'PASSENGER_PASSPORT_PHOTO',
    PASSENGER_SELFIE = 'PASSENGER_SELFIE',
    FINGERPRINT = 'FINGERPRINT',
    GOVT_CERTIFICATE = 'GOVT_CERTIFICATE',
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

export interface VehicleLogbookFields {
    registrationNumber: string;
    make: string;
    model: string;
    yearOfManufacture: string;
    ownerName: string;
}

export interface VehicleInsuranceFields {
    policyNumber: string;
    registrationNumber: string;
    insurerName: string;
    expiryDate: string;
}

export interface PsvBadgeFields {
    badgeNumber: string;
    driverName: string;
    idNumber: string;
    expiryDate: string;
}

export interface GovtCertificateFields {
    certificateNumber: string;
    entityName: string;
    registrationNumber: string;
    issueDate?: string;
    expiryDate?: string;
    founderName?: string;
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
