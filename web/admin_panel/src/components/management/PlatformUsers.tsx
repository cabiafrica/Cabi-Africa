import React, { useState, useEffect, useCallback } from 'react';
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>

                {selectedUserIds.length > 0 ? (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded">
                        <span className="text-sm font-medium text-blue-800">{selectedUserIds.length} Selected</span>
                        <div className="h-4 w-px bg-blue-200"></div>
                        <select
                            onChange={(e) => handleBulkAction(e.target.value as any)}
                            className="bg-white border border-blue-200 text-sm rounded shadow-sm focus:outline-none"
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
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={users.length > 0 && selectedUserIds.length === users.length}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">Registered</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading || isBulkProcessing ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={(e) => toggleSelectUser(user.id, e.target.checked)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <button onClick={() => setSelectedUser(user)} className="text-blue-600 hover:text-blue-900 font-medium text-left">
                                        {user.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.type === 'DRIVER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.registrationDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedUser(user)} className="text-blue-600 hover:text-blue-900">
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
