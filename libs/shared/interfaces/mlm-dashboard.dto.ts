interface KpiTotalCommissions {
  month: number;
  allTime: number;
}

interface Kpis {
  totalCommissions: KpiTotalCommissions;
  newReferredDrivers: number;
  conversionRate: number;
  avgReferralsPerDriver: number;
}

interface ChartDataItem {
  date: string;
  [key: string]: any;
}

interface ReferrerChartItem {
  name: string;
  [key: string]: any;
}

interface Charts {
  newDriversOverTime: ChartDataItem[];
  topReferrers: ReferrerChartItem[];
}

export class MlmDashboardDto {
  kpis: Kpis;
  charts: Charts;
}