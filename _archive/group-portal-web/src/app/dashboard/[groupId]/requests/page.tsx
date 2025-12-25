'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function RequestsPage() {
    const params = useParams();
    const groupId = params.groupId as string;

    // Mock Data
    const [requests, setRequests] = useState([
        { id: 'u4', name: 'Peter Otieno', email: 'peter@example.com', requestedAt: '2024-05-18T14:30:00Z' },
        { id: 'u5', name: 'Lucy Wanjiku', email: 'lucy@example.com', requestedAt: '2024-05-19T09:15:00Z' }
    ]);

    const handleAction = (userId: string, action: 'APPROVE' | 'REJECT') => {
        // Mock API call
        if (action === 'APPROVE') {
            alert(`Approved ${userId}`);
        } else {
            alert(`Rejected ${userId}`);
        }
        setRequests(requests.filter(r => r.id !== userId));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Group Portal</h1>
                </div>
                <nav className="mt-6 px-6 space-y-2">
                    <Link href={`/dashboard/${groupId}`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Overview
                    </Link>
                    <Link href={`/dashboard/${groupId}/requests`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                        Join Requests
                    </Link>
                    <Link href={`/dashboard/${groupId}/activities`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Activities
                    </Link>
                    <Link href={`/dashboard/${groupId}/management`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Leadership Management
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Membership Requests</h2>
                        <p className="text-gray-600 mb-8">
                            Review and approve drivers who want to join your organization.
                        </p>

                        {requests.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No pending requests at this time.</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {requests.map((req) => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{req.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{req.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                    {new Date(req.requestedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'APPROVE')}
                                                        className="text-green-600 hover:text-green-900 font-semibold"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, 'REJECT')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
