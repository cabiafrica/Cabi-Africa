// admin-permission.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard that checks if the admin user has the required permission.
 * It expects the required permission to be set via a custom metadata key
 * "requiredPermission" on the route handler (e.g., using @SetMetadata).
 * For simplicity, if no permission is defined, the guard allows access.
 */
@Injectable()
export class AdminPermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user || {};
        const required = this.reflector.get<string | string[]>('requiredPermission', context.getHandler());
        if (!required) return true;
        const userPermissions: string[] = user.permissions ?? [];
        // If required is an array, ensure all required permissions are present
        const missing = Array.isArray(required)
            ? required.filter((perm) => !userPermissions.includes(perm))
            : !userPermissions.includes(required)
                ? [required]
                : [];
        if (missing.length > 0) {
            throw new ForbiddenException(`Missing permission(s): ${missing.join(', ')}`);
        }
        return true;
    }
}
