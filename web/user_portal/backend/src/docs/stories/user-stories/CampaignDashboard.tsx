import React from 'react';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${color}`}>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export const CampaignDashboard: React.FC = () => {
  // Mock Data
  const stats = {
    totalRedeemed: 1250,
    totalCost: 250000,
    activeCampaigns: 3,
    openRate: '18.5%'
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Campaign Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Campaigns" value={stats.activeCampaigns.toString()} color="border-blue-500" />
        <StatCard title="Total Redemptions" value={stats.totalRedeemed.toLocaleString()} color="border-green-500" />
        <StatCard title="Total Discount Cost" value={`KES ${stats.totalCost.toLocaleString()}`} color="border-red-500" />
        <StatCard title="Avg. Push Open Rate" value={stats.openRate} color="border-purple-500" />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-bold">Recent Campaign Activity</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redemptions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4">Welcome Bonus</td>
              <td className="px-6 py-4 text-sm text-gray-500">Promo Code</td>
              <td className="px-6 py-4">850</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span></td>
            </tr>
            <tr>
              <td className="px-6 py-4">Weekend Blast</td>
              <td className="px-6 py-4 text-sm text-gray-500">Push Notification</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};