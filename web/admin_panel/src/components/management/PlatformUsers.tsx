import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users } from 'lucide-react';
import { adminService, PlatformUser } from '../../services/adminService';
import { UserPaymentHistory } from '../users/UserPaymentHistory';
import { UserDetails } from '../users/UserDetails';
import { PageHeader } from '../common/PageHeader';

export const UserManagementDashboard: React.FC = () => {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [viewingPaymentsFor, setViewingPaymentsFor] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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
            />

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
    </div>
    );
};
