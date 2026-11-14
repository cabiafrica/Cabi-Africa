import React, { useState, useEffect } from 'react';

// Mock API Call
const fetchTickets = async () => {
    // In real app: fetch('/api/support/admin/tickets')
    return [
        { id: '1', subject: 'Urgent: Accident', user: 'Driver Bob', status: 'NEW', tags: ['safety'], slaDueAt: new Date(Date.now() + 30 * 60000) },
        { id: '2', subject: 'Payment Error', user: 'Passenger Alice', status: 'OPEN', tags: ['financial'], slaDueAt: new Date(Date.now() + 20 * 3600000) },
    ];
};

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        fetchTickets().then(setTickets);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Support Dashboard</h1>
            <div className="flex gap-4 mb-6">
                <div className="bg-red-100 p-4 rounded shadow">
                    <h3 className="text-lg font-bold">Critical (SLA Breaching)</h3>
                    <p className="text-3xl text-red-600">1</p>
                </div>
                <div className="bg-amber-100 p-4 rounded shadow">
                    <h3 className="text-lg font-bold">Open Tickets</h3>
                    <p className="text-3xl text-amber-600">14</p>
                </div>
            </div>

            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Subject</th>
                        <th className="py-2 px-4 border-b">User</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Tags</th>
                        <th className="py-2 px-4 border-b">SLA Due</th>
                        <th className="py-2 px-4 border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{t.id}</td>
                            <td className="py-2 px-4 border-b">{t.subject}</td>
                            <td className="py-2 px-4 border-b">{t.user}</td>
                            <td className="py-2 px-4 border-b">
                                <span className={`px-2 py-1 rounded text-sm ${t.status === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="py-2 px-4 border-b">
                                {t.tags.map((tag: string) => (
                                    <span key={tag} className="mr-1 px-2 py-0.5 bg-gray-200 rounded-full text-xs">{tag}</span>
                                ))}
                            </td>
                            <td className="py-2 px-4 border-b text-red-500 font-mono">
                                {t.slaDueAt.toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-4 border-b">
                                <a href={`/support/${t.id}`} className="text-amber-600 hover:underline">View</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
