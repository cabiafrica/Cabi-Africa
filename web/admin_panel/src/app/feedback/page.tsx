'use client';
import React, { useState, useEffect } from 'react';

interface Feedback {
    id: string;
    userId: string;
    userName: string;
    topic: string;
    title: string;
    description: string;
    status: 'NEW' | 'UNDER_REVIEW' | 'PLANNED' | 'SHIPPED' | 'REJECTED';
    requestCount: number;
    tags: string[];
    submittedDate: string;
}

const MOCK_FEEDBACK: Feedback[] = [];

export default function FeedbackManagementPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterTopic, setFilterTopic] = useState<string>('ALL');

    useEffect(() => {
        setFeedback(MOCK_FEEDBACK);
    }, []);

    const filteredFeedback = feedback.filter(item => {
        if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
        if (filterTopic !== 'ALL' && item.topic !== filterTopic) return false;
        return true;
    }).sort((a, b) => b.requestCount - a.requestCount);

    const updateStatus = (id: string, newStatus: Feedback['status']) => {
        setFeedback(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
        if (selectedFeedback?.id === id) {
            setSelectedFeedback({ ...selectedFeedback, status: newStatus });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-amber-100 text-amber-800';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
            case 'PLANNED': return 'bg-cyan-100 text-cyan-800';
            case 'SHIPPED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Feedback Management</h1>
                <p className="text-gray-500 mt-1">Review and manage feature requests and suggestions</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="PLANNED">Planned</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <select
                        value={filterTopic}
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="ALL">All Topics</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Safety">Safety</option>
                        <option value="Payment">Payment</option>
                        <option value="UI/UX">UI/UX</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="text-sm text-amber-700 font-medium">New</div>
                    <div className="text-2xl font-bold text-amber-900">{feedback.filter(f => f.status === 'NEW').length}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="text-sm text-yellow-700 font-medium">Under Review</div>
                    <div className="text-2xl font-bold text-yellow-900">{feedback.filter(f => f.status === 'UNDER_REVIEW').length}</div>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                    <div className="text-sm text-cyan-700 font-medium">Planned</div>
                    <div className="text-2xl font-bold text-cyan-900">{feedback.filter(f => f.status === 'PLANNED').length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-sm text-green-700 font-medium">Shipped</div>
                    <div className="text-2xl font-bold text-green-900">{feedback.filter(f => f.status === 'SHIPPED').length}</div>
                </div>
            </div>

            {/* Feedback List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Title</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Topic</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Requests</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredFeedback.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{item.title}</div>
                                    <div className="text-sm text-gray-500">by {item.userName}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        {item.topic}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-bold text-cyan-600">{item.requestCount}</span>
                                        <span className="text-xs text-gray-500">votes</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(item.submittedDate).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => setSelectedFeedback(item)}
                                        className="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedFeedback.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Submitted by {selectedFeedback.userName}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <p className="text-gray-900">{selectedFeedback.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={selectedFeedback.status}
                                    onChange={(e) => updateStatus(selectedFeedback.id, e.target.value as Feedback['status'])}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="NEW">New</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="PLANNED">Planned</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFeedback.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button className="flex-1 bg-amber-500 text-black px-4 py-2 rounded hover:bg-cyan-700">
                                    Save Changes
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                                    Convert to Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
