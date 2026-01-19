import React, { useState } from 'react';
import {
  Download,
  Summarize,
  CalendarMonth,
  Description,
  TableChart,
  Person,
  ReceiptLong
} from '@mui/icons-material';

type ReportType = 'FINANCIAL_SUMMARY' | 'DRIVER_PERFORMANCE' | 'TRIP_LOGS';

export const ExportableReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('FINANCIAL_SUMMARY');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);

    // Simulating download request
    setTimeout(() => {
      // In production: window.location.href = `/api/reports/export?...`
      setIsDownloading(false);
      // alert('Download started.'); // UI Feedback used instead
    }, 2000);
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

  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case 'FINANCIAL_SUMMARY': return <ReceiptLong className="text-green-600 dark:text-green-400" />;
      case 'DRIVER_PERFORMANCE': return <Person className="text-blue-600 dark:text-blue-400" />;
      case 'TRIP_LOGS': return <TableChart className="text-purple-600 dark:text-purple-400" />;
    }
  };

  const getReportDescription = (type: ReportType) => {
    switch (type) {
      case 'FINANCIAL_SUMMARY': return 'Comprehensive breakdown of revenue, commissions, and payouts.';
      case 'DRIVER_PERFORMANCE': return 'Detailed metrics on driver efficiency, ratings, and ride completion.';
      case 'TRIP_LOGS': return 'Raw data export of all trip records including locations and timestamps.';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Summarize className="text-blue-600 dark:text-blue-400" />
          Data Exports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Download monthly system reports in CSV format.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CONFIG SECTION */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Description fontSize="small" className="text-slate-400" />
                Select Report Type
              </label>
              <div className="space-y-3">
                {(['FINANCIAL_SUMMARY', 'DRIVER_PERFORMANCE', 'TRIP_LOGS'] as ReportType[]).map((type) => (
                  <div
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${reportType === type
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-full ${reportType === type ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      {getReportIcon(type)}
                    </div>
                    <div className="flex-1">
                      <span className={`block text-sm font-bold ${reportType === type ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                        {type.replace('_', ' ')}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {getReportDescription(type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PERIOD SECTION */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CalendarMonth fontSize="small" className="text-slate-400" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Month</span>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Year</span>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Summary</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-300">File Format:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">CSV</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-slate-600 dark:text-slate-300">Est. Size:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">~2.4 MB</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex justify-center items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download />
                  Download CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};