
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionService {
    private readonly logger = new Logger(PermissionService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get all permissions for a user
     */
    async getUserPermissions(userId: string): Promise<Set<string>> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: { role: true }
                },
                userPermissions: true
            }
        });

        if (!user) return new Set();

        const permissions = new Set<string>();

        // 1. Add permissions from all assigned roles
        for (const userRole of user.userRoles) {
            if (!userRole.isActive || !userRole.role.isActive) continue;
            if (userRole.expiresAt && userRole.expiresAt < new Date()) continue;

            userRole.role.permissions.forEach(p => permissions.add(p));
        }

        // 2. Apply Direct Permissions (Overrides)
        // Grants add to the set
        // Revokes remove from the set
        // Priority: Direct overrides > Role permissions

        if (user.userPermissions) {
            for (const perm of user.userPermissions) {
                if (perm.isGranted) {
                    permissions.add(perm.permission);
                } else {
                    permissions.delete(perm.permission);
                }
            }
        }

        return permissions;
    }

    /**
     * Check if user has specific permission
     */
    async hasPermission(userId: string, permission: Permission): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(userId);
        return userPermissions.has(permission);
    }

    /**
     * Check if user has ANY of the provided permissions
     */
    async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(userId);
        return permissions.some(p => userPermissions.has(p));
    }

    /**
     * Check if user has ALL of the provided permissions
     */
    async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(userId);
        return permissions.every(p => userPermissions.has(p));
    }
}
