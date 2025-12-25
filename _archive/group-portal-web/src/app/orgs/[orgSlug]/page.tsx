'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OrganizationProfile {
    id: string;
    name: string;
    slug: string;
    description: string;
    mission: string;
    memberCount: number;
    leadershipCount: number;
    foundedDate: string;
    status: 'Active' | 'Pending Verification';
    certificateUrl?: string;
    activities: Array<{
        id: string;
        title: string;
        date: string;
    }>;
}

export default function PublicOrganizationProfile({ params }: { params: { orgSlug: string } }) {
    const orgSlug = params.orgSlug;

    // Mock organization data
    const [organization] = useState<OrganizationProfile>({
        id: 'org_1',
        name: 'Nairobi Drivers Union',
        slug: 'nairobi-drivers-union',
        description: 'A community of professional drivers dedicated to excellence in service and mutual support.',
        mission: 'To empower drivers through collective action, professional development, and advocacy for better working conditions across Nairobi.',
        memberCount: 145,
        leadershipCount: 5,
        foundedDate: '2024-01-15',
        status: 'Active',
        activities: [
            {
                id: 'act_1',
                title: 'Monthly Safety Training',
                date: '2024-12-20'
            },
            {
                id: 'act_2',
                title: 'Community Meetup',
                date: '2024-12-25'
            }
        ]
    });

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinReason, setJoinReason] = useState('');

    const handleRequestToJoin = () => {
        if (!joinReason.trim()) {
            alert('Please provide a reason for joining');
            return;
        }

        // Simulate API call
        alert(`Join request submitted to ${organization.name}!\n\nYour request will be reviewed by the organization's leadership team.`);
        setShowJoinModal(false);
        setJoinReason('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-black text-yellow-400 py-4 px-6 shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold">
                        Cabi
                    </Link>
                    <nav className="space-x-6">
                        <Link href="/orgs" className="hover:text-yellow-300">
                            All Organizations
                        </Link>
                        <Link href="/login" className="hover:text-yellow-300">
                            Login
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-black to-gray-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-3xl font-bold text-black">
                                        {organization.name.split(' ').map(w => w[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold">{organization.name}</h1>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                                            {organization.status}
                                        </span>
                                        <span className="text-gray-300">
                                            Founded {new Date(organization.foundedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xl text-gray-300 mt-4 max-w-3xl">
                                {organization.description}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg"
                        >
                            Request to Join
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="col-span-2 space-y-8">
                        {/* Mission Statement */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {organization.mission}
                            </p>
                        </div>

                        {/* Upcoming Activities */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Activities</h2>
                            <div className="space-y-4">
                                {organization.activities.map((activity) => (
                                    <div key={activity.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(activity.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Benefits</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <div className="text-green-500 text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-semibold">Professional Development</h3>
                                        <p className="text-sm text-gray-600">Regular training and workshops</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="text-green-500 text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-semibold">Community Support</h3>
                                        <p className="text-sm text-gray-600">Network with fellow drivers</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="text-green-500 text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-semibold">Collective Bargaining</h3>
                                        <p className="text-sm text-gray-600">Stronger voice together</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="text-green-500 text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-semibold">Exclusive Events</h3>
                                        <p className="text-sm text-gray-600">Members-only activities</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Stats</h3>
                            <div className="space-y-4">
                                <div className="border-b pb-4">
                                    <div className="text-3xl font-bold text-yellow-600">{organization.memberCount}</div>
                                    <div className="text-sm text-gray-600">Active Members</div>
                                </div>
                                <div className="border-b pb-4">
                                    <div className="text-3xl font-bold text-blue-600">{organization.leadershipCount}</div>
                                    <div className="text-sm text-gray-600">Leadership Team</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600">{organization.activities.length}</div>
                                    <div className="text-sm text-gray-600">Upcoming Events</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Ready to Join?</h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Become part of our growing community of professional drivers.
                            </p>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="w-full px-4 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                                Request to Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Request to Join {organization.name}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Tell us why you'd like to join this organization. Your request will be reviewed by the leadership team.
                        </p>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            rows={4}
                            placeholder="Why do you want to join this organization?"
                            value={joinReason}
                            onChange={(e) => setJoinReason(e.target.value)}
                        />
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowJoinModal(false);
                                    setJoinReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestToJoin}
                                className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
