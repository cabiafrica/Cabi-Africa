import { Controller, Get, Param, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('driver/:driverId')
  getDriverPerformance(@Param('driverId') driverId: string) {
    return this.analyticsService.getDriverPerformanceForAdmin(driverId);
  }
}