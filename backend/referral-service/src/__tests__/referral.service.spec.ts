import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from '../app/referral.service';

describe('ReferralService', () => {
  let service: ReferralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferralService],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
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