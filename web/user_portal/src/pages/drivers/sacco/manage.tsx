import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

interface Member {
    id: string;
    user: { fullName: string; phone: string };
    isOnline: boolean;
    totalRidesCompleted: number;
    averageRating: number;
}

interface SaccoDetails {
    id: string;
    name: string;
    registrationNumber: string;
    status: string;
    drivers: Member[];
}

export default function ManageSaccoPage() {
    const [sacco, setSacco] = useState<SaccoDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching organizationId from session
        const orgId = 'org-123'; 
        fetchDetails(orgId);
    }, []);

    const fetchDetails = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sacco/details/${id}`);
            const data = await res.json();
            setSacco(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <MainLayout title="Manage Organization">
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
    </MainLayout>;

    if (!sacco) return <MainLayout title="No Organization Found">
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl font-bold mb-4">You don't manage any organization yet.</h1>
            <Link href="/drivers/sacco/create" className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold">
                Register Your SACCO
            </Link>
        </div>
    </MainLayout>;

    return (
        <MainLayout title={`Manage ${sacco.name} | CABI Africa`}>
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white">{sacco.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    sacco.status === 'VERIFIED' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                    sacco.status === 'PENDING' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                                    'border-red-500/30 text-red-500 bg-red-500/5'
                                }`}>
                                    {sacco.status}
                                </span>
                            </div>
                            <p className="text-gray-500 font-mono text-sm">{sacco.registrationNumber}</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="bg-white/5 border border-white/10 hover:border-yellow-500/50 text-white px-6 py-3 rounded-xl transition-all font-medium">
                                Settings
                            </button>
                            <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl transition-all font-bold">
                                Invite Driver
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                            <p className="text-gray-500 text-sm mb-1">Total Members</p>
                            <h2 className="text-3xl font-bold text-yellow-500">{sacco.drivers.length}</h2>
                        </div>
                        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                            <p className="text-gray-500 text-sm mb-1">Active Now</p>
                            <h2 className="text-3xl font-bold text-green-500">
                                {sacco.drivers.filter(d => d.isOnline).length}
                            </h2>
                        </div>
                        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                            <p className="text-gray-500 text-sm mb-1">Total Group Rides</p>
                            <h2 className="text-3xl font-bold text-blue-500">
                                {sacco.drivers.reduce((acc, d) => acc + d.totalRidesCompleted, 0)}
                            </h2>
                        </div>
                        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                            <p className="text-gray-500 text-sm mb-1">Avg. Group Rating</p>
                            <h2 className="text-3xl font-bold text-purple-500">4.8</h2>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-xl">Member Directory</h3>
                            <input
                                type="text"
                                placeholder="Filter members..."
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Driver Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Total Rides</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {sacco.drivers.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/[0.02] transition-all">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white">{member.user.fullName}</div>
                                                <div className="text-xs text-gray-500">{member.user.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {member.isOnline ? (
                                                    <span className="flex items-center gap-2 text-green-500 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                                        Offline
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 font-mono">
                                                {member.totalRidesCompleted}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-yellow-500">
                                                    <span className="mr-1">{member.averageRating || '5.0'}</span>
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-500 hover:text-white transition-all">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
