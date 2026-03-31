import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DriverGroupService } from './driver-group.service';
import { AdminPermissionGuard } from './admin-permission.guard';
import { Permissions } from './permissions.decorator';

@Controller('admin/driver-groups')
@UseGuards(AdminPermissionGuard)
export class DriverGroupController {
  constructor(private readonly driverGroupService: DriverGroupService) {}

  @Get()
  @Permissions('ORGANIZATION_VIEW')
  async getGroups() {
    return { data: await this.driverGroupService.getGroups() };
  }

  @Get(':id')
  @Permissions('ORGANIZATION_VIEW')
  async getGroup(@Param('id') id: string) {
    return { data: await this.driverGroupService.getGroup(id) };
  }

  @Get(':id/members')
  @Permissions('ORGANIZATION_VIEW')
  async getMembers(@Param('id') id: string) {
    return { data: await this.driverGroupService.getGroupMembers(id) };
  }

  @Post()
  @Permissions('ORGANIZATION_EDIT')
  async createGroup(@Body() groupData: any) {
    return { data: await this.driverGroupService.createGroup(groupData) };
  }

  @Post(':id/assign-driver')
  @Permissions('ORGANIZATION_EDIT')
  async assignDriver(@Param('id') id: string, @Body('driverId') driverId: string) {
    await this.driverGroupService.assignDriver(id, driverId);
    return { success: true };
  }
}
