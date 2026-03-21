import { Controller, Post, Body, Get, Logger, Query, HttpException, Param } from '@nestjs/common';
import { DriverOrganizationService, CreateDriverOrgDto } from './driver-organization.service';

@Controller('driver-org')
export class DriverOrganizationController {
    private readonly logger = new Logger(DriverOrganizationController.name);

    constructor(private readonly service: DriverOrganizationService) { }

    @Post('create')
    async create(@Body() dto: CreateDriverOrgDto) {
        try {
            return await this.service.createOrganization(dto);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('join')
    async join(@Body() body: { driverId: string; orgId: string }) {
        try {
            return await this.service.joinOrganization(body.driverId, body.orgId);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('leave')
    async leave(@Body() body: { driverId: string }) {
        try {
            return await this.service.leaveOrganization(body.driverId);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Get('list')
    async list(@Query('search') search?: string) {
        return this.service.getOrganizations(search);
    }

    @Get('details/:id')
    async getDetails(@Param('id') id: string) {
        const details = await this.service.getDetails(id);
        if (!details) {
            throw new HttpException('Organization not found', 404);
        }
        return details;
    }
}
