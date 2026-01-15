
import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export const REQUIRE_ALL_PERMISSIONS_KEY = 'require_all_permissions';

export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
export const RequireAllPermissions = (...permissions: Permission[]) => SetMetadata(REQUIRE_ALL_PERMISSIONS_KEY, permissions);
