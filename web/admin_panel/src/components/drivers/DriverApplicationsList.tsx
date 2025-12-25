import React, { useState, useEffect } from 'react';
import { adminService, DriverApplication } from '../../services/adminService';
import { DriverApplicationDetail } from './DriverApplicationDetail';
import { RejectionReasonModal } from '../approvals/RejectionReasonModal';

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

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, total } = await adminService.getDriverApplicationsPaginated(currentPage, pageSize);
        // If we had a real backend search, we'd pass searchQuery too. 
        // For now, let's filter the returned page client-side or assume the service handles it.
        // Since my mock service doesn't handle search, I'll fetch 'all' then filter.
        // Actually, let's just use the returned paginated data for the table, 
        // and ignore search for this specific step unless I update the service to handle search.
        // To keep it simple and consistent with the previous logic:

        let displayData = data;

        if (searchQuery) {
          // If searching, we might need a search endpoint. 
          // Providing a simple client side fallback for the mock experience:
          const allResult = await adminService.getDriverApplicationsPaginated(1, 100); // Fetch more for search
          displayData = allResult.data.filter(app =>
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.email && app.email.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          // Verify 'name' vs 'fullName' in interface
          // The interface has 'fullName', the mock service has 'name'. I should standardize.
          // I'll update the service to return 'fullName' to match interface.
        }

        // Mapping service 'name' to 'fullName' if needed
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
      }
    };
    fetchApps();
  }, [searchQuery, pageSize, currentPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDriverIds(applications.slice(0, pageSize).map(app => app.id));
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
      alert('Bulk approval successful');
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
      alert('Bulk rejection successful');
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

  // Pagination logic
  const totalPages = Math.ceil(applications.length / pageSize);
  const currentData = applications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden space-y-4">
      {/* Controls Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl font-semibold text-gray-800">Applications</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {applications.length} Found
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input (Story 79.16) */}
          <input
            type="text"
            placeholder="Search name or email..."
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Page Size Selector (Story 79.19) */}
          <select
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedDriverIds.length > 0 && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="text-sm text-blue-800 font-medium">{selectedDriverIds.length} selected</span>
          <div className="flex gap-2">
            {/* Bulk Reject (Story 79.20) */}
            <button
              onClick={() => setIsBulkRejectModalOpen(true)}
              className="bg-white border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Reject Selected
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={isBulkApproving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              {isBulkApproving ? 'Approving...' : 'Approve Selected'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedDriverIds.length > 0 && selectedDriverIds.length === currentData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map(app => (
              <tr key={app.id} className={`hover:bg-gray-50 transition-colors ${selectedDriverIds.includes(app.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedDriverIds.includes(app.id)}
                    onChange={() => handleSelectOne(app.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.applicationDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedAppId(app.id)}
                    className="text-blue-600 hover:text-blue-900 font-semibold"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No applications match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, applications.length)}</span> of <span className="font-medium">{applications.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* Simple pagination buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
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
  );
};