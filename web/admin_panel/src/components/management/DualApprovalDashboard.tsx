import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';
import { useAuthContext } from '../../AuthContext';
import { PageHeader } from '../common/PageHeader';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    UserCheck,
    AlertOctagon,
    FileText,
    KeyRound
} from 'lucide-react';

interface DualApprovalRequest {
    id: string;
    actionType: string;
    targetId: string;
    targetDescription?: string;
    payload: any;
    requestedById: string;
    requestedByEmail: string;
    requestedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BREAK_GLASS_EXECUTED';
    approvedById?: string;
    approvedByEmail?: string;
    approvedAt?: string;
    rejectionReason?: string;
    breakGlassJustification?: string;
    breakGlassExecutedAt?: string;
}

export const DualApprovalDashboard: React.FC = () => {
    const { user } = useAuthContext();
    const [requests, setRequests] = useState<DualApprovalRequest[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('PENDING');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Reject Modal State
    const [rejectModalReq, setRejectModalReq] = useState<DualApprovalRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Break-Glass Modal State
    const [breakGlassReq, setBreakGlassReq] = useState<DualApprovalRequest | null>(null);
    const [justification, setJustification] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setFeedback(null);
        try {
            const url = filterStatus === 'ALL' ? '/admin/dual-approvals' : `/admin/dual-approvals?status=${filterStatus}`;
            const res = await apiClient.get(url);
            setRequests(res.data || []);
        } catch (err: any) {
            console.error('Failed to fetch approvals:', err);
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load approval queue.' });
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        setFeedback(null);
        try {
            await apiClient.post(`/admin/dual-approvals/${id}/approve`, {});
            setFeedback({ type: 'success', message: `Proposal ${id} successfully approved and executed.` });
            await fetchRequests();
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Approval failed.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectModalReq) return;
        setActionLoading(rejectModalReq.id);
        try {
            await apiClient.post(`/admin/dual-approvals/${rejectModalReq.id}/reject`, { reason: rejectReason });
            setFeedback({ type: 'success', message: `Proposal ${rejectModalReq.id} rejected.` });
            setRejectModalReq(null);
            setRejectReason('');
            await fetchRequests();
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Rejection failed.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleBreakGlassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!breakGlassReq) return;
        setActionLoading(breakGlassReq.id);
        try {
            await apiClient.post(`/admin/dual-approvals/${breakGlassReq.id}/break-glass`, {
                justification,
                otpCode
            });
            setFeedback({ type: 'success', message: `🚨 Emergency Break-Glass override executed for ${breakGlassReq.id}. Emergency telemetry alert broadcast.` });
            setBreakGlassReq(null);
            setJustification('');
            setOtpCode('');
            await fetchRequests();
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Break-Glass execution failed.' });
        } finally {
            setActionLoading(null);
        }
    };

    const isSuperAdmin = (user?.role as string)?.toUpperCase() === 'SUPER_ADMIN';

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in text-white selection:bg-amber-500 selection:text-black">
            {/* Header */}
            <PageHeader
                category="Fleet & People"
                title="Four-Eyes Dual-Authorization Queue"
                subtitle="Institutional governance: High-risk Tier-1 operational actions require two independent operator approvals"
                icon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
                action={
                    <button
                        onClick={fetchRequests}
                        disabled={loading}
                        className="btn-secondary flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Queue</span>
                    </button>
                }
            />

            {/* Notification Alert */}
            {feedback && (
                <div
                    className={`p-3 rounded-[3px] text-xs flex items-start gap-2.5 border animate-fade-in ${
                        feedback.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                >
                    {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Status Filter Tabs - Gamification Gold Pill style */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                {['PENDING', 'APPROVED', 'REJECTED', 'BREAK_GLASS_EXECUTED', 'ALL'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`transition-all cursor-pointer whitespace-nowrap ${
                            filterStatus === status
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20 font-bold border-amber-500 rounded-[3px] px-3.5 py-1.5 text-xs'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-1.5 text-xs font-semibold'
                        }`}
                    >
                        {status.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="bg-[#131722] border border-white/10 rounded-[3px] overflow-hidden shadow-2xl">
                {loading && requests.length === 0 ? (
                    <div className="py-20 text-center text-xs text-gray-400">Loading dual-approval proposals...</div>
                ) : requests.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                        <p className="font-semibold text-white text-xs">No {filterStatus} proposals in queue</p>
                        <p className="text-[11px] text-gray-500">All high-risk operational proposals are currently resolved.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0a0a0a] border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5">ID / Action</th>
                                    <th className="px-5 py-3.5">Proposed By</th>
                                    <th className="px-5 py-3.5">Target / Payload</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Resolution Details</th>
                                    <th className="px-5 py-3.5 text-right">Four-Eyes Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {requests.map((req) => {
                                    const isRequester = req.requestedById === user?.id;
                                    const isPending = req.status === 'PENDING';

                                    return (
                                        <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-mono text-brand-yellow font-bold">{req.id}</div>
                                                <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                                    {req.actionType}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-white font-medium">{req.requestedByEmail}</div>
                                                <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(req.requestedAt).toLocaleString()}</span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-gray-200 font-medium">{req.targetDescription}</div>
                                                <div className="font-mono text-gray-500 text-[10px] truncate max-w-xs mt-0.5">
                                                    {JSON.stringify(req.payload)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                                        req.status === 'APPROVED'
                                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                            : req.status === 'REJECTED'
                                                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                                            : req.status === 'BREAK_GLASS_EXECUTED'
                                                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                                                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                                    }`}
                                                >
                                                    {req.status === 'BREAK_GLASS_EXECUTED' ? '🚨 BREAK-GLASS' : req.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-gray-400">
                                                {req.approvedByEmail && (
                                                    <div>
                                                        <span className="text-gray-500">Authorized by: </span>
                                                        <span className="text-white font-medium">{req.approvedByEmail}</span>
                                                    </div>
                                                )}
                                                {req.rejectionReason && (
                                                    <div className="text-red-400">
                                                        <span className="text-gray-500">Reason: </span>
                                                        {req.rejectionReason}
                                                    </div>
                                                )}
                                                {req.breakGlassJustification && (
                                                    <div className="text-rose-300 text-[11px] italic">
                                                        "{req.breakGlassJustification}"
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                {isPending ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Approve Button */}
                                                        <button
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={actionLoading === req.id || isRequester}
                                                            title={isRequester ? 'Four-Eyes Principle: You cannot approve your own proposal' : 'Approve proposal as second operator'}
                                                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <UserCheck className="w-3.5 h-3.5" />
                                                            <span>Approve</span>
                                                        </button>

                                                        {/* Reject Button */}
                                                        <button
                                                            onClick={() => setRejectModalReq(req)}
                                                            disabled={actionLoading === req.id}
                                                            className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Reject</span>
                                                        </button>

                                                        {/* Break-Glass Button for Super Admin */}
                                                        {isSuperAdmin && (
                                                            <button
                                                                onClick={() => setBreakGlassReq(req)}
                                                                disabled={actionLoading === req.id}
                                                                title="Execute Solo Emergency Override (Break-Glass Protocol)"
                                                                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <AlertOctagon className="w-3.5 h-3.5" />
                                                                <span>Break-Glass</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-[11px]">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ===================== REJECT MODAL ===================== */}
            {rejectModalReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#131722] border border-white/10 rounded-[3px] p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 text-red-400 mb-4">
                            <XCircle className="w-5 h-5" />
                            <h3 className="text-base font-bold text-white">Decline High-Risk Proposal</h3>
                        </div>
                        <p className="text-xs text-gray-300 mb-4">
                            You are rejecting proposal <span className="font-mono text-amber-500 font-bold">{rejectModalReq.id}</span> ({rejectModalReq.actionType}). Provide a reason for the audit trail:
                        </p>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="State reason for declining this action..."
                                className="w-full h-24 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-white text-xs outline-none focus:border-red-500 transition-all resize-none"
                                required
                            />
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalReq(null)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!rejectReason.trim()}
                                    className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-[3px] text-xs font-semibold transition-all cursor-pointer"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================== BREAK-GLASS EMERGENCY MODAL ===================== */}
            {breakGlassReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[#131722] border border-red-500/50 rounded-[3px] p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center gap-3 text-red-500 mb-3">
                            <AlertOctagon className="w-6 h-6 animate-pulse" />
                            <div>
                                <h3 className="text-base font-bold text-white">Emergency Break-Glass Execution</h3>
                                <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">High-Priority Security Override</p>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-[3px] text-xs text-red-300 space-y-1 mb-4">
                            <p className="font-bold">⚠️ Notice to Super Administrator:</p>
                            <p>
                                Executing Break-Glass bypasses second operator authorization for proposal <span className="font-mono text-white font-bold">{breakGlassReq.id}</span>. An urgent incident alert will immediately be broadcast to all system owners via SMS & Email.
                            </p>
                        </div>

                        <form onSubmit={handleBreakGlassSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                    Operational Justification (Min 20 Characters)
                                </label>
                                <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Explain the critical incident or emergency necessitating solo execution..."
                                    className="w-full h-24 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-white text-xs outline-none focus:border-amber-500 transition-all resize-none"
                                    required
                                    minLength={20}
                                />
                                <span className="text-[10px] text-gray-500">
                                    {justification.length}/20 minimum characters
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Step-Up 2FA Security PIN</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter your 6-digit OTP"
                                    className="w-full tracking-widest font-mono text-center text-base py-2 px-3 bg-[#0a0a0a] border border-amber-500/40 rounded-[3px] focus:border-amber-500 text-white outline-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setBreakGlassReq(null)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={justification.trim().length < 20 || otpCode.length < 6}
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-[3px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <AlertOctagon className="w-3.5 h-3.5" />
                                    <span>Execute Break-Glass</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DualApprovalDashboard;
