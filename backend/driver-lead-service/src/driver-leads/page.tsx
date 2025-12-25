"use client";

import { useState, useEffect, useCallback } from 'react';

interface ReportedLogin {
  id: string;
  userEmail: string;
  createdAt: string;
  reportedAt: string;
  ipAddress: string;
  location: string;
  userAgent: string;
}

interface FetchResult {
  data: ReportedLogin[];
  total: number;
  page: number;
  hasMore: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function ReportedLoginsPage() {
  const [logins, setLogins] = useState<ReportedLogin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ userEmail: '', ipAddress: '' });
  const debouncedFilters = useDebounce(filters, 500);
  const [actionStatus, setActionStatus] = useState<Record<string, { status: 'loading' | 'error'; message?: string }>>({});

  const fetchReportedLogins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        sortBy: 'reportedAt',
        sortOrder: 'desc',
        ...debouncedFilters,
      });

      // This assumes a JWT for an admin user is sent automatically
      const response = await fetch(`/api/v1/admin/security/reported-logins?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reported logins.');
      }
      const result: FetchResult = await response.json();
      setLogins(result.data);
      setTotalPages(Math.ceil(result.total / 15));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedFilters]);

  useEffect(() => {
    fetchReportedLogins();
  }, [fetchReportedLogins]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleAction = async (loginId: string, action: 'dismiss' | 'force-password-reset') => {
    setActionStatus(prev => ({ ...prev, [loginId]: { status: 'loading' } }));
    try {
      const response = await fetch(`/api/v1/admin/security/reported-logins/${loginId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to perform action: ${action}`);
      }
      // If dismiss was successful, refetch the data to remove the item from the list
      if (action === 'dismiss') {
        fetchReportedLogins();
      } else {
        // For password reset, just clear the loading state
        setActionStatus(prev => ({ ...prev, [loginId]: undefined }));
      }
    } catch (err: any) {
      setActionStatus(prev => ({ ...prev, [loginId]: { status: 'error', message: err.message } }));
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reported Logins</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">Filter by Email</label>
            <input type="text" name="userEmail" id="userEmail" value={filters.userEmail} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">Filter by IP Address</label>
            <input type="text" name="ipAddress" id="ipAddress" value={filters.ipAddress} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      {isLoading && <p className="text-gray-500">Loading reports...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logins.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pending reports found.</td></tr>
              ) : (
                logins.map(login => (
                  <tr key={login.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{login.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">IP: {login.ipAddress}</div>
                      <div className="text-sm text-gray-500">Location: {login.location || 'Unknown'}</div>
                      <div className="text-sm text-gray-500" title={login.userAgent}>Device: {login.userAgent.substring(0, 40)}...</div>
                      <div className="text-sm text-gray-500">Login Time: {new Date(login.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(login.reportedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAction(login.id, 'dismiss')}
                          disabled={actionStatus[login.id]?.status === 'loading'}
                          className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction(login.id, 'force-password-reset')}
                          disabled={actionStatus[login.id]?.status === 'loading'}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-300"
                        >
                          Force Reset
                        </button>
                        {actionStatus[login.id]?.status === 'loading' && <span className="text-xs text-gray-500">...</span>}
                      </div>
                      {actionStatus[login.id]?.status === 'error' && <p className="text-xs text-red-500 mt-1">{actionStatus[login.id].message}</p>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}