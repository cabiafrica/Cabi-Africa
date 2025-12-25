'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ActivityDetailPage() {
    const params = useParams();
    const groupId = params.groupId as string;
    const activityId = params.activityId as string;

    // Mock Data
    const [activity] = useState({
        id: activityId,
        title: 'Monthly Safety Briefing',
        description: 'Mandatory safety update for all drivers. We will discuss new city regulations and safety protocols for night driving.',
        date: '2024-05-20T14:00:00',
        location: 'Community Hall, CBD'
    });

    const [participants] = useState([
        { id: 'u1', name: 'Michael Ochieng', email: 'michael@example.com', rsvpAt: '2024-05-15T10:00:00Z' },
        { id: 'u2', name: 'Sarah Wanjiku', email: 'sarah@example.com', rsvpAt: '2024-05-16T09:30:00Z' },
        { id: 'u3', name: 'David Kamau', email: 'david@example.com', rsvpAt: '2024-05-16T11:20:00Z' }
    ]);

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
                    <Link href={`/dashboard/${groupId}/activities`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
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
                    <div className="mb-6">
                        <Link href={`/dashboard/${groupId}/activities`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                            &larr; Back to Activities
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900">{activity.title}</h2>
                        <div className="mt-2 text-gray-600 space-y-1">
                            <p><strong>Date:</strong> {new Date(activity.date).toLocaleString()}</p>
                            <p><strong>Location:</strong> {activity.location}</p>
                        </div>
                        <p className="mt-4 text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            {activity.description}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                RSVPs <span className="ml-2 text-sm font-normal text-gray-500">({participants.length} attending)</span>
                            </h3>
                            <button className="text-sm text-blue-600 hover:underline">
                                Export List
                            </button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSVP Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {participants.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(p.rsvpAt).toLocaleDateString()} {new Date(p.rsvpAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
