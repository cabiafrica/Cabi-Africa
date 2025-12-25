import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const SupportTicketManagement: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getSupportTickets().then(setTickets).finally(() => setLoading(false));
    }, []);

    const [showSavedMessages, setShowSavedMessages] = useState(false);
    const [savedMessages, setSavedMessages] = useState<string[]>([
        "Hi there, how can I help you today?",
        "Please provide your trip ID for further assistance.",
        "We have refunded the amount to your wallet."
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleAddMessage = () => {
        if (newMessage.trim()) {
            setSavedMessages([...savedMessages, newMessage]);
            setNewMessage('');
        }
    };

    if (showSavedMessages) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Manage Saved Messages</h2>
                    <button onClick={() => setShowSavedMessages(false)} className="text-gray-500 hover:text-gray-700"> Back to Tickets</button>
                </div>

                <div className="mb-6 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type new canned response..."
                        className="flex-1 border rounded-md p-2"
                    />
                    <button onClick={handleAddMessage} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Add</button>
                </div>

                <div className="space-y-2">
                    {savedMessages.map((msg, idx) => (
                        <div key={idx} className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
                            <span>{msg}</span>
                            <button onClick={() => setSavedMessages(savedMessages.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                    ))}
                    {savedMessages.length === 0 && <div className="text-gray-500 text-center py-4">No saved messages yet.</div>}
                </div>
            </div>
        );
    }

    if (loading) return <div>Loading tickets...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Support Tickets</h2>
                {/* Story 89.1: Saved Messages */}
                <button onClick={() => setShowSavedMessages(true)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                    📂 Saved Messages
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tickets.map((t: any) => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.priority}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
