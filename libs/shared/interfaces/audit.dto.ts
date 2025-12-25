/**
 * DTO for a single entry in a user's audit log (admin view).
 */
export class UserAuditLogEntryDto {
  id: string;
  timestamp: string; // ISO 8601 string
  adminName: string; // Name of the admin who performed the action
  action: string; // e.g., "Account Suspended", "Profile Updated", "Document Approved"
  details?: string; // e.g., "Violation of community guidelines.", "Driver's License"
}