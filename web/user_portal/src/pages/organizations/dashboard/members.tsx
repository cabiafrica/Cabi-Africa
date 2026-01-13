import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { FaUserPlus, FaCheckCircle, FaSearch } from 'react-icons/fa';

// Mock Data
const INITIAL_MEMBERS = [
    { id: '1', name: 'Alice Johnson', position: 'Fleet Manager', canHunt: false },
    { id: '2', name: 'Bob Smith', position: 'Dispatcher', canHunt: true },
    { id: '3', name: 'Charlie Davis', position: 'Accountant', canHunt: false },
];

export default function OrgMembersPage() {
    const [members, setMembers] = useState(INITIAL_MEMBERS);

    const toggleHunter = (id: string) => {
        setMembers(members.map(m =>
            m.id === id ? { ...m, canHunt: !m.canHunt } : m
        ));
        // In real app, make API call here
        alert("Permission updated!");
    };

    return (
        <MainLayout title="Organization Members - Cabi Africa" description="Manage your organization members.">
            <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Members & Permissions</h1>
                            <p className="text-gray-500 mt-2">Manage your team and assign Hunter privileges.</p>
                        </div>
                        <Link href="/organizations/dashboard/hunter" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            <FaUserPlus /> Go to Hunter View
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hunter Permission</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {member.position}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.canHunt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {member.canHunt ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => toggleHunter(member.id)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                {member.canHunt ? 'Revoke Permission' : 'Enable Hunting'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
