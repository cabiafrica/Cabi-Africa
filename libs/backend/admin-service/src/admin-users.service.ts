import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import * as bcrypt from 'bcryptjs';
import { AdminUser, Permission } from './admin.types'; // We'll define these types
import { Permission as PrismaPermission } from '@prisma/client';

@Injectable()
export class AdminUsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<AdminUser[]> {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { userRoles: { some: {} } }
                ]
            },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                userPermissions: true
            }
        });

        return users.map(user => ({
            id: user.id,
            email: user.email,
            roles: user.userRoles.map(ur => ur.role.name), // Returning role NAMES as IDs for frontend
            directGrants: user.userPermissions.filter(p => p.isGranted).map(p => p.permission),
            directRevokes: user.userPermissions.filter(p => !p.isGranted).map(p => p.permission),
            suspensionReason: null, // Placeholder or implement if exists
            suspensionDate: null
        }));
    }

    async findOne(id: string): Promise<AdminUser> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                userRoles: { include: { role: true } },
                userPermissions: true
            }
        });

        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        return {
            id: user.id,
            email: user.email,
            roles: user.userRoles.map(ur => ur.role.name),
            directGrants: user.userPermissions.filter(p => p.isGranted).map(p => p.permission),
            directRevokes: user.userPermissions.filter(p => !p.isGranted).map(p => p.permission),
        };
    }

    // Create Admin User (Invite flow - simplified)
    async create(email: string, roleNames: string[]): Promise<AdminUser> {
        // In a real app, check if user exists, if not create placeholder/invite.
        // For now, assuming user creation is handled via Auth service, so this might just be "promoting" an existing user or failing if not found.
        // However, if we want to "Create Admin User" from UI, we likely need to create a User record.

        // Check if user exists by email
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            // Create basic user
            user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword, // Properly hashed password
                    fullName: email.split('@')[0],
                    phone: `+000${Math.floor(Math.random() * 1000000000)}`, // Placeholder
                    role: 'ADMIN'
                }
            });

            // TODO: Send invite email with tempPassword
            console.log(`Admin user created with temporary password: ${tempPassword}`);
        }

        // Assign roles
        await this.updateRoles(user.id, roleNames);

        return this.findOne(user.id);
    }

    async updateRoles(userId: string, roleNames: string[]) {
        // 1. Get role IDs from names
        const roles = await this.prisma.role.findMany({
            where: { name: { in: roleNames } }
        });

        // 2. Sync UserRoles
        // Transactional replace
        await this.prisma.$transaction(async (tx) => {
            // Remove existing
            await tx.userRole.deleteMany({ where: { userId } });

            // Add new
            if (roles.length > 0) {
                await tx.userRole.createMany({
                    data: roles.map(role => ({
                        userId,
                        roleId: role.id,
                        assignedById: null // Changed from 'SYSTEM' to null to avoid FK violation
                    }))
                });
            }
        });

        return this.findOne(userId);
    }

    async updatePermissions(userId: string, grants: string[], revokes: string[], assignedById: string) {
        // Transactional replace
        await this.prisma.$transaction(async (tx) => {
            // Remove existing
            await tx.userPermission.deleteMany({ where: { userId } });

            const permissionsToCreate = [
                ...grants.map(p => ({ permission: p as PrismaPermission, isGranted: true })),
                ...revokes.map(p => ({ permission: p as PrismaPermission, isGranted: false }))
            ];

            if (permissionsToCreate.length > 0) {
                await tx.userPermission.createMany({
                    data: permissionsToCreate.map(p => ({
                        userId,
                        permission: p.permission,
                        isGranted: p.isGranted,
                        assignedById: assignedById // This comes from controller
                    }))
                });
            }
        });

        return this.findOne(userId);
    }
}
