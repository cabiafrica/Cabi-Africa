import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to define required permission(s) for a route handler.
 * Usage: @Permissions('VIEW_ROLES')
 */
export const Permissions = (...permissions: string[]) => SetMetadata('requiredPermission', permissions.length === 1 ? permissions[0] : permissions);
