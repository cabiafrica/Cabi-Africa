import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

interface DriverGroup {
    id: string;
    name: string;
    description: string;
    founderName: string;
    isPrivate: boolean;
    memberCapacity: number;
    _count: { drivers: number };
}

export default function BrowseGroupsPage() {
    const [groups, setGroups] = useState<DriverGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [driverProfile, setDriverProfile] = useState<any>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        // Simulate fetching current driver profile
        setDriverProfile({ id: 'driver-123', driverOrganizationId: null });
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/driver-org/list${search ? `?search=${search}` : ''}`);
            const data = await res.json();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (groupId: string) => {
        setProcessingId(groupId);
        try {
            const res = await fetch('/api/driver-org/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: driverProfile.id, orgId: groupId }),
            });
            if (res.ok) {
                setDriverProfile({ ...driverProfile, driverOrganizationId: groupId });
                alert('Joined group successfully!');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to join group');
            }
        } catch (error) {
            alert('Failed to join');
        } finally {
            setProcessingId(null);
        }
    };

    const handleLeave = async () => {
        setProcessingId('leaving');
        try {
            const res = await fetch('/api/driver-org/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: driverProfile.id }),
            });
            if (res.ok) {
                setDriverProfile({ ...driverProfile, driverOrganizationId: null });
                alert('Left group successfully!');
            }
        } catch (error) {
            alert('Failed to leave');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <MainLayout title="Browse Community Groups | CABI Africa">
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Driver Community Groups
                            </h1>
                            <p className="text-gray-400 mt-2">Connect with fellow drivers, share tips, and collaborate for better efficiency.</p>
                        </div>
                        <Link href="/drivers/groups/create" className="bg-white/5 border border-white/10 hover:border-yellow-500/50 text-yellow-500 px-6 py-3 rounded-xl transition-all font-medium">
                            Create New Group
                        </Link>
                    </div>

                    <div className="mb-10 relative">
                        <input
                            type="text"
                            placeholder="Search for a group by name or mission..."
                            className="w-full bg-[#121212] border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-yellow-500 transition-all text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg className="w-6 h-6 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/5"></div>
                            ))}
                        </div>
                    ) : groups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <div key={group.id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all relative overflow-hidden group flex flex-col justify-between">
                                    <div>
                                        <div className="absolute top-0 right-0 p-4">
                                            {group.isPrivate ? (
                                                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-full border border-red-500/20 font-bold uppercase">
                                                    Private
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-1 rounded-full border border-[#D4AF37]/30 font-bold uppercase">
                                                    Public
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-1 truncate pr-16">{group.name}</h3>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{group.description || 'A community of dedicated drivers helping each other grow.'}</p>
                                        
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-yellow-500">{group._count.drivers}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Members</p>
                                            </div>
                                            <div className="h-8 w-px bg-white/10"></div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Capacity</p>
                                                <p className="text-sm font-medium text-gray-300">{group.memberCapacity} max</p>
                                            </div>
                                        </div>
                                    </div>

                                    {driverProfile?.driverOrganizationId === group.id ? (
                                        <button
                                            onClick={handleLeave}
                                            disabled={processingId === 'leaving'}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {processingId === 'leaving' ? 'Leaving...' : 'Exit Group'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(group.id)}
                                            disabled={!!driverProfile?.driverOrganizationId || processingId === group.id || (group._count.drivers >= group.memberCapacity)}
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:grayscale"
                                        >
                                            {processingId === group.id ? 'Joining...' : 
                                             group._count.drivers >= group.memberCapacity ? 'Group Full' :
                                             driverProfile?.driverOrganizationId ? 'In another Group' : 'Join Community'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-gray-500 text-lg italic">No driver groups found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
