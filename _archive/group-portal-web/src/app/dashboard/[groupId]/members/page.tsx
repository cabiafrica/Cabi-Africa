'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'Founder' | 'Leader' | 'Member';
    joinedDate: string;
    status: 'Active' | 'Inactive';
}

export default function MembersPage({ params }: { params: { groupId: string } }) {
    const groupId = params.groupId;

    // Mock members data
    const [members, setMembers] = useState<Member[]>([
        {
            id: 'user_1',
            name: 'John Kamau',
            email: 'john@example.com',
            phone: '+254712345678',
            role: 'Founder',
            joinedDate: '2024-01-15',
            status: 'Active'
        },
        {
            id: 'user_2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+254723456789',
            role: 'Leader',
            joinedDate: '2024-01-20',
            status: 'Active'
        },
        {
            id: 'user_3',
            name: 'Michael Ochieng',
            email: 'michael@example.com',
            phone: '+254734567890',
            role: 'Leader',
            joinedDate: '2024-02-01',
            status: 'Active'
        },
        {
            id: 'user_4',
            name: 'Sarah Mwangi',
            email: 'sarah@example.com',
            phone: '+254745678901',
            role: 'Member',
            joinedDate: '2024-02-15',
            status: 'Active'
        },
        {
            id: 'user_5',
            name: 'Peter Njoroge',
            email: 'peter@example.com',
            phone: '+254756789012',
            role: 'Member',
            joinedDate: '2024-03-01',
            status: 'Active'
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'All' | 'Founder' | 'Leader' | 'Member'>('All');

    const handleRemoveMember = (member: Member) => {
        if (member.role === 'Founder') {
            alert('Cannot remove the founder. Please transfer founder role first.');
            return;
        }

        if (confirm(`Are you sure you want to remove ${member.name} from the organization?\n\nThis action will:\n• Remove them from all organization activities\n• Revoke their organization benefits\n• Send them a notification\n\nThey can re-apply to join later.`)) {
            // Simulate API call
            setMembers(members.filter(m => m.id !== member.id));
            alert(`${member.name} has been removed from the organization.`);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'All' || member.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Founder': return 'bg-purple-100 text-purple-800';
            case 'Leader': return 'bg-blue-100 text-blue-800';
            case 'Member': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
                    <Link href={`/dashboard/${groupId}/members`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                        Members
                    </Link>
                    <Link href={`/dashboard/${groupId}/management`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Leadership Management
                    </Link>
                    <Link href={`/dashboard/${groupId}/audit-log`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Audit Log
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Organization Members</h2>
                            <p className="text-gray-600 mt-2">
                                Manage your organization's member roster
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{members.length}</div>
                                <div className="text-sm text-gray-600">Total Members</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-900">
                                    {members.filter(m => m.role === 'Founder').length}
                                </div>
                                <div className="text-sm text-purple-600">Founder</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-900">
                                    {members.filter(m => m.role === 'Leader').length}
                                </div>
                                <div className="text-sm text-blue-600">Leaders</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-900">
                                    {members.filter(m => m.role === 'Member').length}
                                </div>
                                <div className="text-sm text-green-600">Members</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as any)}
                            >
                                <option value="All">All Roles</option>
                                <option value="Founder">Founder</option>
                                <option value="Leader">Leaders</option>
                                <option value="Member">Members</option>
                            </select>
                        </div>

                        {/* Members Table */}
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{member.email}</div>
                                                <div className="text-sm text-gray-500">{member.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(member.role)}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(member.joinedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {member.role !== 'Founder' ? (
                                                    <button
                                                        onClick={() => handleRemoveMember(member)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {filteredMembers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-5xl mb-4">👥</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
                                <p className="text-gray-500">
                                    {searchQuery || filterRole !== 'All'
                                        ? 'Try adjusting your search or filters'
                                        : 'Your organization has no members yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
