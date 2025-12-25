'use client';

import { useEffect, useState } from 'react';

// A mock type for the submission history, mirroring the backend model.
interface DocumentSubmission {
  id: string;
  submittedAt: string;
  status: 'Approved' | 'Rejected' | 'Pending Review';
  rejectionReason?: string | null;
}

interface DocumentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  docType: string;
}

// Add a type for filter options
type FilterStatus = DocumentSubmission['status'] | 'All';

// A simple status badge component for visual consistency.
const StatusBadge = ({ status }: { status: DocumentSubmission['status'] }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full text-white';
  let colorClasses = '';

  switch (status) {
    case 'Approved':
      colorClasses = 'bg-green-500';
      break;
    case 'Rejected':
      colorClasses = 'bg-red-500';
      break;
    case 'Pending Review':
      colorClasses = 'bg-yellow-500';
      break;
  }

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

export const DocumentHistoryModal = ({
  isOpen,
  onClose,
  userId,
  docType,
}: DocumentHistoryModalProps) => {
  const [history, setHistory] = useState<DocumentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All'); // New state for filter

  useEffect(() => {
    if (!isOpen || !userId || !docType) {
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, this URL would come from an environment variable.
        let url = `/api/admin/documents/${userId}/history?docType=${encodeURIComponent(docType)}`;
        if (filterStatus !== 'All') {
          url += `&status=${encodeURIComponent(filterStatus)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch document history.');
        }
        const data: DocumentSubmission[] = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, userId, docType, filterStatus]); // Add filterStatus to dependencies

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">History for: {docType}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        <div className="p-4 border-b flex justify-end">
          <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
          <select
            id="statusFilter"
            className="border rounded-md p-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending Review">Pending Review</option>
          </select>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading && <div className="text-center">Loading history...</div>}
          {error && <div className="text-center text-red-500">Error: {error}</div>}
          {!isLoading && !error && history.length === 0 && (
            <div className="text-center text-gray-500">No submission history found.</div>
          )}
          {!isLoading && !error && history.length > 0 && (
            <ul className="space-y-4">
              {history.map((submission, index) => (
                <li key={submission.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Submission #{history.length - index}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>
                  {submission.status === 'Rejected' && submission.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-400 text-red-700">
                      <p className="font-bold">Rejection Reason:</p>
                      <p>{submission.rejectionReason}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentHistoryModal;