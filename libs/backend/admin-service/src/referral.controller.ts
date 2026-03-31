import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { ReferralService, ReferralConfig } from './referral.service';
import { AdminPermissionGuard } from './admin-permission.guard';
import { Permissions } from './permissions.decorator';

@Controller('admin/referral')
@UseGuards(AdminPermissionGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('config')
  @Permissions('REFERRAL_FORMULA_VIEW')
  async getConfig() {
    return { data: await this.referralService.getConfig() };
  }

  @Put('config')
  @Permissions('REFERRAL_FORMULA_EDIT')
  async updateConfig(@Body() config: ReferralConfig) {
    const res = await this.referralService.updateConfig(config);
    return { data: res, success: true };
  }

  @Get('ledger')
  @Permissions('COMMISSION_LEDGER_VIEW')
  async getLedger(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('driverId') driverId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return await this.referralService.getCommissionLedger({
      page: parseInt(page),
      limit: parseInt(limit),
      driverId,
      startDate,
      endDate
    });
  }
}
