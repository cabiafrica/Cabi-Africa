import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

interface Sacco {
    id: string;
    name: string;
    registrationNumber: string;
    founderName: string;
    status: string;
    _count: { drivers: number };
}

export default function BrowseSaccoPage() {
    const [saccos, setSaccos] = useState<Sacco[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [driverProfile, setDriverProfile] = useState<any>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        // Simulate fetching current driver profile
        setDriverProfile({ id: 'driver-123', saccoId: null });
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sacco/list${search ? `?search=${search}` : ''}`);
            const data = await res.json();
            setSaccos(data);
        } catch (error) {
            console.error('Failed to fetch SACCOs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (saccoId: string) => {
        setProcessingId(saccoId);
        try {
            const res = await fetch('/api/sacco/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: driverProfile.id, saccoId }),
            });
            if (res.ok) {
                setDriverProfile({ ...driverProfile, saccoId });
                alert('Joined SACCO successfully!');
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
            const res = await fetch('/api/sacco/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: driverProfile.id }),
            });
            if (res.ok) {
                setDriverProfile({ ...driverProfile, saccoId: null });
                alert('Left SACCO successfully!');
            }
        } catch (error) {
            alert('Failed to leave');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <MainLayout title="Browse SACCOs | CABI Africa">
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Financial Cooperatives (SACCOs)
                            </h1>
                            <p className="text-gray-400 mt-2">Scale your earnings with group savings, affordable credit, and welfare support.</p>
                        </div>
                        <Link href="/drivers/sacco/create" className="bg-white/5 border border-white/10 hover:border-yellow-500/50 text-yellow-500 px-6 py-3 rounded-xl transition-all font-medium">
                            Register SACCO
                        </Link>
                    </div>

                    <div className="mb-10 relative">
                        <input
                            type="text"
                            placeholder="Search by SACCO name or CS number..."
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
                    ) : saccos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {saccos.map((sacco) => (
                                <div key={sacco.id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20 font-bold uppercase tracking-wider">
                                            Verified
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 truncate pr-16">{sacco.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4 font-mono uppercase">CS No: {sacco.registrationNumber}</p>
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-yellow-500">{sacco._count.drivers}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">Drivers</p>
                                        </div>
                                        <div className="h-8 w-px bg-white/10"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-300">Manager</p>
                                            <p className="text-xs text-gray-500">{sacco.founderName}</p>
                                        </div>
                                    </div>

                                    {driverProfile?.saccoId === sacco.id ? (
                                        <button
                                            onClick={handleLeave}
                                            disabled={processingId === 'leaving'}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {processingId === 'leaving' ? 'Leaving...' : 'Exit SACCO'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(sacco.id)}
                                            disabled={!!driverProfile?.saccoId || processingId === sacco.id}
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:grayscale"
                                        >
                                            {processingId === sacco.id ? 'Joining...' : driverProfile?.saccoId ? 'Currently in SACCO' : 'Join SACCO'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-gray-500 text-lg italic">No SACCOs found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
