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

  @Get(':id')
  @Permissions('OCCURRENCE_VIEW')
  async getIncident(@Param('id') id: string) {
    return { data: await this.sosService.getIncident(id) };
  }

  @Post(':id/resolve')
  @Permissions('OCCURRENCE_RESOLVE')
  async resolveIncident(@Param('id') id: string, @Body('note') note: string) {
    const res = await this.sosService.resolveIncident(id, note);
    return { data: res, success: true, status: 'RESOLVED' };
  }
}
