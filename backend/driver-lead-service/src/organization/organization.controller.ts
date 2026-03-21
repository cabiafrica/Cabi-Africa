import { Controller, Get, Patch, Param, Body, Post, Delete } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
    constructor(private readonly orgService: OrganizationService) { }

    @Get()
    async getAll() {
        return this.orgService.findAll();
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('isVerified') isVerified: boolean
    ) {
        return this.orgService.updateStatus(id, isVerified);
    }

    // Subgroups
    @Get(':id/subgroups')
    async getSubgroups(@Param('id') id: string) {
        return this.orgService.findSubgroups(id);
    }

    @Post(':id/subgroups')
    async createSubgroup(
        @Param('id') id: string,
        @Body('name') name: string
    ) {
        return this.orgService.createSubgroup(id, name);
    }

    @Patch('subgroups/:subgroupId')
    async updateSubgroup(
        @Param('subgroupId') id: string,
        @Body('name') name: string
    ) {
        return this.orgService.updateSubgroup(id, name);
    }

    @Delete('subgroups/:subgroupId')
    async deleteSubgroup(@Param('subgroupId') id: string) {
        return this.orgService.deleteSubgroup(id);
    }
}
