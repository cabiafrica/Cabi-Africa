export class UploadPassengerIdDto {
  userId: string;
  idNumber: string;
  fullName: string;
}

export class UploadCertificateOfGoodConductDto {
  userId: string;
  certificateNumber?: string;
  fullName: string;
}

export class UploadPassengerPhotoDto {
  userId: string;
}

export class UploadPassengerSelfieDto {
  userId: string;
  documentVerificationId: string;
}

export class UploadFingerprintDto {
  userId: string;
  fingerprintData: string;
}

export class PassengerVerificationStatusDto {
  userId: string;
  isVerified: boolean;
  verificationLevel: 'NONE' | 'BASIC' | 'SELFIE' | 'BIOMETRIC';
  remainingFreeTrips: number;
  requiresVerification: boolean;
  requiredDocuments: string[];
  message?: string;
}

export class CompletePassengerVerificationDto {
  userId: string;
  idDocumentId: string;
  photoDocumentId: string;
  selfieDocumentId?: string;
  fingerprintData?: string;
}

export class AdminVerificationConfigDto {
  requireNationalId: boolean;
  requirePassengerPhoto: boolean;
  requireSelfieVerification: boolean;
  requireFingerprint: boolean;
  selfieReverificationDays: number;
  fingerprintReverificationDays: number;
  maxTripsBeforeVerification: number;
  maxTripsWithUnverified: number;
  autoVerifyOnDocumentUpload: boolean;
  requireAdminApproval: boolean;
}

export class SearchVerifiedPassengersDto {
  searchTerm?: string;
  verificationLevel?: 'BASIC' | 'SELFIE' | 'BIOMETRIC';
  page?: number;
  limit?: number;
}

export class ApproveVerificationDto {
  adminId: string;
  notes?: string;
}

export class RejectVerificationDto {
  adminId: string;
  reason: string;
}
