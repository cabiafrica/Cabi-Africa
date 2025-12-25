// admin-action-audit.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * Guard that ensures the request is made by an admin user.
 * It expects the request to have a `user` object with a `role` property.
 */
@Injectable()
export class AdminActionAuditGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user || {};
        if (user.role !== 'admin') {
            throw new ForbiddenException('Admin privileges required');
        }
        return true;
    }
}
