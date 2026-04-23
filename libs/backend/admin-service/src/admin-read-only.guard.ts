// admin-read-only.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@cabi/backend/rbac';

/**
 * Guard that restricts read‑only admin users from performing state‑changing HTTP methods.
 * It allows GET requests but blocks POST, PUT, PATCH, DELETE for users with role
 * "read-only-admin". Adjust the role name if your auth system uses a different identifier.
 */
@Injectable()
export class AdminReadOnlyGuard implements CanActivate {
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
        const user = request.user || {};
        const method = request.method?.toUpperCase();
        const readOnly = user.role === 'read-only-admin';
        
        if (readOnly && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            throw new ForbiddenException('Read‑only admin cannot modify data');
        }
        return true;
    }
}

