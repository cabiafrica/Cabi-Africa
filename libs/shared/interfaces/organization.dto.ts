import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

/**
 * DTO representing an organization in a list.
 */
export class OrganizationDto {
  id: string;
  name: string;
  ownerName: string;
  memberCount: number;
}

/**
 * DTO for a driver's request to join an organization.
 */
export class JoinOrganizationRequestDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;
}

/**
 * DTO representing a member of a driver group.
 */
export class DriverGroupMemberDto {
  driverId: string;
  driverName: string;
  joinedAt: string; // ISO 8601 string
}

/**
 * DTO for manually assigning a driver to a group.
 */
export class AssignDriverToGroupDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;
}

/**
 * DTO for a driver to request the creation of a new organization.
 * The ownerId will be inferred from the authenticated user on the backend.
 */
export class CreateOrganizationRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

/**
 * DTO representing a single entry in the Referral registration fee ledger.
 */
export class ReferralRegistrationFeeLedgerEntryDto {
  transactionId: string;
  payingDriverId: string;
  payingDriverName: string;
  amount: number;
  currency: string;
  recipientDriverId: string;
  recipientDriverName: string;
  commissionAmount: number;
  transactionDate: string; // ISO 8601 string
}

/**
 * DTO representing a pending driver organization request.
 */
export class PendingOrganizationDto {
  id: string; // The ID of the request itself
  name: string;
  ownerId: string;
  ownerName: string;
  requestedAt: string; // ISO 8601 string
}

/**
 * DTO for a breadcrumb link in a group's hierarchy path.
 */
export class GroupHierarchyPathDto {
  id: string;
  name: string;
}

export enum OrganizationRequestStatus {
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
}

/**
 * DTO for an admin to update the status of an organization request.
 */
export class UpdateOrganizationRequestStatusDto {
  @IsEnum(OrganizationRequestStatus)
  status: OrganizationRequestStatus;
}

/**
 * DTO for the detailed view of an organization.
 */
export class OrganizationDetailDto extends OrganizationDto {
  members: DriverGroupMemberDto[];
}

/**
 * DTO for creating a new organization.
 */
export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string; // User ID of the driver who will own this org
}

/**
 * DTO representing a driver group.
 */
export class DriverGroupDto {
  id: string;
  name: string;
  description: string;
  parentGroupId?: string;
  memberCount: number;
  members: DriverGroupMemberDto[];
  subgroups: DriverGroupDto[];
  hierarchyPath: GroupHierarchyPathDto[];
}

/**
 * DTO for creating a new driver group.
 */
export class CreateDriverGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  parentGroupId?: string;
}

/**
 * DTO for manually assigning a driver to an organization.
 */
export class AssignDriverToOrganizationDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;
}

/**
 * DTO representing a driver member in the organization management view.
 */
export class OrganizationDriverDto {
  driverId: string;
  driverName: string;
  joinedAt: string; // ISO 8601 string
}

/**
 * DTO representing a pending request to join an organization.
 */
export class OrganizationJoinRequestDto {
  requestId: string;
  driverName: string;
  requestedAt: string; // ISO 8601 string
}

/**
 * DTO for the main organization management dashboard for an owner.
 */
export class OrganizationManagementDashboardDto {
  members: OrganizationDriverDto[];
  pendingRequests: OrganizationJoinRequestDto[];
}

/**
 * DTO for an organization owner to approve or deny a join request.
 */
export class UpdateJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsEnum(OrganizationRequestStatus)
  status: OrganizationRequestStatus;
}