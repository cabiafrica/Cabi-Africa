
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { Permission, UserRole } from '@prisma/client';

@Injectable()
export class PermissionService {
    private readonly logger = new Logger(PermissionService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get all permissions for a user
     */
    async getUserPermissions(userId: string): Promise<Set<string>> {
        // Fetch all roles assigned to the user
        // Include the legacy `role` field mapped to permissions if needed?
        // We moved `role` to `LegacyRole`.
        // We should rely on `UserRole` table primarily, but for migration compatibility,
        // we might want to map LegacyRole to some default permissions if UserRole is empty.
        // However, our seed script assigned Super Admin to UserRole.
        // New users might only have LegacyRole if register flow isn't fully updated yet.
        // Ideally, registration should create UserRole.

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) return new Set();

        const permissions = new Set<string>();

        // Add permissions from all assigned roles
        for (const userRole of user.userRoles) {
            if (!userRole.isActive || !userRole.role.isActive) continue;

            // Check expiration
            if (userRole.expiresAt && userRole.expiresAt < new Date()) continue;

            userRole.role.permissions.forEach(p => permissions.add(p));
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
