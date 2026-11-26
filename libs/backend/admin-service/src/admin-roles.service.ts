import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '@cabi/backend/database';
import { RoleType, Platform, Permission } from '@prisma/client';

/**
 * Service handling role CRUD operations using Prisma.
 */
@Injectable()
export class AdminRolesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id }
        });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    async create(dto: CreateRoleDto) {
        // Map DTO to Prisma model
        // Assuming DTO matches somewhat or we need to map basics
        // For now, mapping essential fields, DTO might need update
        return this.prisma.role.create({
            data: {
                name: dto.name,
                displayName: dto.displayName || dto.name, // Fallback
                description: dto.description,
                type: dto.type as RoleType || RoleType.ADMIN, // Default or validate
                platform: dto.platform as Platform || Platform.ADMIN_PANEL,
                permissions: dto.permissions as Permission[] // Cast to enum
            }
        });
    }

    async update(id: string, dto: UpdateRoleDto) {
        // Verify existence
        await this.findOne(id);

        return this.prisma.role.update({
            where: { id },
            data: {
                // Conditional updates
                ...(dto.name && { name: dto.name }),
                ...(dto.displayName && { displayName: dto.displayName }),
                ...(dto.description && { description: dto.description }),
                ...(dto.permissions && { permissions: dto.permissions as Permission[] }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            }
        });
    }

    async remove(id: string) {
        const role = await this.findOne(id);
        if (role.isSystem || role.name === 'SUPER_ADMIN' || role.name === 'ADMIN') {
            throw new Error(`CRITICAL: System role '${role.name}' cannot be deleted.`);
        }
        return this.prisma.role.delete({
            where: { id }
        });
    }
}
