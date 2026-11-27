import React, { useState } from 'react';
import { PageHeader } from './common/PageHeader';
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
      case 'DRIVER_PERFORMANCE': return <Person className="text-amber-600 dark:text-amber-400" />;
      case 'TRIP_LOGS': return <TableChart className="text-amber-400" />;
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
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        category="Finance & Sacco"
        title="Institutional Data Exports"
        subtitle="Download financial reconciliations, driver performance, and operational records in CSV format"
        icon={<Summarize className="w-5 h-5 text-amber-500" />}
      />

      <div className="bg-[#131722] shadow-sm rounded-[3px] border border-white/10 p-5 md:p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CONFIG SECTION */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Description fontSize="small" className="text-gray-400" />
                Select Report Type
              </label>
              <div className="space-y-2.5">
                {(['FINANCIAL_SUMMARY', 'DRIVER_PERFORMANCE', 'TRIP_LOGS'] as ReportType[]).map((type) => (
                  <div
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`p-3.5 rounded-[3px] border cursor-pointer transition-all flex items-start gap-3 ${
                      reportType === type
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-[3px] ${reportType === type ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-400'}`}>
                      {getReportIcon(type)}
                    </div>
                    <div className="flex-1">
                      <span className={`block text-xs font-bold ${reportType === type ? 'text-amber-400' : 'text-white'}`}>
                        {type.replace(/_/g, ' ')}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5 leading-snug">
                        {getReportDescription(type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PERIOD SECTION */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <CalendarMonth fontSize="small" className="text-gray-400" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-gray-400 mb-1 block">Month</span>
                  <select
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-xs text-white focus:outline-none focus:border-amber-500/50"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 mb-1 block">Year</span>
                  <select
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-xs text-white focus:outline-none focus:border-amber-500/50"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#0a0a0a] rounded-[3px] border border-white/10">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">Summary</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">File Format:</span>
                  <span className="font-mono font-bold text-white">CSV</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-gray-400">Est. Size:</span>
                  <span className="font-mono font-bold text-white">~2.4 MB</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary w-full flex justify-center items-center gap-1.5 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Download fontSize="small" />
                  <span>Download CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};