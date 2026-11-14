'use client';

import { useState, useEffect } from 'react';

interface AuditLogEntry {
    id: string;
    field: string;
    oldValue: string;
    newValue: string;
    timestamp: string;
    changedBy: string;
}

export default function UserProfileHistoryPage({ params }: { params: { userId: string } }) {
    const [history, setHistory] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock API call
        const fetchHistory = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setHistory([
                {
                    id: '1',
                    field: 'Phone Number',
                    oldValue: '+1 (555) 123-4567',
                    newValue: '+1 (555) 987-6543',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                    changedBy: 'User',
                },
                {
                    id: '2',
                    field: 'Profile Picture',
                    oldValue: 'https://example.com/old.jpg',
                    newValue: 'https://example.com/new.jpg',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                    changedBy: 'User',
                },
                {
                    id: '3',
                    field: 'Email',
                    oldValue: 'jane.doe@example.com',
                    newValue: 'jane.smith@example.com',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                    changedBy: 'Admin (Support)',
                },
                {
                    id: '4',
                    field: 'Last Name',
                    oldValue: 'Doe',
                    newValue: 'Smith',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString(),
                    changedBy: 'User',
                },
            ]);
            setIsLoading(false);
        };

        fetchHistory();
    }, [params.userId]);

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Profile History</h1>
                    <p className="text-gray-600">Audit log for User ID: {params.userId}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No history found for this user.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date/Time</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Field</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Old Value</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">New Value</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Changed By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {history.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {entry.field}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-red-600 font-mono">
                                                {entry.field.includes('Picture') ? 'Image URL' : entry.oldValue}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-mono">
                                                {entry.field.includes('Picture') ? 'Image URL' : entry.newValue}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.changedBy.includes('Admin') ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {entry.changedBy}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
