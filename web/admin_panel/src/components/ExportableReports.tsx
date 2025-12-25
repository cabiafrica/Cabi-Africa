import React, { useState } from 'react';

type ReportType = 'FINANCIAL_SUMMARY' | 'DRIVER_PERFORMANCE' | 'TRIP_LOGS';

export const ExportableReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('FINANCIAL_SUMMARY');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // In a real app, this would be a direct link or an API call that returns a file stream.
    // For simulation, we'll just log the intended URL and show an alert.
    const backendUrl = `/api/reports/export?type=${reportType}&year=${year}&month=${month}`;
    console.log(`Requesting download from: ${backendUrl}`);

    setTimeout(() => {
      alert(`A CSV download for ${reportType} (${year}-${month}) would start now.`);
      setIsDownloading(false);
    }, 1500);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Export Reports</h1>

      <div className="bg-white shadow rounded p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Report Type</label>
          <select
            className="mt-1 block w-full border rounded px-3 py-2"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
          >
            <option value="FINANCIAL_SUMMARY">Financial Summary</option>
            <option value="DRIVER_PERFORMANCE">Driver Performance</option>
            <option value="TRIP_LOGS">Trip Logs</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          >
            {isDownloading ? 'Generating...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};