import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRobot, FaUser } from 'react-icons/fa';
import { Search } from 'lucide-react';
import apiClient from '../services/apiClient';
import { PageHeader } from './common/PageHeader';

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
        const res = await apiClient.get('/admin/approvals/registrations');
        const data = res.data;
        setRegistrations(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load apps:', err);
      }
    };
    fetchApps();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30';
    if (score >= 70) return 'text-amber-400 bg-amber-500/15 border border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border border-rose-500/30';
  };

  const getStatusBadge = (status: string, score: number) => {
    if (status === 'APPROVED') return <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">APPROVED</span>;
    if (status === 'REJECTED') return <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded text-xs font-bold">REJECTED</span>;
    if (score >= 90) return <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded text-xs font-bold flex items-center gap-1"><FaRobot /> AUTO-APPROVE READY</span>;
    if (score >= 70) return <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded text-xs font-bold flex items-center gap-1"><FaUser /> MANUAL REVIEW</span>;
    return <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded text-xs font-bold flex items-center gap-1"><FaRobot /> AUTO-REJECT</span>;
  };

  const handleApproveSubmit = () => {
    if (!selectedDriver || !selectedCategory) return;
    
    setRegistrations(prev => prev.map(d => 
      d.id === selectedDriver.id ? { ...d, status: 'APPROVED', vehicle: { ...d.vehicle, serviceCategory: selectedCategory } } : d
    ));
    setShowApproveModal(false);
    setSelectedDriver(null);
    setSelectedCategory('');
  };

  const handleRejectSubmit = () => {
    if (!selectedDriver || !rejectionReason.trim()) return;

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
    <div className="space-y-4">
      <PageHeader
        category="Fleet & People"
        title="Driver Registration Approvals"
        subtitle="AI-assisted document verification, background compliance, and manual application adjudication."
        icon={<FaRobot className="text-amber-500 text-xl" />}
      />

      <div className="h-[calc(100vh-210px)] flex bg-[#0B0E17] border border-white/10 rounded-[3px] overflow-hidden">
        {/* Left Sidebar - List */}
        <div className="w-1/3 bg-[#131722] border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-bold text-white mb-3">Pending Registrations</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name, ID, or plate..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-[3px] focus:outline-none bg-[#0a0a0a] text-white placeholder-slate-500 text-xs"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredRegistrations.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className={`p-4 border-b border-white/[0.04] cursor-pointer transition-colors ${selectedDriver?.id === driver.id ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-white/[0.03] border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{driver.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{driver.id}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-[3px] font-bold text-xs ${getScoreColor(driver.overallAiScore)}`}>
                    {driver.overallAiScore}% AI
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  {getStatusBadge(driver.status, driver.overallAiScore)}
                  <span className="text-xs text-slate-500">{new Date(driver.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {filteredRegistrations.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">No registrations found.</div>
            )}
          </div>
        </div>

        {/* Right Content - Details */}
        <div className="w-2/3 bg-[#0a0a0a] flex flex-col overflow-y-auto">
          {selectedDriver ? (
            <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start bg-[#131722] p-5 rounded-[3px] shadow-sm border border-white/10">
                <div>
                  <h1 className="text-xl font-bold text-white">{selectedDriver.name}</h1>
                  <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-xs">
                    <span>{selectedDriver.email}</span>
                    <span>•</span>
                    <span>{selectedDriver.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-[3px] text-lg font-bold ${getScoreColor(selectedDriver.overallAiScore)}`}>
                    {selectedDriver.overallAiScore}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Overall AI Match</div>
                </div>
              </div>

              {/* Documents Grid */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Identity & Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDriver.documents.map((doc, idx) => (
                    <div key={idx} className="bg-[#131722] rounded-[3px] overflow-hidden shadow-sm border border-white/10">
                      <div className="h-28 bg-[#0a0a0a] relative group cursor-pointer flex items-center justify-center text-slate-500 hover:text-amber-500 transition-colors">
                         <span className="text-xs font-medium">Click to view document</span>
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-white text-xs truncate">{doc.name}</span>
                          {doc.aiScore && (
                            <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold ${getScoreColor(doc.aiScore)}`}>
                              {doc.aiScore}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          {doc.status === 'VERIFIED' && <FaCheckCircle className="text-emerald-400 text-xs" />}
                          {doc.status === 'PENDING' && <FaExclamationTriangle className="text-amber-400 text-xs" />}
                          {doc.status === 'REJECTED' && <FaTimesCircle className="text-rose-400 text-xs" />}
                          <span className="text-slate-400 text-xs">{doc.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Vehicle Details</h3>
                <div className="bg-[#131722] rounded-[3px] p-5 shadow-sm border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedDriver.vehicle.make} {selectedDriver.vehicle.model}</h4>
                    <div className="flex items-center gap-2.5 mt-2">
                      <span className="font-mono bg-[#0a0a0a] border border-white/10 px-2.5 py-0.5 rounded-[3px] text-amber-400 font-bold tracking-widest text-xs">{selectedDriver.vehicle.plate}</span>
                      {selectedDriver.vehicle.allowCoDriver && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-[3px] text-[10px] font-bold">CO-DRIVER ALLOWED</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 mb-1">Vehicle AI Verification</div>
                    {selectedDriver.vehicle.aiVerified 
                      ? <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 justify-end"><FaCheckCircle /> Verified</span>
                      : <span className="text-rose-400 font-bold text-xs flex items-center gap-1 justify-end"><FaTimesCircle /> Failed/Pending</span>}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {selectedDriver.status !== 'APPROVED' && selectedDriver.status !== 'REJECTED' && (
                <div className="bg-[#131722] rounded-[3px] p-4 shadow-sm border border-white/10 flex gap-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-2.5 rounded-[3px] transition-all text-xs flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <FaCheckCircle /> Approve Registration
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-[3px] transition-all text-xs flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <FaTimesCircle /> Reject & Require Action
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <FaUser className="text-5xl mb-4 text-slate-700" />
               <p className="text-sm font-medium text-slate-400">Select an application to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131722] p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Assign Service Category</h2>
            <p className="text-slate-400 mb-6 text-sm">
              You are approving {selectedDriver?.name}. As an admin, you must strictly assign the vehicle category before completing approval.
            </p>
            
            <div className="space-y-3 mb-8">
              {['Standard', 'PSV (Matatu)', 'Premium', 'Boda Boda', 'Delivery'].map(cat => (
                <label key={cat} className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-colors ${selectedCategory === cat ? 'bg-amber-500/10 border-amber-500 text-white' : 'border-white/10 hover:bg-white/[0.03] text-slate-300'}`}>
                  <input type="radio" name="category" value={cat} checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="h-4 w-4 text-amber-500 accent-amber-500" />
                  <span className="ml-3 font-semibold text-sm">{cat}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowApproveModal(false)} className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold rounded-xl flex-1 text-sm transition-colors">Cancel</button>
              <button 
                onClick={handleApproveSubmit} 
                disabled={!selectedCategory}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/20"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131722] p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Reject Application</h2>
            <p className="text-slate-400 mb-6 text-sm">
              Please specify the precise reason for rejecting {selectedDriver?.name}'s application. This will be sent directly to the driver to request corrections.
            </p>
            
            <textarea
              rows={4}
              placeholder="e.g. The driving license photo is blurred and unreadable. Please upload a clear photo."
              className="w-full p-4 border border-white/10 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none mb-6 bg-white/[0.03] text-white placeholder-slate-500 resize-none text-sm"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex gap-4">
              <button onClick={() => {setShowRejectModal(false); setRejectionReason('');}} className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold rounded-xl flex-1 text-sm transition-colors">Cancel</button>
              <button 
                onClick={handleRejectSubmit} 
                disabled={!rejectionReason.trim()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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