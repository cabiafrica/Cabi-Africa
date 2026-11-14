import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSearch, FaRobot, FaUser } from 'react-icons/fa';

// Mock Interfaces based on Area 3 specs
interface DriverDocument {
  name: string;
  url: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  aiScore?: number; 
}

interface VehicleInfo {
  make: string;
  model: string;
  plate: string;
  aiVerified: boolean;
  serviceCategory?: string;
  allowCoDriver: boolean;
}

interface DriverRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  overallAiScore: number;
  documents: DriverDocument[];
  vehicle: VehicleInfo;
  appliedAt: string;
}

export const DriverApprovalDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<DriverRegistration[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverRegistration | null>(null);
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch('/api/admin/approvals/registrations');
        const json = await res.json();
        setRegistrations(json.data || []);
      } catch (err) {
        console.error('Failed to load apps');
      }
    };
    fetchApps();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: string, score: number) => {
    if (status === 'APPROVED') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">APPROVED</span>;
    if (status === 'REJECTED') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">REJECTED</span>;
    if (score >= 90) return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold flex items-center gap-1"><FaRobot /> AUTO-APPROVE READY</span>;
    if (score >= 70) return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold flex items-center gap-1"><FaUser /> MANUAL REVIEW</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold flex items-center gap-1"><FaRobot /> AUTO-REJECT</span>;
  };

  const handleApproveSubmit = () => {
    if (!selectedDriver || !selectedCategory) return;
    
    // API call: POST /admin/drivers/{id}/approve { category: selectedCategory }
    setRegistrations(prev => prev.map(d => 
      d.id === selectedDriver.id ? { ...d, status: 'APPROVED', vehicle: { ...d.vehicle, serviceCategory: selectedCategory } } : d
    ));
    setShowApproveModal(false);
    setSelectedDriver(null);
    setSelectedCategory('');
  };

  const handleRejectSubmit = () => {
    if (!selectedDriver || !rejectionReason.trim()) return;

    // API call: POST /admin/drivers/{id}/reject { reason: rejectionReason }
    setRegistrations(prev => prev.map(d => 
      d.id === selectedDriver.id ? { ...d, status: 'REJECTED' } : d
    ));
    setShowRejectModal(false);
    setSelectedDriver(null);
    setRejectionReason('');
  };

  const filteredRegistrations = registrations.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - List */}
        <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Registrations</h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name, ID, or plate..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredRegistrations.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedDriver?.id === driver.id ? 'bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-l-cyan-500' : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{driver.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{driver.id}</p>
                  </div>
                  <div className={`px-2 py-1 rounded font-bold text-sm ${getScoreColor(driver.overallAiScore)}`}>
                    {driver.overallAiScore}% AI
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  {getStatusBadge(driver.status, driver.overallAiScore)}
                  <span className="text-xs text-gray-400">{new Date(driver.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {filteredRegistrations.length === 0 && (
              <div className="p-8 text-center text-gray-500">No registrations found.</div>
            )}
          </div>
        </div>

        {/* Right Content - Details */}
        <div className="w-2/3 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-y-auto">
          {selectedDriver ? (
            <div className="p-8 max-w-4xl mx-auto w-full">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedDriver.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-gray-500">
                    <span>{selectedDriver.email}</span>
                    <span>•</span>
                    <span>{selectedDriver.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getScoreColor(selectedDriver.overallAiScore)}`}>
                    {selectedDriver.overallAiScore}
                  </div>
                  <div className="text-sm font-semibold text-gray-500 mt-2 uppercase tracking-wide">Overall AI Match</div>
                </div>
              </div>

              {/* Documents Grid */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Identity & Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {selectedDriver.documents.map((doc, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 relative group cursor-pointer flex items-center justify-center text-gray-400">
                       {/* Mock placeholder for image */}
                       <span className="text-sm">Click to view doc</span>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{doc.name}</span>
                        {doc.aiScore && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getScoreColor(doc.aiScore)}`}>
                            {doc.aiScore}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {doc.status === 'VERIFIED' && <FaCheckCircle className="text-green-500" />}
                        {doc.status === 'PENDING' && <FaExclamationTriangle className="text-amber-500" />}
                        {doc.status === 'REJECTED' && <FaTimesCircle className="text-red-500" />}
                        <span className="text-gray-600 dark:text-gray-400">{doc.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vehicle Info */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedDriver.vehicle.make} {selectedDriver.vehicle.model}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-gray-800 dark:text-gray-200 font-bold tracking-widest">{selectedDriver.vehicle.plate}</span>
                    {selectedDriver.vehicle.allowCoDriver && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">CO-DRIVER ALLOWED</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Vehicle AI Verification</div>
                  {selectedDriver.vehicle.aiVerified 
                    ? <span className="text-green-600 font-bold flex items-center gap-1 justify-end"><FaCheckCircle /> Verified</span>
                    : <span className="text-red-600 font-bold flex items-center gap-1 justify-end"><FaTimesCircle /> Failed/Pending</span>}
                </div>
              </div>

              {/* Action Bar */}
              {selectedDriver.status !== 'APPROVED' && selectedDriver.status !== 'REJECTED' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex gap-4">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2"
                  >
                    <FaCheckCircle /> Approve Registration
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2"
                  >
                    <FaTimesCircle /> Reject & Require Action
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <FaUser className="text-6xl mb-4 text-gray-300 dark:text-gray-700" />
               <p className="text-xl font-medium text-gray-500">Select an application to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assign Service Category</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              You are approving {selectedDriver?.name}. As an admin, you must strictly assign the vehicle category before completing approval.
            </p>
            
            <div className="space-y-4 mb-8">
              {['Standard', 'PSV (Matatu)', 'Premium', 'Boda Boda', 'Delivery'].map(cat => (
                <label key={cat} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selectedCategory === cat ? 'bg-cyan-50 border-cyan-500 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}`}>
                  <input type="radio" name="category" value={cat} checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="h-5 w-5 text-cyan-600" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">{cat}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowApproveModal(false)} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl flex-1">Cancel</button>
              <button 
                onClick={handleApproveSubmit} 
                disabled={!selectedCategory}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-red-600">Reject Application</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Please specify the precise reason for rejecting {selectedDriver?.name}'s application. This will be sent directly to the driver to request corrections.
            </p>
            
            <textarea
              rows={4}
              placeholder="e.g. The driving license photo is blurred and unreadable. Please upload a clear photo."
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 mb-8 dark:bg-gray-700 dark:text-white resize-none"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex gap-4">
              <button onClick={() => {setShowRejectModal(false); setRejectionReason('');}} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl flex-1">Cancel</button>
              <button 
                onClick={handleRejectSubmit} 
                disabled={!rejectionReason.trim()}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};