'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ManagementPage({ params }: { params: { groupId: string } }) {
    const groupId = params.groupId;

    // Mock Data
    const [leadershipTeam, setLeadershipTeam] = useState([
        { id: 'user_1', name: 'John Kamau', role: 'Founder', email: 'john@example.com' },
        { id: 'user_2', name: 'Jane Doe', role: 'Secretary', email: 'jane@example.com' }
    ]);

    const [memberIdToAdd, setMemberIdToAdd] = useState('');

    const handleAddLeader = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API call
        if (memberIdToAdd) {
            const newLeader = {
                id: memberIdToAdd,
                name: 'New Leader ' + memberIdToAdd,
                role: 'Member',
                email: 'new@example.com'
            };
            setLeadershipTeam([...leadershipTeam, newLeader]);
            setMemberIdToAdd('');
            alert('Leader added successfully!');
        }
    };

    const handleRemoveLeader = (id: string) => {
        if (confirm('Are you sure you want to remove this leader?')) {
            setLeadershipTeam(leadershipTeam.filter(l => l.id !== id));
        }
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
                    <Link href={`/dashboard/${groupId}/management`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                        Leadership Management
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Leadership Management</h2>
                        <p className="text-gray-600 mb-8">
                            Manage the members of your organization's leadership team. These users will have administrative access to the portal.
                        </p>

                        {/* Add Leader Form */}
                        <form onSubmit={handleAddLeader} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Appoint New Leader</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter Member ID (e.g., user_123)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={memberIdToAdd}
                                    onChange={(e) => setMemberIdToAdd(e.target.value)}
                                    required
                                />
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                                    Add Leader
                                </button>
                            </div>
                        </form>

                        {/* Leadership Table */}
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leadershipTeam.map((member) => (
                                        <tr key={member.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {member.role !== 'Founder' && (
                                                    <button
                                                        onClick={() => handleRemoveLeader(member.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Certificate Renewal Section - Story 120.9 */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Certificate</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Your organization's registration certificate must be kept up to date. Upload a new certificate before it expires.
                        </p>

                        {/* Current Certificate Status */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Current Certificate</p>
                                    <p className="text-xs text-gray-500 mt-1">Expires: December 31, 2025</p>
                                    <p className="text-xs text-green-600 font-medium mt-1">✓ Valid (15 days remaining)</p>
                                </div>
                                <a href="#" className="text-sm text-blue-600 hover:underline">View Certificate</a>
                            </div>
                        </div>

                        {/* Upload New Certificate Form */}
                        <form className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Upload New Certificate</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certificate Document
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Upload your updated government registration certificate (PDF, JPG, or PNG)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certificate Expiration Date
                                    </label>
                                    <input
                                        type="date"
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter the expiration date shown on the new certificate
                                    </p>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> After uploading, your organization status will be set to "Pending Verification"
                                        until a Cabi administrator reviews and approves the new certificate.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert('Certificate uploaded successfully! It will be reviewed by our team.');
                                    }}
                                >
                                    Upload Certificate
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Founder Transfer Section */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Transfer Founder Role</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            If you wish to step down as founder, you can nominate another leader to take over. This request will require admin approval.
                        </p>

                        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nominate New Founder</label>
                            <div className="flex gap-4">
                                <select className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500">
                                    <option value="">Select a leader...</option>
                                    {leadershipTeam.filter(m => m.role !== 'Founder').map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                                    ))}
                                </select>
                                <button
                                    className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700"
                                    onClick={() => alert('Transfer request submitted for Admin review.')}
                                >
                                    Request Transfer
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-yellow-700">
                                * The nominee must actively accept the role, and Cabi admins must approve the transfer.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Organization Dissolution Section - Story 120.10 */}
                <div className="mt-12 pt-8 border-t border-red-200">
                    <h3 className="text-lg font-medium text-red-900 mb-2">Dissolve Organization</h3>
                    <p className="text-sm text-red-600 mb-6">
                        ⚠️ <strong>Warning:</strong> Dissolving your organization is a permanent action. All members will be transitioned to independent driver status, and the organization portal will become inaccessible.
                    </p>

                    <div className="bg-red-50 p-6 rounded-lg border border-red-300">
                        <h4 className="text-md font-medium text-red-900 mb-4">Request Organization Dissolution</h4>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Dissolution (Optional)
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    rows={3}
                                    placeholder="Explain why you are dissolving this organization..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    This information will be reviewed by platform administrators
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-md border border-red-200">
                                <p className="text-sm text-red-800 mb-2">
                                    <strong>Before you proceed, please understand:</strong>
                                </p>
                                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                                    <li>This action requires admin approval and cannot be undone</li>
                                    <li>All {leadershipTeam.length + 10} members will lose their organization affiliation</li>
                                    <li>Organization data will be archived but portal access will be revoked</li>
                                    <li>If you wish to reform, you must register as a new organization</li>
                                </ul>
                            </div>

                            <button
                                className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
                                onClick={() => {
                                    if (confirm('Are you absolutely sure you want to dissolve this organization? This action cannot be undone and requires admin approval.')) {
                                        alert('Dissolution request submitted. A platform administrator will review your request.');
                                    }
                                }}
                            >
                                Request Dissolution
                            </button>
                        </div>
                    </div>
                </div>
        </div>
        </div >
            </main >
        </div >
    );
}
