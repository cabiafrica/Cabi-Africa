import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  BadgeIncentiveInput,
  CreateWealthProgramDto,
  UpdateWealthProgramDto,
  WealthService,
} from './wealth.service';

@Controller('wealth-programs')
export class WealthController {
  constructor(private readonly wealthService: WealthService) {}

  @Get()
  async listPrograms(@Query('activeOnly') activeOnly?: string) {
    const programs = await this.wealthService.listPrograms(activeOnly !== 'true');
    return { success: true, data: programs };
  }

  @Get('available')
  async getAvailableForDriver(@Query('driverProfileId') driverProfileId: string) {
    const programs = await this.wealthService.getAvailableForDriver(driverProfileId);
    return { success: true, data: programs };
  }

  @Post()
  async createProgram(@Body() dto: CreateWealthProgramDto) {
    const program = await this.wealthService.createProgram(dto);
    return { success: true, message: 'Wealth creation program created', data: program };
  }

  @Put(':id')
  async updateProgram(@Param('id') id: string, @Body() dto: UpdateWealthProgramDto) {
    const program = await this.wealthService.updateProgram(id, dto);
    return { success: true, message: 'Wealth creation program updated', data: program };
  }

  @Delete(':id')
  async deleteProgram(@Param('id') id: string) {
    await this.wealthService.deleteProgram(id);
    return { success: true, message: 'Wealth creation program deleted' };
  }

  @Post(':id/badge-incentives')
  async attachBadgeIncentive(@Param('id') id: string, @Body() dto: BadgeIncentiveInput) {
    const incentive = await this.wealthService.upsertBadgeIncentive(id, dto);
    return { success: true, message: 'Badge incentive attached', data: incentive };
  }

  @Delete(':id/badge-incentives/:incentiveId')
  async removeBadgeIncentive(
    @Param('id') id: string,
    @Param('incentiveId') incentiveId: string
  ) {
    await this.wealthService.removeBadgeIncentive(id, incentiveId);
    return { success: true, message: 'Badge incentive removed' };
  }

  @Post('enroll')
  async enrollDriver(
    @Body()
    body: {
      driverProfileId: string;
      allocations: Array<{ programId: string; deductionPct: number; isEnrolled: boolean }>;
    }
  ) {
    const programs = await this.wealthService.enrollDriver(
      body.driverProfileId,
      body.allocations || []
    );
    return { success: true, message: 'Wealth program selections updated', data: programs };
  }
}

