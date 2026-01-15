import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '@cabi/backend/rbac';
import { Permission } from '@prisma/client';
import { AdminRolesService } from './admin-roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsGuard } from '@cabi/backend/rbac';

/**
 * Controller for managing admin roles and permissions.
 */
@Controller('roles')
@UseGuards(PermissionsGuard)
export class AdminRolesController {
    constructor(private readonly rolesService: AdminRolesService) { }

    @Get()
    @RequirePermissions(Permission.GROUPS_ROLES_VIEW)
    getAllRoles() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @RequirePermissions(Permission.GROUPS_ROLES_VIEW)
    getRole(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Post()
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    createRole(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto);
    }

    @Patch(':id')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
        return this.rolesService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    deleteRole(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
