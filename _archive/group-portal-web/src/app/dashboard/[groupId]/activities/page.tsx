'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ActivitiesPage() {
    const params = useParams();
    const groupId = params.groupId as string;

    // Mock Data
    const [activities, setActivities] = useState([
        { id: 'act_1', title: 'Monthly Safety Briefing', description: 'Mandatory safety update for all drivers.', date: '2024-05-20T14:00:00' },
        { id: 'act_2', title: 'Weekend Earnings Quest', description: 'Hit 20 trips this weekend for a bonus.', date: '2024-05-24T00:00:00' }
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [newActivity, setNewActivity] = useState({ title: '', description: '', date: '' });

    const handleCreateActivity = (e: React.FormEvent) => {
        e.preventDefault();
        const activity = {
            id: `act_${Date.now()}`,
            ...newActivity
        };
        setActivities([activity, ...activities]);
        setIsCreating(false);
        setNewActivity({ title: '', description: '', date: '' });
        alert('Activity created successfully!');
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
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Organization Activities</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage events and quests for your members.</p>
                            </div>
                            <button
                                onClick={() => setIsCreating(!isCreating)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                {isCreating ? 'Cancel' : 'Create Activity'}
                            </button>
                        </div>

                        {isCreating && (
                            <form onSubmit={handleCreateActivity} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={newActivity.title}
                                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={newActivity.description}
                                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={newActivity.date}
                                            onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                                            Publish Activity
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            {activities.map((activity) => (
                                <div key={activity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                                        <span className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{activity.description}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <Link href={`/dashboard/${groupId}/activities/${activity.id}`} className="text-blue-600 font-medium cursor-pointer hover:underline">
                                            View Details
                                        </Link>
                                        <span className="text-gray-400">
                                            {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
