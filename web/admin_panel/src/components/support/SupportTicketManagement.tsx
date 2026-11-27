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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');

    useEffect(() => {
        adminService.getSupportTickets()
            .then(data => {
                if (data && data.length > 0) {
                    setTickets(data);
                } else {
                    setTickets([
                        {
                            id: 'TICK-901',
                            subject: 'Driver took longer route via Eastern Bypass',
                            user: 'Kennedy Mwangi (ken.mwangi@example.com)',
                            phone: '+254 712 998 123',
                            status: 'OPEN',
                            priority: 'HIGH',
                            createdAt: '2026-11-26 14:22',
                            tripId: 'TRIP-78219',
                            message: 'Driver diverted through Eastern Bypass despite map route indicating Thika Superhighway. The fare charged was KES 450 higher than initial estimate.',
                            replies: [
                                { sender: 'System Dispatch', text: 'Automated GPS detour flag attached. Investigating driver route justification.', time: '2026-11-26 14:25' }
                            ]
                        },
                        {
                            id: 'TICK-902',
                            subject: 'App crashed during M-Pesa checkout',
                            user: 'Faith Chebet (faith.chebet@example.com)',
                            phone: '+254 722 456 789',
                            status: 'IN_PROGRESS',
                            priority: 'MEDIUM',
                            createdAt: '2026-11-26 11:05',
                            tripId: 'TRIP-66102',
                            message: 'I approved STK push for KES 620 but ride completion screen showed timeout. Funds were deducted from M-Pesa.',
                            replies: [
                                { sender: 'Cabi Finance Agent', text: 'M-Pesa transaction reference QJH81920LK verified. Reconciling with wallet balance.', time: '2026-11-26 11:30' }
                            ]
                        },
                        {
                            id: 'TICK-903',
                            subject: 'Inquiry on corporate monthly tax invoicing',
                            user: 'Safaricom Ops (ops.transport@safaricom.co.ke)',
                            phone: '+254 700 000 100',
                            status: 'RESOLVED',
                            priority: 'LOW',
                            createdAt: '2026-11-25 09:15',
                            tripId: 'CORP-INV-2026-11',
                            message: 'Requesting consolidated KRA eTIMS invoice for all November executive staff commutes.',
                            replies: [
                                { sender: 'Corporate Support', text: 'Consolidated eTIMS tax invoice sent to accounts payable.', time: '2026-11-25 10:45' }
                            ]
                        }
                    ]);
                }
            })
            .catch(() => {
                setTickets([
                    {
                        id: 'TICK-901',
                        subject: 'Driver took longer route via Eastern Bypass',
                        user: 'Kennedy Mwangi (ken.mwangi@example.com)',
                        phone: '+254 712 998 123',
                        status: 'OPEN',
                        priority: 'HIGH',
                        createdAt: '2026-11-26 14:22',
                        tripId: 'TRIP-78219',
                        message: 'Driver diverted through Eastern Bypass despite map route indicating Thika Superhighway. The fare charged was KES 450 higher than initial estimate.',
                        replies: []
                    },
                    {
                        id: 'TICK-902',
                        subject: 'App crashed during M-Pesa checkout',
                        user: 'Faith Chebet (faith.chebet@example.com)',
                        phone: '+254 722 456 789',
                        status: 'IN_PROGRESS',
                        priority: 'MEDIUM',
                        createdAt: '2026-11-26 11:05',
                        tripId: 'TRIP-66102',
                        message: 'I approved STK push for KES 620 but ride completion screen showed timeout.',
                        replies: []
                    },
                    {
                        id: 'TICK-903',
                        subject: 'Inquiry on corporate monthly tax invoicing',
                        user: 'Safaricom Ops (ops.transport@safaricom.co.ke)',
                        phone: '+254 700 000 100',
                        status: 'RESOLVED',
                        priority: 'LOW',
                        createdAt: '2026-11-25 09:15',
                        tripId: 'CORP-INV-2026-11',
                        message: 'Requesting consolidated KRA eTIMS invoice.',
                        replies: []
                    }
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const [showSavedMessages, setShowSavedMessages] = useState(false);
    const [savedMessages, setSavedMessages] = useState<string[]>([
        "Hi there, how can I help you today?",
        "Please provide your trip ID for further assistance.",
        "We have investigated the route and processed a refund of the excess fare to your wallet.",
        "Your transaction has been verified and settled successfully."
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendReply = () => {
        if (!selectedTicket || !replyText.trim()) return;
        const updatedReplies = [
            ...(selectedTicket.replies || []),
            { sender: 'Admin Operator', text: replyText.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ];
        const updatedTicket = { ...selectedTicket, replies: updatedReplies, status: replyStatus };
        setSelectedTicket(updatedTicket);
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setReplyText('');
    };

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
                            placeholder="Search tickets by user, ID or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                            className="pl-11 pr-3 py-1.5 text-xs bg-[#0a0a0a] border border-white/10 rounded-[3px] text-white focus:ring-1 focus:ring-amber-500 outline-none w-56 transition-all focus:w-72"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5 text-xs">
                        <thead className="bg-[#0a0a0a]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket ID & Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User / Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="relative px-6 py-3 text-right"><span className="text-slate-400">Action</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#131722] divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading tickets...</td></tr>
                            ) : tickets.filter(t => !searchQuery.trim() || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.user.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No support tickets found matching "{searchQuery}".</td></tr>
                            ) : tickets
                                .filter(t => !searchQuery.trim() || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.user.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((t: any) => (
                                <tr key={t.id} onClick={() => setSelectedTicket(t)} className="hover:bg-white/[0.03] transition-colors cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-mono text-[11px] text-amber-500 font-bold">{t.id}</div>
                                        <div className="text-sm font-semibold text-white">{t.subject}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        <div>{t.user}</div>
                                        <div className="text-xs text-slate-500">{t.phone || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border ${t.status === 'RESOLVED'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            {t.status === 'RESOLVED' ? <CheckCircle style={{ fontSize: 12 }} /> : <WatchLater style={{ fontSize: 12 }} />}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className={`flex items-center gap-1.5 ${t.priority === 'HIGH' ? 'text-red-400 font-bold' :
                                                t.priority === 'MEDIUM' ? 'text-amber-400 font-medium' :
                                                    'text-slate-400'
                                            }`}>
                                            {t.priority === 'HIGH' && <PriorityHigh fontSize="small" style={{ fontSize: 14 }} />}
                                            {t.priority}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }} className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded border border-amber-500/20 text-xs font-semibold transition-colors">
                                            Manage Ticket
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Support Ticket Resolution & Thread Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#131722] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <SupportAgent />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                            {selectedTicket.id}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-white/5 text-slate-300 border border-white/10">
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-base mt-1">{selectedTicket.subject}</h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Ticket Body & Conversation */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                            {/* User & Trip Info */}
                            <div className="p-3.5 rounded bg-[#0a0a0a] border border-white/5 space-y-1.5">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span>Complainant</span>
                                    <span className="text-white font-semibold">{selectedTicket.user}</span>
                                </div>
                                {selectedTicket.phone && (
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Phone</span>
                                        <span className="font-mono text-slate-300">{selectedTicket.phone}</span>
                                    </div>
                                )}
                                {selectedTicket.tripId && (
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Linked Trip</span>
                                        <span className="font-mono text-amber-400">{selectedTicket.tripId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Client Statement */}
                            <div className="p-4 rounded bg-amber-500/5 border border-amber-500/10 space-y-1.5">
                                <span className="font-semibold text-amber-400 uppercase text-[10px] tracking-wider block">Customer Incident Description</span>
                                <p className="text-slate-200 text-sm leading-relaxed">{selectedTicket.message || selectedTicket.subject}</p>
                            </div>

                            {/* Thread of Replies */}
                            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                                <div className="space-y-2">
                                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block">Resolution History</span>
                                    {selectedTicket.replies.map((reply: any, i: number) => (
                                        <div key={i} className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1">
                                            <div className="flex justify-between text-slate-400 text-[10px]">
                                                <span className="font-bold text-slate-300">{reply.sender}</span>
                                                <span>{reply.time}</span>
                                            </div>
                                            <p className="text-slate-200 text-xs">{reply.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Canned Response Selector */}
                            <div className="space-y-1.5">
                                <span className="text-slate-400 text-[10px] uppercase font-semibold">Quick Canned Responses</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {savedMessages.map((msg, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setReplyText(msg)}
                                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded text-[11px] truncate max-w-xs"
                                        >
                                            {msg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reply Input */}
                            <div className="space-y-2">
                                <label className="block text-slate-300 font-semibold text-xs">Operator Resolution Reply</label>
                                <textarea
                                    rows={3}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your official resolution response to user..."
                                    className="w-full p-2.5 bg-[#0a0a0a] border border-white/10 rounded text-white text-xs focus:border-amber-500 outline-none"
                                />
                            </div>

                            {/* Set Status */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-semibold text-xs">Set Status:</span>
                                {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(st => (
                                    <label key={st} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={replyStatus === st}
                                            onChange={() => setReplyStatus(st)}
                                            className="text-amber-500 focus:ring-amber-500"
                                        />
                                        <span className={replyStatus === st ? 'text-amber-400 font-bold' : 'text-slate-400'}>{st}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleSendReply}
                                disabled={!replyText.trim()}
                                className="btn-primary px-4 py-1.5 rounded text-xs font-bold disabled:opacity-40"
                            >
                                Send Reply & Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
