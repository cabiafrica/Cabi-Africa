export enum DriverDocumentType {
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  PROOF_OF_INSURANCE = 'PROOF_OF_INSURANCE',
}

export enum DocumentStatus {
  MISSING = 'MISSING',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * DTO representing a driver's document.
 */
export class DriverDocumentDto {
  id: string;
  type: DriverDocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  rejectionReason?: string;
}