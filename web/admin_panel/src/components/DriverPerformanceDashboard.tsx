import React, { useState, useEffect, useMemo } from 'react';

interface DriverPerformance {
  id: string;
  name: string;
  totalTrips: number;
  acceptanceRate: number;
  averageRating: number;
  totalEarnings: number;
}

type SortKey = keyof DriverPerformance;
type SortOrder = 'asc' | 'desc';

const mockData: DriverPerformance[] = [];

export const DriverPerformanceDashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverPerformance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder } | null>({ key: 'totalEarnings', order: 'desc' });

  useEffect(() => {
    // Mock API fetch
    setDrivers(mockData);
  }, []);

  const filteredAndSortedDrivers = useMemo(() => {
    let sortableDrivers = [...drivers];

    // Filter
    if (searchTerm) {
      sortableDrivers = sortableDrivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig !== null) {
      sortableDrivers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.order === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDrivers;
  }, [drivers, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.order === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Performance</h1>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by driver name..."
          className="w-full md:w-1/3 p-2 border rounded"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Driver Name{getSortIndicator('name')}
              </th>
              <th onClick={() => requestSort('totalTrips')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Total Trips{getSortIndicator('totalTrips')}
              </th>
              <th onClick={() => requestSort('acceptanceRate')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Acceptance Rate{getSortIndicator('acceptanceRate')}
              </th>
              <th onClick={() => requestSort('averageRating')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Avg. Rating{getSortIndicator('averageRating')}
              </th>
              <th onClick={() => requestSort('totalEarnings')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Total Earnings{getSortIndicator('totalEarnings')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{driver.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{driver.totalTrips}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{driver.acceptanceRate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{driver.averageRating.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(driver.totalEarnings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};