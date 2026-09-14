import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Car, Shield, Users, Search, AlertCircle, CheckCircle2, ArrowLeft, UserPlus, Sparkles, Star } from 'lucide-react';

export default function AssignDriverPage() {
    const router = useRouter();
    const { id } = router.query;
    const [vehicle, setVehicle] = useState<any>(null);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [assigning, setAssigning] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch vehicle and available drivers in parallel
                const [vehRes, drvRes] = await Promise.all([
                    fetch(`/api/vehicles/${id}`),
                    fetch('/api/vehicles/available-drivers')
                ]);

                const vehData = await vehRes.json();
                const drvData = await drvRes.json();

                if (vehData.success && drvData.success) {
                    setVehicle(vehData.vehicle);
                    setDrivers(drvData.drivers || []);
                } else {
                    setError('Failed to fetch required vehicle or driver data.');
                }
            } catch (err: any) {
                setError(err.message || 'Network error fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAssignDriver = async (driverProfileId: string, driverName: string) => {
        if (!id) return;
        setAssigning(driverProfileId);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch(`/api/vehicles/${id}/drivers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverProfileId })
            });
            const data = await res.json();

            if (data.success) {
                setSuccessMessage(`Successfully authorized ${driverName} to operate ${vehicle?.plateNumber}! Redirecting to roster...`);
                setTimeout(() => {
                    router.push(`/fleet/vehicles/${id}`);
                }, 2000);
            } else {
                setError(data.message || 'Failed to assign driver.');
            }
        } catch (err: any) {
            setError(err.message || 'Network error assigning driver.');
        } finally {
            setAssigning(null);
        }
    };

    // Filter out drivers that are already currently active in this vehicle's roster
    const currentAssignedDriverIds = new Set(
        vehicle?.vehicleDrivers?.filter((vd: any) => vd.isActive).map((vd: any) => vd.driverProfileId) || []
    );

    const availableDrivers = drivers.filter(d => {
        // Exclude currently assigned
        if (currentAssignedDriverIds.has(d.driverProfileId)) return false;

        // Search query filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            d.fullName.toLowerCase().includes(q) ||
            d.phone.toLowerCase().includes(q) ||
            d.licenseNumber.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <MainLayout title="Loading Available Drivers..." description="Searching operator network.">
                <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-white font-black text-lg tracking-widest uppercase text-blue-400 animate-pulse">Searching Operator Network...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error && !vehicle) {
        return (
            <MainLayout title="Assignment Error" description="Could not load assignment screen.">
                <div className="min-h-screen bg-brand-black py-20 px-4 text-center">
                    <div className="max-w-md mx-auto bg-slate-800/40 p-12 rounded-3xl border border-white/5 shadow-2xl">
                        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Assignment Error</h2>
                        <p className="text-slate-400 mb-8 font-medium">{error}</p>
                        <Link href={`/fleet/vehicles/${id}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-500 text-white font-black uppercase text-sm tracking-widest hover:bg-blue-400 transition-all shadow-lg">
                            <ArrowLeft className="w-5 h-5" /> Back to Vehicle Roster
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={`Assign Driver to ${vehicle?.plateNumber || 'Vehicle'} | Cabi`} description="Search and authorize certified drivers to operate this vehicle.">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Back navigation */}
                    <div>
                        <Link href={`/fleet/vehicles/${id}`} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Vehicle Roster
                        </Link>
                    </div>

                    {/* Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 text-white font-black text-xs uppercase tracking-widest backdrop-blur-md mb-4 border border-white/10">
                                    <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" /> Operator Authorization Protocol
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                                    Assign Operator
                                </h1>
                                <p className="text-white/80 font-medium text-lg max-w-xl">
                                    Grant operating authorization for <span className="text-yellow-400 font-black">{vehicle?.plateNumber}</span> ({vehicle?.year} {vehicle?.make} {vehicle?.model}).
                                </p>
                            </div>
                            <div className="p-6 bg-black/30 rounded-3xl border border-white/20 backdrop-blur-xl flex items-center gap-3">
                                <Car className="w-10 h-10 text-yellow-400" />
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-300">Target Vehicle</span>
                                    <span className="text-xl font-black text-white">{vehicle?.plateNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="bg-emerald-500/20 border border-emerald-500 rounded-3xl p-8 text-center backdrop-blur-xl animate-fadeIn">
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Authorization Granted!</h3>
                            <p className="text-slate-300 font-bold">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-4 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-2xl animate-fadeIn">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search certified operators by name, phone number, or driving license..."
                            className="w-full bg-slate-800/60 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-white placeholder-slate-500 font-bold text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xl backdrop-blur-xl"
                        />
                    </div>

                    {/* Available Drivers List */}
                    <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-blue-400" />
                                <h3 className="text-xl font-black text-white tracking-tight">Available Operator Pool</h3>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs">
                                {availableDrivers.length} Candidates Found
                            </span>
                        </div>

                        {availableDrivers.length === 0 ? (
                            <div className="py-16 text-center bg-black/30 rounded-2xl border border-white/5 p-8">
                                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-white mb-2">No Certified Operators Found</h4>
                                <p className="text-slate-400 font-medium">All existing drivers are either currently assigned to this vehicle's roster or do not match your search query.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {availableDrivers.map((driver) => (
                                    <div key={driver.driverProfileId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-black/30 hover:bg-black/50 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all shadow-lg">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-black text-white shadow-xl text-2xl flex-shrink-0">
                                                {driver.fullName[0] || 'D'}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-white text-xl tracking-tight">{driver.fullName}</h4>
                                                    <span className="flex items-center gap-1 text-xs font-black text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {driver.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono space-x-3">
                                                    <span>📱 {driver.phone}</span>
                                                    <span className="hidden md:inline">✉️ {driver.email}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono">
                                                    License: <span className="text-white font-bold">{driver.licenseNumber}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAssignDriver(driver.driverProfileId, driver.fullName)}
                                            disabled={assigning === driver.driverProfileId || !!successMessage}
                                            className="self-end sm:self-center flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 transform hover:scale-105 active:scale-95 flex-shrink-0"
                                        >
                                            {assigning === driver.driverProfileId ? (
                                                <span className="animate-spin">🔄 Authorizing...</span>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-4 h-4" /> Add to Vehicle Roster
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
