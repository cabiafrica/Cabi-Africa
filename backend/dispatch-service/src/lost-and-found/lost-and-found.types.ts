export type LostItemCategory =
  | 'PHONE'
  | 'WALLET'
  | 'KEYS'
  | 'BAG'
  | 'CLOTHING'
  | 'ELECTRONICS'
  | 'DOCUMENTS'
  | 'OTHER';

export type LostItemStatus =
  | 'REPORTED'
  | 'DRIVER_CONFIRMED'
  | 'EN_ROUTE_RETURN'
  | 'RETURN_OFFICE_DROP'
  | 'RESOLVED'
  | 'DISPUTED';

export type ReturnMethod = 'DIRECT_HANDOVER' | 'OFFICE_DROPOFF';

export type FeeStatus =
  | 'PENDING'
  | 'ESCROWED'
  | 'DISBURSED_TO_DRIVER'
  | 'REFUNDED';

export interface LostItemIncident {
  id: string;
  obNumber: string; // e.g. "OB/LOST/26B/0142"
  occurrenceId?: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  category: LostItemCategory;
  description: string;
  itemPhotoUrl?: string;
  status: LostItemStatus;
  returnMethod: ReturnMethod;
  handoverPin: string; // 4-digit PIN for proof of delivery
  handoverPhotoUrl?: string;
  standardReturnFee: number; // KES 500
  voluntaryRewardEscrow: number; // Optional tip
  feeStatus: FeeStatus;
  disbursedAmount?: number;
  droppedAtOffice: boolean;
  officeLocation?: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface ReportLostItemDto {
  tripId: string;
  category: LostItemCategory;
  description: string;
  itemPhotoUrl?: string;
  voluntaryReward?: number;
}

export interface DriverConfirmCustodyDto {
  itemFound: boolean;
  photoUrl?: string;
  returnMethod?: ReturnMethod;
  droppedAtOffice?: boolean;
  officeLocation?: string;
  driverNotes?: string;
}

export interface VerifyHandoverDto {
  handoverPin: string;
  handoverPhotoUrl?: string;
  resolutionNotes?: string;
}
