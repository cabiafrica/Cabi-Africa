import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Permissions } from './permissions.decorator';
import { AdminRolesService } from './admin-roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from './permissions.constants';

/**
 * Controller for managing admin roles and permissions.
 */
@Controller('roles')
export class AdminRolesController {
    constructor(private readonly rolesService: AdminRolesService) { }

    @Get()
    @Permissions(Permission.VIEW_ROLES)
    getAllRoles() {
        return this.rolesService.findAll();
    }

    @Post()
    @Permissions(Permission.MANAGE_ROLES)
    createRole(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto);
    }

    @Patch(':id')
    @Permissions(Permission.MANAGE_ROLES)
    updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
        return this.rolesService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Permission.MANAGE_ROLES)
    deleteRole(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
