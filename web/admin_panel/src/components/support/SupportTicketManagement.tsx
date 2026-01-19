import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    SupportAgent,
    Message,
    ArrowBack,
    Add,
    Delete,
    PriorityHigh,
    CheckCircle,
    WatchLater,
    Search
} from '@mui/icons-material';

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
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSavedMessages(false)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <ArrowBack />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Message className="text-blue-600 dark:text-blue-400" />
                            Manage Saved Messages
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Create and edit canned responses for quick replies.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6 max-w-2xl">
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type new canned response..."
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={handleAddMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Add fontSize="small" />
                            Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {savedMessages.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                No saved messages yet. Add one above!
                            </div>
                        ) : (
                            savedMessages.map((msg, idx) => (
                                <div key={idx} className="p-3 border border-slate-100 dark:border-slate-700 rounded-lg flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                                    <span className="text-slate-700 dark:text-slate-300">{msg}</span>
                                    <button
                                        onClick={() => setSavedMessages(savedMessages.filter((_, i) => i !== idx))}
                                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Delete fontSize="small" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <SupportAgent className="text-blue-600 dark:text-blue-400" />
                        Support Tickets
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and resolve user inquiries.</p>
                </div>
                <button
                    onClick={() => setShowSavedMessages(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
                >
                    <Message fontSize="small" className="text-blue-500" />
                    Saved Messages
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">All Tickets</h3>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" fontSize="small" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none w-48 transition-all focus:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading tickets...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No support tickets found.</td></tr>
                            ) : tickets.map((t: any) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{t.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{t.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border ${t.status === 'RESOLVED'
                                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                            }`}>
                                            {t.status === 'RESOLVED' ? <CheckCircle style={{ fontSize: 12 }} /> : <WatchLater style={{ fontSize: 12 }} />}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className={`flex items-center gap-1.5 ${t.priority === 'HIGH' ? 'text-red-600 dark:text-red-400 font-medium' :
                                                t.priority === 'MEDIUM' ? 'text-orange-600 dark:text-orange-400' :
                                                    'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {t.priority === 'HIGH' && <PriorityHigh fontSize="small" style={{ fontSize: 14 }} />}
                                            {t.priority}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
