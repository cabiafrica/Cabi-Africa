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
import { PageHeader } from '../common/PageHeader';

export const SupportTicketManagement: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getSupportTickets()
            .then(data => {
                if (data && data.length > 0) {
                    setTickets(data);
                } else {
                    setTickets([
                        { id: 'TICK-901', subject: 'Driver took longer route via Eastern Bypass', user: 'Kennedy Mwangi', status: 'OPEN', priority: 'HIGH', createdAt: '2026-11-26' },
                        { id: 'TICK-902', subject: 'App crashed during M-Pesa checkout', user: 'Faith Chebet', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2026-11-26' },
                        { id: 'TICK-903', subject: 'Inquiry on corporate monthly tax invoicing', user: 'Safaricom Ops', status: 'RESOLVED', priority: 'LOW', createdAt: '2026-11-25' }
                    ]);
                }
            })
            .catch(() => {
                setTickets([
                    { id: 'TICK-901', subject: 'Driver took longer route via Eastern Bypass', user: 'Kennedy Mwangi', status: 'OPEN', priority: 'HIGH', createdAt: '2026-11-26' },
                    { id: 'TICK-902', subject: 'App crashed during M-Pesa checkout', user: 'Faith Chebet', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2026-11-26' },
                    { id: 'TICK-903', subject: 'Inquiry on corporate monthly tax invoicing', user: 'Safaricom Ops', status: 'RESOLVED', priority: 'LOW', createdAt: '2026-11-25' }
                ]);
            })
            .finally(() => setLoading(false));
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
                <PageHeader
                    category="Trips & Safety"
                    title="Manage Saved Messages"
                    subtitle="Create and edit canned responses for quick replies."
                    icon={<Message className="text-amber-500" />}
                    actions={
                        <button
                            onClick={() => setShowSavedMessages(false)}
                            className="px-3.5 py-1.5 rounded-[3px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                            <ArrowBack fontSize="small" />
                            Back to Tickets
                        </button>
                    }
                />

                <div className="bg-white dark:bg-card-dark shadow-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 max-w-2xl">
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type new canned response..."
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <button
                            onClick={handleAddMessage}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-amber-500/20"
                        >
                            <Add fontSize="small" />
                            Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {savedMessages.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                                No saved messages yet. Add one above!
                            </div>
                        ) : (
                            savedMessages.map((msg, idx) => (
                                <div key={idx} className="p-3 border border-slate-100 dark:border-white/10 rounded-lg flex justify-between items-center bg-slate-50 dark:bg-surface-dark/50 group hover:border-amber-200 dark:hover:border-amber-800 transition-all">
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
            <PageHeader
                category="Trips & Safety"
                title="Support Tickets"
                subtitle="Manage and resolve user inquiries and support operations."
                icon={<SupportAgent className="text-amber-500" />}
                actions={
                    <button
                        onClick={() => setShowSavedMessages(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-[3px] text-xs font-semibold transition-colors shadow-sm active:scale-95"
                    >
                        <Message fontSize="small" className="text-amber-400" />
                        Saved Messages
                    </button>
                }
            />

            <div className="bg-[#131722] shadow-sm rounded-[4px] border border-white/10 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                    <h3 className="font-semibold text-white text-xs uppercase tracking-wider">All Tickets</h3>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize="small" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            style={{ paddingLeft: '2.75rem' }}
                            className="pl-11 pr-3 py-1.5 text-xs bg-[#0a0a0a] border border-white/10 rounded-[3px] text-white focus:ring-1 focus:ring-amber-500 outline-none w-48 transition-all focus:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-surface-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
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
                                                : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
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
                                        <button className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors">
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
