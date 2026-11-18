import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import apiClient from '../services/apiClient';

interface FinancialStats {
  totalRevenue: number;
  systemCommission: number;
  driverPayouts: number;
  saccoSavings: number;
  dailyRevenue: { date: string; revenue: number }[];
}

type DateRange = '7d' | '30d' | '90d';

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

const EMPTY_STATS: FinancialStats = {
  totalRevenue: 0,
  systemCommission: 0,
  driverPayouts: 0,
  saccoSavings: 0,
  dailyRevenue: [],
};

const KpiCard: React.FC<{ title: string; value: string; isLoading?: boolean }> = ({
  title,
  value,
  isLoading,
}) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    {isLoading ? (
      <div className="mt-1 h-9 w-32 bg-gray-200 animate-pulse rounded" />
    ) : (
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

export const FinancialDashboard: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<FinancialStats>('/analytics/financials', {
        params: { range: dateRange },
      });
      setStats(res.data ?? EMPTY_STATS);
    } catch (err: any) {
      console.error('Failed to fetch financial stats:', err);
      setError(
        err?.response?.data?.message ??
          'Failed to load financial data. The analytics service may be unavailable.'
      );
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value);

  const rangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? '';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        <div className="flex gap-2">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                dateRange === opt.value
                  ? 'bg-amber-500 text-black border-cyan-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-cyan-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="ml-4 px-3 py-1 text-sm text-red-700 border border-red-300 rounded hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title={`Total Revenue (${rangeLabel})`} value={formatCurrency(stats.totalRevenue)} isLoading={loading} />
        <KpiCard title="System Commission" value={formatCurrency(stats.systemCommission)} isLoading={loading} />
        <KpiCard title="Driver Payouts" value={formatCurrency(stats.driverPayouts)} isLoading={loading} />
        <KpiCard title="Sacco Savings" value={formatCurrency(stats.saccoSavings)} isLoading={loading} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Daily Revenue — Last {rangeLabel}</h2>
        {loading ? (
          <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded" />
        ) : stats.dailyRevenue.length === 0 ? (
          <div className="h-[300px] w-full bg-gray-50 flex items-center justify-center rounded">
            <p className="text-gray-400 text-sm">No revenue data available for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyRevenue} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `KES ${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" fill="#F59E0B" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
