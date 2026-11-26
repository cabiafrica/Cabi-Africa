import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { adminService, PlatformUser } from '../../services/adminService';
import { UserPaymentHistory } from '../users/UserPaymentHistory';
import { UserDetails } from '../users/UserDetails';

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
        <div className="bg-white dark:bg-card-dark shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-surface-dark">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">User Management</h2>

                {selectedUserIds.length > 0 ? (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded">
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{selectedUserIds.length} Selected</span>
                        <div className="h-4 w-px bg-amber-200 dark:bg-amber-700"></div>
                        <select
                            onChange={(e) => handleBulkAction(e.target.value as any)}
                            className="bg-white dark:bg-card-dark border border-amber-200 dark:border-amber-700/50 text-sm rounded shadow-sm focus:outline-none text-slate-900 dark:text-slate-100"
                            defaultValue=""
                        >
                            <option value="" disabled>Bulk Actions...</option>
                            <option value="suspend">Suspend Selected</option>
                            <option value="activate">Activate Selected</option>
                            <option value="delete">Delete Selected</option>
                        </select>
                    </div>
                ) : (
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white dark:bg-[#131722] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
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
    );
};
