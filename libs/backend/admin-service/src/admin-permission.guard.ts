// admin-permission.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@cabi/backend/rbac';

/**
 * Guard that checks if the admin user has the required permission.
 * It expects the required permission to be set via a custom metadata key
 * "requiredPermission" on the route handler (e.g., using @SetMetadata or @Permissions decorator).
 */
@Injectable()
export class AdminPermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Check if route is public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        
        // If no user on request (and not public), we can't check permissions
        // This usually means JwtAuthGuard failed or isn't present
        if (!user) {
            return false; 
        }

        // 2. Get required permissions from metadata
        const required = this.reflector.getAllAndOverride<string | string[]>('requiredPermission', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!required || (Array.isArray(required) && required.length === 0)) {
            return true;
        }

        // Only enforce admin identity verification on routes that require admin permissions
        if (user.identityVerified !== true) {
            throw new ForbiddenException('Identity verification is required before accessing admin resources.');
        }

        const userPermissions: string[] = user.permissions ?? [];
        
        // If user is a Super Admin, grant all permissions
        if (user.role?.toUpperCase() === 'SUPER_ADMIN') {
            return true;
        }

        const requiredArray = Array.isArray(required) ? required : [required];
        const missing = requiredArray.filter((perm) => !userPermissions.includes(perm));

        if (missing.length > 0) {
            throw new ForbiddenException(`Missing required permission(s): ${missing.join(', ')}`);
        }

        return true;
    }
}

