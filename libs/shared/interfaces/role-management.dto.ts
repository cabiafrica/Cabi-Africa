/**
 * Represents a single permission in the system.
 */
export class PermissionDto {
  id: string; // e.g., 'users:read', 'users:write', 'reports:generate'
  description: string;
}

/**
 * Represents a role and its assigned permissions.
 */
export class RoleDto {
  id: string; // e.g., 'support-agent', 'operations-manager'
  name: string;
  description: string;
  permissions: PermissionDto[];
}

/**
 * DTO for updating the permissions assigned to a role.
 */
export class UpdateRolePermissionsDto {
  permissionIds: string[];
}