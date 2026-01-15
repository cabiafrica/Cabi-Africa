
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, REQUIRE_ALL_PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredAnyPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const requiredAllPermissions = this.reflector.getAllAndOverride<Permission[]>(REQUIRE_ALL_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredAnyPermissions && !requiredAllPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Assuming auth guard has run before and populated user
        if (!user || !user.id) {
            throw new UnauthorizedException('User not authenticated');
        }

        // Check All Permissions (AND)
        if (requiredAllPermissions && requiredAllPermissions.length > 0) {
            const hasAll = await this.permissionService.hasAllPermissions(user.id, requiredAllPermissions);
            if (!hasAll) throw new ForbiddenException('Insufficient permissions: Missing required permissions');
        }

        // Check Any Permissions (OR)
        if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
            const hasAny = await this.permissionService.hasAnyPermission(user.id, requiredAnyPermissions);
            if (!hasAny) throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
