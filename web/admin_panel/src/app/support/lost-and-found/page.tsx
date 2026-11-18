'use client';

import { useState } from 'react';

interface LostAndFoundTicket {
    id: string;
    ticketNumber: string;
    passengerName: string;
    driverName: string;
    tripId: string;
    itemDescription: string;
    status: 'New' | 'Contacting Driver' | 'Item Found' | 'Item Returned' | 'Closed';
    createdAt: string;
    updatedAt: string;
    notes: string[];
}

export default function LostAndFoundPage() {
    const [tickets, setTickets] = useState<LostAndFoundTicket[]>([]);

    const [selectedTicket, setSelectedTicket] = useState<LostAndFoundTicket | null>(null);
    const [newNote, setNewNote] = useState('');

    const getStatusColor = (status: LostAndFoundTicket['status']) => {
        const colors = {
            'New': 'bg-amber-100 text-amber-800',
            'Contacting Driver': 'bg-yellow-100 text-yellow-800',
            'Item Found': 'bg-green-100 text-green-800',
            'Item Returned': 'bg-cyan-100 text-cyan-800',
            'Closed': 'bg-gray-100 text-gray-800',
        };
        return colors[status];
    };

    const handleStatusChange = (ticketId: string, newStatus: LostAndFoundTicket['status']) => {
        setTickets(tickets.map(t =>
            t.id === ticketId
                ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
                : t
        ));
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date().toISOString() });
        }
    };

    const handleAddNote = () => {
        if (!selectedTicket || !newNote.trim()) return;

        const updatedTicket = {
            ...selectedTicket,
            notes: [...selectedTicket.notes, newNote],
            updatedAt: new Date().toISOString(),
        };

        setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setNewNote('');
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Lost & Found Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage lost item reports and facilitate returns
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'New', count: tickets.filter(t => t.status === 'New').length, color: 'blue' },
                        { label: 'In Progress', count: tickets.filter(t => t.status === 'Contacting Driver').length, color: 'yellow' },
                        { label: 'Found', count: tickets.filter(t => t.status === 'Item Found').length, color: 'green' },
                        { label: 'Returned', count: tickets.filter(t => t.status === 'Item Returned').length, color: 'teal' },
                        { label: 'Closed', count: tickets.filter(t => t.status === 'Closed').length, color: 'gray' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                            <p className={`text-3xl font-bold mt-2 text-${stat.color}-600`}>{stat.count}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tickets List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4">
                                <h2 className="text-lg font-bold text-black">All Tickets</h2>
                                <p className="text-sm text-black opacity-80">{tickets.length} total</p>
                            </div>

                            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                                {tickets.map((ticket) => (
                                    <button
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-yellow-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="font-mono text-sm font-semibold text-gray-900">
                                                {ticket.ticketNumber}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="font-semibold text-gray-900 mb-1">{ticket.itemDescription}</p>
                                        <p className="text-sm text-gray-600">Passenger: {ticket.passengerName}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="lg:col-span-2">
                        {selectedTicket ? (
                            <div className="bg-white rounded-lg shadow">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-gray-900 to-black text-white p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{selectedTicket.ticketNumber}</h2>
                                            <p className="text-gray-300">{selectedTicket.itemDescription}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Trip Details */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Trip Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Trip ID</p>
                                                <p className="font-mono font-semibold">{selectedTicket.tripId}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Date</p>
                                                <p className="font-semibold">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Passenger</p>
                                                <p className="font-semibold">{selectedTicket.passengerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Driver</p>
                                                <p className="font-semibold">{selectedTicket.driverName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Update */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Update Status</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['New', 'Contacting Driver', 'Item Found', 'Item Returned', 'Closed'] as const).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(selectedTicket.id, status)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedTicket.status === status
                                                            ? 'bg-yellow-400 text-black'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Internal Notes</h3>

                                        {/* Existing Notes */}
                                        <div className="space-y-3 mb-4">
                                            {selectedTicket.notes.length > 0 ? (
                                                selectedTicket.notes.map((note, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700">{note}</p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Added {new Date(selectedTicket.updatedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No notes yet</p>
                                            )}
                                        </div>

                                        {/* Add Note */}
                                        <div className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Add an internal note..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                            />
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim()}
                                                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Add Note
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-gray-200 flex space-x-3">
                                        <button className="flex-1 px-4 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>Contact Passenger</span>
                                        </button>
                                        <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>Contact Driver</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow h-full flex items-center justify-center p-12">
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ticket Selected</h3>
                                    <p className="text-gray-600">Select a ticket from the list to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
