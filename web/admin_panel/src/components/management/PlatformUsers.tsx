import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, UserPlus, UserCog, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService, PlatformUser } from '../../services/adminService';
import { UserPaymentHistory } from '../users/UserPaymentHistory';
import { UserDetails } from '../users/UserDetails';
import { PageHeader } from '../common/PageHeader';
import { UserAccessTabs } from './UserAccessTabs';

export const UserManagementDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [viewingPaymentsFor, setViewingPaymentsFor] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Provision Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserType, setNewUserType] = useState<'DRIVER' | 'PASSENGER'>('PASSENGER');
    const [newUserPhone, setNewUserPhone] = useState('');
    const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // In a real app, pass searchTerm to backend
            const data = await adminService.getPlatformUsers();

            // Client-side filtering for mock data
            const filtered = searchTerm
                ? data.filter(u =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                : data;

            setUsers(filtered);
        } catch (error) {
            console.error('Failed to fetch platform users', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(users.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const toggleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUserIds(prev => [...prev, userId]);
        } else {
            setSelectedUserIds(prev => prev.filter(id => id !== userId));
        }
    };

    const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
        if (selectedUserIds.length === 0) return;
        if (!confirm(`Are you sure you want to ${action} ${selectedUserIds.length} users?`)) return;

        setIsBulkProcessing(true);
        // Mock API call
        console.log(`Performing bulk ${action} on:`, selectedUserIds);
        await new Promise(r => setTimeout(r, 1000));
        setIsBulkProcessing(false);
        setSelectedUserIds([]);
        alert(`Bulk ${action} complete!`);
        // refresh list
        fetchUsers();
    };

    const handleCreatePlatformUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName.trim() || !newUserEmail.trim()) return;
        setIsSubmittingNewUser(true);
        try {
            await adminService.createPlatformUser({
                name: newUserName.trim(),
                email: newUserEmail.trim(),
                type: newUserType,
                phone: newUserPhone.trim() || undefined
            });
            setIsAddModalOpen(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPhone('');
            fetchUsers();
        } catch (err) {
            console.error('Failed to create user', err);
            alert('Failed to create user');
        } finally {
            setIsSubmittingNewUser(false);
        }
    };

    if (viewingPaymentsFor) {
        return (
            <UserPaymentHistory
                userId={viewingPaymentsFor}
                onBack={() => setViewingPaymentsFor(null)}
            />
        );
    }

    if (selectedUser) {
        return (
            <UserDetails
                userId={selectedUser.id}
                userName={selectedUser.name}
                onBack={() => setSelectedUser(null)}
                onShowPayments={() => setViewingPaymentsFor(selectedUser.id)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                category="Fleet & People"
                title="All Platform Users"
                subtitle="Directory of registered riders, drivers, and corporate accounts."
                icon={<Users className="w-6 h-6 text-amber-500" />}
                badge={
                    <span className="px-2.5 py-1 rounded-[3px] bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                        {users.length} Users
                    </span>
                }
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => navigate('/roles/new')}
                            className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Create a new system role with custom permissions"
                        >
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <span>Create Role</span>
                        </button>
                        <button
                            onClick={() => navigate('/users?new=true')}
                            className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Create an administrator or operator account"
                        >
                            <UserCog className="w-4 h-4 text-amber-500" />
                            <span>Create Admin User</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-[4px] cursor-pointer"
                            title="Add a new platform rider or driver"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>+ Provision Platform User</span>
                        </button>
                    </div>
                }
            />

            <UserAccessTabs activeTab="platform-users" />

            <div className="bg-[#131722] shadow-sm rounded-[4px] border border-white/10 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User Directory</h2>

                    {selectedUserIds.length > 0 ? (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-[3px]">
                            <span className="text-xs font-semibold text-amber-400">{selectedUserIds.length} Selected</span>
                            <div className="h-4 w-px bg-amber-500/30"></div>
                            <select
                                onChange={(e) => handleBulkAction(e.target.value as any)}
                                className="bg-[#0a0a0a] border border-white/10 text-xs rounded-[3px] px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                defaultValue=""
                            >
                                <option value="" disabled>Bulk Actions...</option>
                                <option value="suspend">Suspend Selected</option>
                                <option value="activate">Activate Selected</option>
                                <option value="delete">Delete Selected</option>
                            </select>
                        </div>
                    ) : (
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '2.75rem' }}
                                className="w-full !pl-11 pr-3 py-1.5 border border-white/10 rounded-[3px] focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#0a0a0a] text-white placeholder-slate-500 text-xs"
                            />
                        </div>
                    )}
                </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-surface-dark">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    checked={users.length > 0 && selectedUserIds.length === users.length}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Registered</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
                        {loading || isBulkProcessing ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 bg-white dark:bg-slate-700"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={(e) => toggleSelectUser(user.id, e.target.checked)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                                    <button onClick={() => setSelectedUser(user)} className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400 font-medium text-left">
                                        {user.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.type === 'DRIVER' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                        {user.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(user.registrationDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedUser(user)} className="text-amber-600 hover:text-amber-900">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    No users found matching "{searchTerm}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Provision Platform User Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#131722] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Provision Platform User</h3>
                                <p className="text-xs text-slate-400">Register a new rider or driver account</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreatePlatformUser} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewUserType('PASSENGER')}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                                        newUserType === 'PASSENGER'
                                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                                    }`}
                                >
                                    Passenger / Rider
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewUserType('DRIVER')}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                                        newUserType === 'DRIVER'
                                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                                    }`}
                                >
                                    Driver
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Full Name <span className="text-amber-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Samuel Kamau"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Email Address <span className="text-amber-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="e.g. samuel.kamau@cabi.africa"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                placeholder="e.g. +254 758 777 222"
                                value={newUserPhone}
                                onChange={(e) => setNewUserPhone(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingNewUser || !newUserName.trim() || !newUserEmail.trim()}
                                className="btn-primary px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                                {isSubmittingNewUser ? 'Provisioning...' : 'Provision User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
    );
};
