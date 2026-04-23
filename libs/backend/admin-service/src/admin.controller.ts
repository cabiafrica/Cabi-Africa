import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Permissions } from './permissions.decorator';
import { AdminPermissionGuard } from './admin-permission.guard';
import { UseGuards } from '@nestjs/common';
import { Public } from '@cabi/backend/rbac';

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  @Public()
  getHealth(): { status: string } {
    return this.adminService.getHealth();
  }

  @Get('health/detailed')
  @Public()
  @UseGuards(AdminPermissionGuard)
  @Permissions('SYSTEM_MONITOR_VIEW')
  async getDetailedHealth() {
    return await this.adminService.getDetailedHealth();
  }
}