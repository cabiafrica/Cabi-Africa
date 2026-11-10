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
            <div className="bg-slate-50 dark:bg-surface-dark min-h-screen py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Members &amp; Permissions</h1>
                            <p className="text-neutral-500 mt-2">Manage your team and assign Hunter privileges.</p>
                        </div>
                        <Link href="/organizations/dashboard/hunter" className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold px-5 py-2.5 rounded-xl transition shadow-md">
                            <FaUserPlus /> Go to Hunter View
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow overflow-hidden border border-slate-200 dark:border-white/10">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
                            <thead className="bg-slate-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Hunter Permission</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-white/10">
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900 dark:text-white">{member.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                            {member.position}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${member.canHunt ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-neutral-500/15 text-neutral-400'
                                                }`}>
                                                {member.canHunt ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => toggleHunter(member.id)}
                                                className="text-[#D4AF37] hover:text-[#ffe088] font-bold"
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
