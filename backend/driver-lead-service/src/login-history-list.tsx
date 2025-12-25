"use client";

import { useEffect, useState, useMemo } from 'react';

interface LoginHistoryEntry {
  id: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  reportedAt: string | null;
}

// A simple debounce hook
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

export function LoginHistoryList() {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [locationFilter, setLocationFilter] = useState('');
  const debouncedLocationFilter = useDebounce(locationFilter, 500);
  const [reportingStatus, setReportingStatus] = useState<Record<string, 'reporting' | 'reported'>>({});

  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // For a sort change, we reset the page and history
      if (page === 1) setHistory([]);

      setIsLoading(true);
      try {
        // This assumes a JWT is sent automatically (e.g., via a cookie or Authorization header).
        const params = new URLSearchParams({
          page: page.toString(), limit: '10', sortBy: 'createdAt', sortOrder,
        });
        if (debouncedLocationFilter) params.append('location', debouncedLocationFilter); // This line seems to be duplicated, but we'll keep it as is.
        const response = await fetch(`/api/v1/auth/login-history?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch login history.');
        }
        const data = await response.json();
        setHistory(prev => (page === 1 ? data.data : [...prev, ...data.data]));
        setHasMore(data.hasMore);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [page, sortOrder, debouncedLocationFilter]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'desc' | 'asc');
    setPage(1); // Reset to first page on sort change
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handleReportLogin = async (loginId: string) => {
    if (reportingStatus[loginId]) return; // Prevent multiple clicks

    setReportingStatus(prev => ({ ...prev, [loginId]: 'reporting' }));

    try {
      const response = await fetch(`/api/v1/auth/login-history/${loginId}/report`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to report login.');
      }
      // On success, update the local state to reflect the reported status
      setHistory(prev => prev.map(entry => entry.id === loginId ? { ...entry, reportedAt: new Date().toISOString() } : entry));
      setReportingStatus(prev => ({ ...prev, [loginId]: 'reported' }));
    } catch (err) {
      console.error(err);
      setReportingStatus(prev => ({ ...prev, [loginId]: undefined })); // Reset on error
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Login Activity</h2>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="locationFilter" className="text-sm font-medium text-gray-700 mr-2">Filter by Location:</label>
            <input type="text" id="locationFilter" value={locationFilter} onChange={handleFilterChange} placeholder="e.g., Nairobi" className="border p-1 rounded-md bg-gray-50 text-sm" />
          </div>
          <div>
            <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
            <select id="sortOrder" value={sortOrder} onChange={handleSortChange} className="border p-1 rounded-md bg-gray-50 text-sm">
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
      {isLoading && <p className="text-gray-500">Loading login history...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && history.length === 0 && <p>No recent login activity found.</p>}
      {!isLoading && !error && history.length > 0 && (
        <ul className="space-y-4">
          {history.map((entry) => (
            <li key={entry.id} className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">{entry.location || 'Unknown Location'}</p>
                <p className="text-sm text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                <p>
                  <span className="font-medium">IP Address:</span> {entry.ipAddress}
                </p>
                <p className="truncate" title={entry.userAgent}>
                  <span className="font-medium">Device:</span> {entry.userAgent || 'Unknown'}
                </p>
              </div>
              <div className="text-right mt-2">
                {entry.reportedAt || reportingStatus[entry.id] === 'reported' ? (
                  <span className="text-sm font-medium text-yellow-600">Reported</span>
                ) : (
                  <button
                    onClick={() => handleReportLogin(entry.id)}
                    disabled={!!reportingStatus[entry.id]}
                    className="text-sm text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                  >
                    {reportingStatus[entry.id] === 'reporting' ? 'Reporting...' : 'Report Suspicious Activity'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <div className="mt-6 text-center">
          <button onClick={loadMore} disabled={isLoading} className="bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 disabled:bg-slate-400">
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}