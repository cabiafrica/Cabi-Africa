import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { AdminVerificationService } from './admin-verification.service';

@Controller('admin/verification')
export class AdminVerificationController {
  constructor(private readonly verificationService: AdminVerificationService) {}

  @Get('requests')
  async getVerificationRequests(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.verificationService.getVerificationRequests({
      status,
      search,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('requests/:id')
  async getVerificationRequest(@Param('id') id: string) {
    return this.verificationService.getVerificationRequest(id);
  }

  @Get('stats')
  async getVerificationStats() {
    return this.verificationService.getVerificationStats();
  }

  @Put('requests/:id/approve')
  async approveVerification(
    @Param('id') id: string,
    @Body() body: { adminId: string; notes?: string },
  ) {
    return this.verificationService.approveVerification(id, body.adminId, body.notes);
  }

  @Put('requests/:id/reject')
  async rejectVerification(
    @Param('id') id: string,
    @Body() body: { adminId: string; reason: string },
  ) {
    return this.verificationService.rejectVerification(id, body.adminId, body.reason);
  }

  @Put('requests/:id/request-info')
  async requestAdditionalInfo(
    @Param('id') id: string,
    @Body() body: { adminId: string; requiredInfo: string[] },
  ) {
    return this.verificationService.requestAdditionalInfo(id, body.adminId, body.requiredInfo);
  }
}
