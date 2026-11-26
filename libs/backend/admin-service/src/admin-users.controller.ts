import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { RequirePermissions, PermissionsGuard, JwtAuthGuard } from '@cabi/backend/rbac';
import { Permission } from '@prisma/client';
import { AdminPermissionGuard } from './admin-permission.guard';

@Controller('admin/users') // Prefix admin/users
@UseGuards(JwtAuthGuard, AdminPermissionGuard, PermissionsGuard)
export class AdminUsersController {
    constructor(private readonly usersService: AdminUsersService) { }

    @Get()
    @RequirePermissions(Permission.GROUPS_ROLES_VIEW)
    getAdminUsers() {
        return this.usersService.findAll();
    }

    @Post()
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    createAdminUser(@Body() body: { email: string; roles: string[]; phone?: string }) {
        return this.usersService.create(body.email, body.roles, body.phone);
    }

    @Put(':id/roles')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    updateUserRoles(@Param('id') id: string, @Body() body: { roles: string[] }, @Req() req: any) {
        return this.usersService.updateRoles(id, body.roles, req.user);
    }

    @Put(':id/permissions')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    updateUserPermissions(
        @Param('id') id: string,
        @Body() body: { grants: string[]; revokes: string[] },
        @Req() req: any
    ) {
        return this.usersService.updatePermissions(id, body.grants, body.revokes, req.user.id);
    }
}
