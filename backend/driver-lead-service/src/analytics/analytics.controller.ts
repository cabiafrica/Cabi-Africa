import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('bi-stats')
    async getBIStats() {
        return this.analyticsService.getBIStats();
    }

    @Get('city-kpis/:cityId')
    async getCityKPIs(@Param('cityId') cityId: string) {
        return this.analyticsService.getCityKPIs(cityId);
    }

    @Get('heatmap')
    async getHeatMap(@Query('type') type: 'DEMAND' | 'SUPPLY') {
        return this.analyticsService.getHeatMapData(type);
    }
}
