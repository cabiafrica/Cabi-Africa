export enum DocumentStatus {
  NOT_SUBMITTED = 'Not Submitted',
  PENDING_REVIEW = 'Pending Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: string; // e.g., 'dl', 'logbook'
  status: DocumentStatus;
  fileUrl: string;
  uploadedAt: Date;
}