import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { UserPaymentHistory } from './UserPaymentHistory';
import { UserAuditLog } from './UserAuditLog';
import { DriverDownlineTree } from '../drivers/DriverDownlineTree';
import { UserDocuments } from './UserDocuments';

interface UserDetailsProps {
    userId: string;
    userName?: string;
    onBack?: () => void;
    onShowPayments?: () => void; // Deprecated prop, kept for compatibility if needed, but we'll use internal tabs now
}

export const UserDetails: React.FC<UserDetailsProps> = ({ userId, onBack }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [impersonating, setImpersonating] = useState(false);
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'PAYMENTS' | 'AUDIT' | 'DOCUMENTS' | 'DOWNLINE'>('DETAILS');
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Reset tab on ID change? No, keep logic simple.
        adminService.getUserDetails(userId).then(u => {
            setUser(u);
            setLoading(false);
        });
    }, [userId]);

    const handleImpersonate = async () => {
        if (!confirm(`Are you sure you want to log in as ${user.name}? This action will be logged.`)) return;

        setImpersonating(true);
        try {
            const token = await adminService.impersonateUser(userId);
            alert(`Impersonation Token Generated: ${token}\n\nIn a real app, this would redirect you to the main app with this token.`);
        } catch (e) {
            alert('Impersonation failed');
        } finally {
            setImpersonating(false);
        }
    };

    const handleToggleStatus = async () => {
        setProcessing(true);
        try {
            if (user.status === 'ACTIVE') {
                await adminService.suspendUser(userId, suspendReason);
            } else {
                await adminService.reactivateUser(userId);
            }
            alert(`User ${user.status === 'ACTIVE' ? 'suspended' : 'activated'} successfully.`);

            // Refresh user details
            const updatedUser = await adminService.getUserDetails(userId);
            setUser(updatedUser);
            setShowSuspendModal(false);
            setSuspendReason('');
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-6">Loading user details...</div>;
    if (!user) return <div className="p-6 text-red-500">User not found</div>;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.type === 'DRIVER' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {user.type}
                    </span>
                </div>

                <div className="flex gap-2">
                    {/* Story 79.3: Impersonation Button */}
                    <button
                        onClick={handleImpersonate}
                        disabled={impersonating}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded shadow flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                        {impersonating ? 'Starting Session...' : '🕵️ Login as User'}
                    </button>

                    <button
                        onClick={() => setShowSuspendModal(true)}
                        className={`px-3 py-1.5 rounded shadow text-sm text-white ${user.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                    </button>
                </div>
            </div>

            {showSuspendModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">
                            {user.status === 'ACTIVE' ? 'Suspend User Account' : 'Activate User Account'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {user.status === 'ACTIVE'
                                ? 'Are you sure you want to suspend this user? They will not be able to log in or take rides.'
                                : 'Are you sure you want to activate this user? They will regain full access to the platform.'}
                        </p>

                        {user.status === 'ACTIVE' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Suspension (Required)</label>
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    rows={3}
                                    placeholder="e.g. Violation of terms, Safety incident #"
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                disabled={processing || (user.status === 'ACTIVE' && !suspendReason.trim())}
                                className={`px-4 py-2 rounded text-white font-medium ${user.status === 'ACTIVE'
                                    ? 'bg-red-600 hover:bg-red-700 disabled:opacity-50'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {processing ? 'Processing...' : (user.status === 'ACTIVE' ? 'Confirm Suspension' : 'Confirm Activation')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('DETAILS')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'DETAILS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab('PAYMENTS')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'PAYMENTS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Payment History
                    </button>
                    {user.type === 'DRIVER' && (
                        <button
                            onClick={() => setActiveTab('DOCUMENTS')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'DOCUMENTS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Documents
                        </button>
                    )}
                    {user.type === 'DRIVER' && (
                        <button
                            onClick={() => setActiveTab('DOWNLINE')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'DOWNLINE' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Downline & Referral
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('AUDIT')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'AUDIT' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Audit Log
                    </button>
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'DETAILS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500">Email:</span>
                                    <span className="col-span-2 font-medium">{user.email}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="col-span-2 font-medium">{user.phone}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500">Status:</span>
                                    <span className="col-span-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.status}
                                        </span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500">Joined:</span>
                                    <span className="col-span-2 font-medium">{user.joined}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">Activity Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded border">
                                    <div className="text-gray-500 text-xs uppercase">Total Rides</div>
                                    <div className="text-2xl font-bold">{user.rides}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded border">
                                    <div className="text-gray-500 text-xs uppercase">Rating</div>
                                    <div className="text-2xl font-bold">{user.rating} ★</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded border">
                                    <div className="text-gray-500 text-xs uppercase">Wallet Balance</div>
                                    <div className="text-2xl font-bold text-green-600">KES {user.balance?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'PAYMENTS' && <UserPaymentHistory userId={userId} onBack={() => setActiveTab('DETAILS')} />}

                {activeTab === 'DOCUMENTS' && <UserDocuments userId={userId} />}

                {activeTab === 'DOWNLINE' && user.type === 'DRIVER' && <DriverDownlineTree driverId={userId} />}

                {activeTab === 'AUDIT' && <UserAuditLog userId={userId} />}
            </div>
        </div>
    );
};
