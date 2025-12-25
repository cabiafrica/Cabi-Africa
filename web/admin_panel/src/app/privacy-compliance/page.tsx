import React, { useState } from 'react';

export default function PrivacyCompliancePage() {
    const [requests, setRequests] = useState([
        {
            id: 'export_1',
            type: 'DATA_EXPORT',
            userId: 'user_123',
            userName: 'Alice Johnson',
            userEmail: 'alice@example.com',
            status: 'COMPLETED',
            requestedAt: '2024-12-10',
            completedAt: '2024-12-11',
        },
        {
            id: 'deletion_1',
            type: 'ACCOUNT_DELETION',
            userId: 'user_456',
            userName: 'Bob Smith',
            userEmail: 'bob@example.com',
            status: 'PENDING',
            requestedAt: '2024-12-12',
            scheduledFor: '2025-01-11',
        },
        {
            id: 'export_2',
            type: 'DATA_EXPORT',
            userId: 'user_789',
            userName: 'Charlie Brown',
            userEmail: 'charlie@example.com',
            status: 'PROCESSING',
            requestedAt: '2024-12-13',
        },
    ]);

    const [filter, setFilter] = useState('all');

    const filteredRequests = requests.filter(r => filter === 'all' || r.type === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        return type === 'DATA_EXPORT' ? '📥' : '🗑️';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Privacy & Compliance</h1>
                    <p className="text-gray-600">Monitor GDPR/CCPA data requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Total Requests</h3>
                    <p className="text-3xl font-bold">{requests.length}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Data Exports</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {requests.filter(r => r.type === 'DATA_EXPORT').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Deletions</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {requests.filter(r => r.type === 'ACCOUNT_DELETION').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {requests.filter(r => r.status === 'PENDING').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        All Requests
                    </button>
                    <button
                        onClick={() => setFilter('DATA_EXPORT')}
                        className={`px-4 py-2 rounded ${filter === 'DATA_EXPORT' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Data Exports
                    </button>
                    <button
                        onClick={() => setFilter('ACCOUNT_DELETION')}
                        className={`px-4 py-2 rounded ${filter === 'ACCOUNT_DELETION' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Account Deletions
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded shadow">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">User</th>
                            <th className="p-3 text-left">Requested</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Details</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map((request) => (
                            <tr key={request.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getTypeIcon(request.type)}</span>
                                        <span className="font-medium">
                                            {request.type === 'DATA_EXPORT' ? 'Data Export' : 'Account Deletion'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div>
                                        <div className="font-medium">{request.userName}</div>
                                        <div className="text-sm text-gray-600">{request.userEmail}</div>
                                    </div>
                                </td>
                                <td className="p-3">{request.requestedAt}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="p-3 text-sm">
                                    {request.completedAt && <div>Completed: {request.completedAt}</div>}
                                    {request.scheduledFor && <div>Scheduled: {request.scheduledFor}</div>}
                                </td>
                                <td className="p-3">
                                    <button className="text-blue-600 hover:underline text-sm mr-3">
                                        View Details
                                    </button>
                                    {request.type === 'ACCOUNT_DELETION' && request.status === 'PENDING' && (
                                        <button className="text-red-600 hover:underline text-sm">
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Compliance Info */}
            <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-bold mb-2">📋 Compliance Notes</h3>
                <ul className="text-sm space-y-1">
                    <li>• GDPR requires data export within 30 days</li>
                    <li>• CCPA requires data export within 45 days</li>
                    <li>• Account deletions have a 30-day grace period</li>
                    <li>• Financial records are anonymized, not deleted (legal requirement)</li>
                </ul>
            </div>
        </div>
    );
}
