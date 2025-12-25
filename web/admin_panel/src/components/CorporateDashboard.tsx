import React from 'react';

const StatCard: React.FC<{ title: string; value: string; trend?: string }> = ({ title, value, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <div className="flex items-end justify-between mt-2">
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      {trend && <span className="text-sm text-green-600 font-medium">{trend}</span>}
    </div>
  </div>
);

export const CorporateDashboard: React.FC = () => {
  // Mock Data for "Acme Corp"
  const stats = {
    totalRides: 145,
    totalSpend: 87500,
    activeEmployees: 42,
  };

  const recentTrips = [
    { id: 't1', employee: 'Alice W.', date: '2024-05-28 08:30', from: 'Westlands', to: 'CBD', cost: 450 },
    { id: 't2', employee: 'Bob M.', date: '2024-05-28 09:15', from: 'Kilimani', to: 'JKIA', cost: 1200 },
    { id: 't3', employee: 'Charlie D.', date: '2024-05-27 17:45', from: 'Upper Hill', to: 'Karen', cost: 850 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Corporate Dashboard: Acme Corp</h1>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Active Contract</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Rides (This Month)" value={stats.totalRides.toString()} trend="+12% vs last month" />
        <StatCard title="Total Spend (This Month)" value={`KES ${stats.totalSpend.toLocaleString()}`} trend="+5% vs last month" />
        <StatCard title="Active Employees" value={stats.activeEmployees.toString()} />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Recent Trip Activity</h3>
          <button className="text-blue-600 text-sm hover:underline">View All Reports</button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost (KES)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentTrips.map(trip => (
              <tr key={trip.id}>
                <td className="px-6 py-4 font-medium">{trip.employee}</td>
                <td className="px-6 py-4 text-gray-500">{trip.date}</td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {trip.from}
                    <span className="mx-2">→</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {trip.to}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold">{trip.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};