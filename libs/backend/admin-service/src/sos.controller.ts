import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { SOSService } from './sos.service';
import { AdminPermissionGuard } from './admin-permission.guard';
import { Permissions } from './permissions.decorator';

@Controller('admin/sos-incidents')
@UseGuards(AdminPermissionGuard)
export class SOSController {
  constructor(private readonly sosService: SOSService) {}

  @Get()
  @Permissions('OCCURRENCE_VIEW')
  async getIncidents() {
    return { data: await this.sosService.getIncidents() };
  }

  @Get('user/:userId')
  @Permissions('OCCURRENCE_VIEW')
  async getUserIncidents(@Param('userId') userId: string) {
    return { data: await this.sosService.getUserIncidents(userId) };
  }

  @Get(':id')
  @Permissions('OCCURRENCE_VIEW')
  async getIncident(@Param('id') id: string) {
    return { data: await this.sosService.getIncident(id) };
  }

  /** Involved party (driver/passenger) submits their statement on the incident */
  @Post(':id/statement')
  @Permissions('OCCURRENCE_VIEW')
  async submitStatement(
    @Param('id') id: string,
    @Body('objectorId') objectorId: string,
    @Body('text') text: string,
    @Body('evidence') evidence?: any,
  ) {
    return { data: await this.sosService.submitStatement(id, objectorId, text, evidence) };
  }

  /** Admin reviews / acts on a specific party statement */
  @Post('statement/:objectionId/review')
  @Permissions('OCCURRENCE_RESOLVE')
  async reviewObjection(
    @Param('objectionId') objectionId: string,
    @Body('adminId') adminId: string,
    @Body('status') status: string,
    @Body('reviewNotes') reviewNotes: string,
  ) {
    return { data: await this.sosService.reviewObjection(objectionId, adminId, status, reviewNotes) };
  }

  @Post(':id/resolve')
  @Permissions('OCCURRENCE_RESOLVE')
  async resolveIncident(@Param('id') id: string, @Body('note') note: string) {
    const res = await this.sosService.resolveIncident(id, note);
    return { data: res, success: true, status: 'RESOLVED' };
  }

  @Post(':id/log')
  @Permissions('OCCURRENCE_VIEW')
  async logAction(@Param('id') id: string, @Body('notes') notes: string) {
    // We can use the resolveIncident logic but without changing status if we had a dedicated log method.
    // For now, let's assume we want to just add an audit log entry.
    // I'll add a method to SOSService for this.
    const res = await this.sosService.logAction(id, notes);
    return { data: res, success: true };
  }
}
