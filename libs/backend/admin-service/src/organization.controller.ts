import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '@cabi/backend/rbac';
import { AdminPermissionGuard } from './admin-permission.guard';

@Controller('v1/organizations')
@UseGuards(JwtAuthGuard, AdminPermissionGuard)
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Patch(':orgId/members/:userId/distress-responder')
  async updateDistressResponder(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body('isDistressResponder') isDistressResponder: boolean,
  ) {
    return this.orgService.updateDistressResponder(orgId, userId, isDistressResponder);
  }

  @Get(':orgId/subgroups')
  async getSubgroups(@Param('orgId') orgId: string) {
    return this.orgService.getSubgroups(orgId);
  }

  @Get(':orgId/subgroups/:subgroupId')
  async getSubgroupDetails(
    @Param('orgId') orgId: string,
    @Param('subgroupId') subgroupId: string,
  ) {
    return this.orgService.getSubgroupDetails(orgId, subgroupId);
  }

  @Post(':orgId/subgroups')
  async createSubgroup(
    @Param('orgId') orgId: string,
    @Body('name') name: string,
    @Body('features') features?: string[],
  ) {
    return this.orgService.createSubgroup(orgId, name, features);
  }

  @Patch('subgroups/:subgroupId')
  async updateSubgroup(
    @Param('subgroupId') subgroupId: string,
    @Body() data: any,
  ) {
    return this.orgService.updateSubgroup(subgroupId, data);
  }

  @Delete('subgroups/:subgroupId')
  async deleteSubgroup(@Param('subgroupId') subgroupId: string) {
    return this.orgService.deleteSubgroup(subgroupId);
  }
}
