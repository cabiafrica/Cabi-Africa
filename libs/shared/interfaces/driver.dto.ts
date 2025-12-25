import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DriverDocumentDto } from './document.dto';
 export enum DriverApplicationStatus {
  PROSPECT = 'PROSPECT',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Data Transfer Object for a driver's profile.
 */
export class DriverProfileDto {
  id: string;
  userId: string;
  applicationStatus: DriverApplicationStatus;
  referralCode: string;
}

/**
 * Data Transfer Object for a driver's hours summary.
 */
export class DrivingHoursDto {
  timeOnlineTodaySeconds: number;
  timeOnlineThisWeekSeconds: number;
  weeklyLimitSeconds: number;
}

/**
 * DTO for the driver's home screen initial state.
 */
export class DriverHomeStatusDto {
  isOnline: boolean;
}

/**
 * DTO for setting a driver's destination mode.
 */
export class SetDestinationModeDto {
  /**
   * The destination address or place ID.
   */
  destination: string;
  /**
   * Optional desired arrival time in ISO 8601 format.
   */
  arrivalTime?: string;
}

/**
 * DTO for representing a driver application in an admin list.
 */
export class DriverApplicationDto {
  id: string; // Application or User ID
  name: string;
  email: string;
  city: string;
  status: DriverApplicationStatus;
  appliedAt: string; // ISO 8601 string
}

/**
 * DTO for the detailed view of a driver application in the admin panel.
 */
export class DriverApplicationDetailDto extends DriverApplicationDto {
  documents: DriverDocumentDto[];
}

/**
 * DTO for an admin to update the status of a driver application.
 */
export class UpdateApplicationStatusDto {
  @IsEnum(DriverApplicationStatus)
  status: DriverApplicationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}