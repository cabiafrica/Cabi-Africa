'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function GroupDashboard() {
    const params = useParams();
    const groupId = params.groupId as string;

    // Mock Data
    const [organization] = useState({
        id: groupId,
        name: 'Nairobi Drivers Union',
        status: 'Active', // Mock active for dashboard view
        announcements: [
            { id: '1', title: 'Monthly Meeting', content: 'We will meet this Sunday at Uhuru Park.', postedAt: '2024-05-10T10:00:00Z' }
        ]
    });

    const [isPosting, setIsPosting] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

    const handlePostAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Announcement Posted (Mock): ' + newAnnouncement.title);
        setIsPosting(false);
        setNewAnnouncement({ title: '', content: '' });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Group Portal</h1>
                </div>
                <nav className="mt-6 px-6 space-y-2">
                    <Link href={`/dashboard/${groupId}`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                        Overview
                    </Link>
                    <Link href={`/dashboard/${groupId}/management`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Leadership Management
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">ID: {organization.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${organization.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {organization.status}
                            </span>
                        </div>
                    </div>

                    {/* Announcements Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
                            <button
                                onClick={() => setIsPosting(!isPosting)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                {isPosting ? 'Cancel' : 'New Announcement'}
                            </button>
                        </div>

                        {isPosting && (
                            <form onSubmit={handlePostAnnouncement} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Content"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md">
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {organization.announcements.map((ann) => (
                                <div key={ann.id} className="border-b last:border-0 pb-4 last:pb-0">
                                    <h4 className="font-semibold text-gray-800">{ann.title}</h4>
                                    <p className="text-gray-600 mt-1">{ann.content}</p>
                                    <span className="text-xs text-gray-400 mt-2 block">
                                        Posted: {new Date(ann.postedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
