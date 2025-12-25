import React, { useState, useEffect } from 'react';
// Assume a charting library like Recharts is installed
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialStats {
  totalRevenue: number;
  systemCommission: number;
  driverPayouts: number;
  saccoSavings: number;
  dailyRevenue: { date: string; revenue: number }[];
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
  </div>
);

export const FinancialDashboard: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      const dailyData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * (50000 - 20000 + 1)) + 20000,
        };
      });

      setStats({
        totalRevenue: 985400,
        systemCommission: 197080,
        driverPayouts: 740550,
        saccoSavings: 47870,
        dailyRevenue: dailyData,
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <div className="p-6">Loading financial data...</div>;
  }

  if (!stats) {
    return <div className="p-6">Failed to load data.</div>;
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Financial Dashboard (Last 30 Days)</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
        <KpiCard title="System Commission" value={formatCurrency(stats.systemCommission)} />
        <KpiCard title="Driver Payouts" value={formatCurrency(stats.driverPayouts)} />
        <KpiCard title="SACCO Savings" value={formatCurrency(stats.saccoSavings)} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
        <div style={{ width: '100%', height: 300 }}>
          {/* Placeholder for chart library */}
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">[Chart Placeholder: Use Recharts or similar library here]</p>
          </div>
          {/* 
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          */}
        </div>
      </div>
    </div>
  );
};