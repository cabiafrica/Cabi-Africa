import React, { useState, useEffect } from 'react';
import { adminService, DriverApplication } from '../../services/adminService';
import { DriverApplicationDetail } from './DriverApplicationDetail';
import { RejectionReasonModal } from '../approvals/RejectionReasonModal';
import {
  RecentActors,
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  Visibility,
  MoreVert,
  NavigateNext,
  NavigateBefore
} from '@mui/icons-material';

export const DriverApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [isBulkRejectModalOpen, setIsBulkRejectModalOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const { data } = await adminService.getDriverApplicationsPaginated(currentPage, pageSize);
        // Mock client-side search logic fallback
        let displayData = data;

        if (searchQuery) {
          const allResult = await adminService.getDriverApplicationsPaginated(1, 100);
          displayData = allResult.data.filter(app =>
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.email && app.email.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        const mappedData = displayData.map((d: any) => ({
          ...d,
          fullName: d.name || d.fullName,
          phone: d.phone || '+254...',
          applicationDate: d.date || d.applicationDate || new Date().toISOString(),
          status: d.status
        }));

        setApplications(mappedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [searchQuery, pageSize, currentPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Logic modified to select only current page items for simplicity and UX
      const pageIds = applications.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(app => app.id);
      setSelectedDriverIds(pageIds);
    } else {
      setSelectedDriverIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedDriverIds.includes(id)) {
      setSelectedDriverIds(selectedDriverIds.filter(sid => sid !== id));
    } else {
      setSelectedDriverIds([...selectedDriverIds, id]);
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedDriverIds.length) return;

    setIsBulkApproving(true);
    try {
      await adminService.bulkApproveDocuments(selectedDriverIds);
      // alert('Bulk approval successful'); // Using UI feedback instead
      setApplications(prev => prev.filter(app => !selectedDriverIds.includes(app.id)));
      setSelectedDriverIds([]);
    } catch (error) {
      console.error(error);
      alert('Bulk approval failed');
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handleBulkReject = async (reason: string) => {
    setIsBulkRejectModalOpen(false);
    try {
      await adminService.bulkRejectDocuments(selectedDriverIds, reason);
      setApplications(prev => prev.filter(app => !selectedDriverIds.includes(app.id)));
      setSelectedDriverIds([]);
    } catch (error) {
      console.error(error);
      alert('Bulk rejection failed');
    }
  };

  if (selectedAppId) {
    return <DriverApplicationDetail applicationId={selectedAppId} onBack={() => setSelectedAppId(null)} />;
  }

  // Client-side pagination logic wrapper (since we are doing hybrid mock/client)
  const totalPages = Math.ceil(applications.length / pageSize);
  const currentData = applications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RecentActors className="text-blue-600 dark:text-blue-400" />
            Driver Applications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve new driver registrations.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">
          <div className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
            Pending
          </div>
          <div className="px-4 py-2 text-sm font-bold text-slate-900 dark:text-white">
            {applications.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden space-y-4">
        {/* Controls Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search name or email..."
              className="w-full sm:w-64 pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-slate-500 dark:text-slate-400">Rows:</span>
            <select
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedDriverIds.length > 0 && (
          <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <span className="text-sm text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
              <CheckCircle fontSize="small" />
              {selectedDriverIds.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkRejectModalOpen(true)}
                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Cancel fontSize="small" />
                Reject Selected
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={isBulkApproving}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <CheckCircle fontSize="small" />
                {isBulkApproving ? 'Approving...' : 'Approve Selected'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700"
                    checked={selectedDriverIds.length > 0 && currentData.every(d => selectedDriverIds.includes(d.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading applications...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No applications match your search.</td></tr>
              ) : currentData.map(app => (
                <tr key={app.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedDriverIds.includes(app.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700"
                      checked={selectedDriverIds.includes(app.id)}
                      onChange={() => handleSelectOne(app.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{app.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{app.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{app.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(app.applicationDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedAppId(app.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center justify-end gap-1 w-full"
                    >
                      <Visibility fontSize="small" />
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-400">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, applications.length)}</span> of <span className="font-medium">{applications.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px gap-1" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <NavigateBefore fontSize="small" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${currentPage === page
                          ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <NavigateNext fontSize="small" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        <RejectionReasonModal
          isOpen={isBulkRejectModalOpen}
          onClose={() => setIsBulkRejectModalOpen(false)}
          onConfirm={handleBulkReject}
          title="Bulk Reject Applications"
        />
      </div>
    </div>
  );
};