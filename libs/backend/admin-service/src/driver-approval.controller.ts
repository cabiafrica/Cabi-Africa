import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DriverApprovalService } from './driver-approval.service';
import { AdminPermissionGuard } from './admin-permission.guard';
import { Permissions } from './permissions.decorator';
import { VehicleType } from '@prisma/client';

@Controller('admin/approvals')
@UseGuards(AdminPermissionGuard)
export class DriverApprovalController {
  constructor(private readonly approvalService: DriverApprovalService) {}

  @Get('registrations')
  @Permissions('VERIFICATION_DOCUMENTS_VIEW')
  async getPendingRegistrations() {
    return { data: await this.approvalService.getPendingRegistrations() };
  }

  @Get('registrations/:id')
  @Permissions('VERIFICATION_DOCUMENTS_VIEW')
  async getDriverDetails(@Param('id') id: string) {
    return { data: await this.approvalService.getDriverDetails(id) };
  }

  @Post('registrations/:id/approve')
  @Permissions('VERIFICATION_DOCUMENTS_APPROVE')
  async approveDriver(@Param('id') id: string, @Body() body: { category: VehicleType }) {
    return { success: true, data: await this.approvalService.approveDriver(id, body.category) };
  }

  @Post('registrations/:id/reject')
  @Permissions('VERIFICATION_DOCUMENTS_APPROVE')
  async rejectDriver(@Param('id') id: string, @Body() body: { reason: string }) {
    return { success: true, data: await this.approvalService.rejectDriver(id, body.reason) };
  }
}
