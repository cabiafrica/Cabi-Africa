import { Test, TestingModule } from '@nestjs/testing';
import { MlmDashboardService } from '@cabi-flutter/backend/document-service'; // Adjust this import path if the service is in its own file

describe('MlmDashboardService', () => {
  let service: MlmDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MlmDashboardService],
    }).compile();

    service = module.get<MlmDashboardService>(MlmDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return the correct structure for KPIs and charts', async () => {
      const dateRange = 'last_30_days';
      const metrics = await service.getDashboardMetrics(dateRange);

      // Check for KPI structure
      expect(metrics).toHaveProperty('kpis');
      expect(metrics.kpis).toHaveProperty('totalCommissions');
      expect(metrics.kpis).toHaveProperty('newReferredDrivers');
      expect(metrics.kpis).toHaveProperty('conversionRate');
      expect(metrics.kpis).toHaveProperty('avgReferralsPerDriver');

      // Check for Chart structure
      expect(metrics).toHaveProperty('charts');
      expect(metrics.charts).toHaveProperty('newDriversOverTime');
      expect(metrics.charts).toHaveProperty('topReferrers');

      // Check for data types and array content
      expect(typeof metrics.kpis.totalCommissions.month).toBe('number');
      expect(Array.isArray(metrics.charts.newDriversOverTime)).toBe(true);
      expect(Array.isArray(metrics.charts.topReferrers)).toBe(true);

      // Check that chart data has the expected keys
      expect(metrics.charts.newDriversOverTime[0]).toHaveProperty('date');
      expect(metrics.charts.newDriversOverTime[0]).toHaveProperty('New Drivers');
      expect(metrics.charts.topReferrers[0]).toHaveProperty('name');
      expect(metrics.charts.topReferrers[0]).toHaveProperty('Successful Referrals');
    });
  });
});