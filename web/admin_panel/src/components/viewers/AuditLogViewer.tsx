import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AuditLog, AuditLogFilters } from '../../services/adminService';
import { PageHeader } from '../common/PageHeader';
import HistoryIcon from '@mui/icons-material/History';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>({
    userEmail: '',
    action: '',
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs(filters);
      setLogs(data);
    } catch (error) {
      alert('Failed to fetch audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Growth & Platform"
        title="System Audit Logs"
        description="Immutable chronological record of administrative operations and critical platform mutations."
        icon={<HistoryIcon className="text-amber-500" />}
      />

      <div className="bg-white dark:bg-[#131722] shadow rounded-[3px] border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              name="userEmail"
              placeholder="Filter by User Email..."
              value={filters.userEmail}
              onChange={handleFilterChange}
              aria-label="Filter by User Email"
              className="border-slate-300 dark:border-white/10 focus:ring-1 focus:ring-amber-500/65 focus:border-amber-500/65 block w-full text-xs border rounded-[3px] p-2 bg-white dark:bg-[#131722] text-slate-900 dark:text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <input
              type="text"
              name="action"
              placeholder="Filter by Action..."
              value={filters.action}
              onChange={handleFilterChange}
              className="border-slate-300 dark:border-white/10 focus:ring-1 focus:ring-amber-500/65 focus:border-amber-500/65 block w-full text-xs border rounded-[3px] p-2 bg-white dark:bg-[#131722] text-slate-900 dark:text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border-slate-300 dark:border-white/10 focus:ring-1 focus:ring-amber-500/65 focus:border-amber-500/65 block w-full text-xs border rounded-[3px] p-2 bg-white dark:bg-[#131722] text-slate-900 dark:text-slate-100 outline-none"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border-slate-300 dark:border-white/10 focus:ring-1 focus:ring-amber-500/65 focus:border-amber-500/65 block w-full text-xs border rounded-[3px] p-2 bg-white dark:bg-[#131722] text-slate-900 dark:text-slate-100 outline-none"
            />
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center py-2 px-3.5 border border-transparent shadow-sm shadow-amber-500/20 text-xs font-semibold rounded-[3px] text-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 focus:outline-none transition-all active:scale-95"
            >
              Apply Filters
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
            <thead className="bg-slate-50 dark:bg-[#0a0a0a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#131722] divide-y divide-slate-200 dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-amber-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading logs...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No logs found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {log.adminUserEmail}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-300">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-[3px] text-[11px] font-bold border border-amber-500/20">{log.action}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400 font-mono max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};