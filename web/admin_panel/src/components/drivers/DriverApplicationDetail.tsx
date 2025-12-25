import React, { useState, useEffect } from 'react';
import { adminService, DriverApplicationDetails } from '../../services/adminService';
import { EditDriverProfileModal } from '../../components/admin/EditDriverProfileModal';
import { DocumentHistoryModal } from './DocumentHistoryModal';

interface Props {
  applicationId: string;
  onBack: () => void;
}

type DocumentReviewState = {
  [docId: string]: { status: 'approved' | 'rejected'; reason: string };
};

export const DriverApplicationDetail: React.FC<Props> = ({ applicationId, onBack }) => {
  const [application, setApplication] = useState<DriverApplicationDetails | null>(null);
  const [reviewState, setReviewState] = useState<DocumentReviewState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Story 79.6: Document History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | undefined>(undefined);

  useEffect(() => {
    adminService.getApplicationDetails(applicationId).then(data => {
      setApplication(data);
      // Initialize review state 
      if (data) {
        const initialState: DocumentReviewState = {};
        data.documents.forEach(doc => {
          initialState[doc.id] = { status: 'approved', reason: '' };
        });
        setReviewState(initialState);
      }
    });
  }, [applicationId]);

  const handleDocStatusChange = (docId: string, status: 'approved' | 'rejected') => {
    setReviewState(prev => ({
      ...prev,
      [docId]: { ...prev[docId], status },
    }));
  };

  const handleReasonChange = (docId: string, reason: string) => {
    setReviewState(prev => ({
      ...prev,
      [docId]: { ...prev[docId], reason },
    }));
  };

  const handleSubmit = async (action: 'approve' | 'request-correction') => {
    setIsLoading(true);
    try {
      if (action === 'approve') {
        await adminService.approveApplication(applicationId);
        alert('Application Approved!');
      } else {
        const rejectionReasons = Object.values(reviewState)
          .filter(v => v.status === 'rejected' && v.reason)
          .map(v => v.reason);
        await adminService.requestCorrection(applicationId, rejectionReasons);
        alert('Correction Request Sent!');
      }
      onBack();
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = (docType: string) => {
    setSelectedDocType(docType);
    setHistoryModalOpen(true);
  };

  if (!application) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const isCorrectionFlow = Object.values(reviewState).some(v => v.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2">&larr;</span> Back to List
        </button>
        <div className="flex gap-3">
          {isCorrectionFlow ? (
            <button
              onClick={() => handleSubmit('request-correction')}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Request Correction'}
            </button>
          ) : (
            <button
              onClick={() => handleSubmit('approve')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Approving...' : 'Approve Application'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1 border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Applicant Details</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="text-gray-900 font-medium">{application.fullName}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
              <div className="text-gray-900 font-medium">{application.phone}</div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Make</label>
                  <div className="text-sm text-gray-900">{application.vehicleDetails.make}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</label>
                  <div className="text-sm text-gray-900">{application.vehicleDetails.model}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</label>
                  <div className="text-sm text-gray-900">{application.vehicleDetails.year}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">License Plate</label>
                  <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded w-fit">{application.vehicleDetails.licensePlate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Review */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Document Verification</h2>
          <div className="space-y-6">
            {application.documents.map(doc => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      📄
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">{doc.type.replace(/_/g, ' ').toLowerCase()}</h4>
                      <div className="flex gap-2 text-sm">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Document &rarr;
                        </a>
                        <span className="text-gray-300">|</span>
                        {/* Story 79.6: View History Button */}
                        <button
                          onClick={() => handleViewHistory(doc.type)}
                          className="text-gray-500 hover:text-gray-700 hover:underline"
                        >
                          History
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => handleDocStatusChange(doc.id, 'approved')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${reviewState[doc.id]?.status === 'approved'
                        ? 'bg-white text-green-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDocStatusChange(doc.id, 'rejected')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${reviewState[doc.id]?.status === 'rejected'
                        ? 'bg-white text-red-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {reviewState[doc.id]?.status === 'rejected' && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-red-600 mb-1">Rejection Reason</label>
                    <textarea
                      placeholder="Please explain why this document was rejected..."
                      value={reviewState[doc.id].reason}
                      onChange={(e) => handleReasonChange(doc.id, e.target.value)}
                      className="w-full border border-red-200 rounded-lg p-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditDriverProfileModal
          driverId={applicationId}
          initialName={application.fullName}
          initialPhone={application.phone}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            adminService.getApplicationDetails(applicationId).then(setApplication);
          }}
        />
      )}

      {/* Document History Modal */}
      {historyModalOpen && (
        <DocumentHistoryModal
          driverId={applicationId}
          documentType={selectedDocType}
          onClose={() => setHistoryModalOpen(false)}
        />
      )}
    </div>
  );
};