// admin-read-only.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * Guard that restricts read‑only admin users from performing state‑changing HTTP methods.
 * It allows GET requests but blocks POST, PUT, PATCH, DELETE for users with role
 * "read-only-admin". Adjust the role name if your auth system uses a different identifier.
 */
@Injectable()
export class AdminReadOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
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
