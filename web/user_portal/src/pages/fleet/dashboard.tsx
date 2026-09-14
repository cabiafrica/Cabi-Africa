import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Car, Shield, Users, Clock, AlertCircle, ArrowRight, Plus, CheckCircle2, Sparkles, Activity, FileText, Share2, Layers } from 'lucide-react';

export default function FleetDashboardPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'shared'>('all');

    // Default or mock fleet manager ID
    const fleetManagerId = user?.fleetManagerId || 'mock-fleet-manager-1';

    const fetchFleetVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/vehicles?fleetManagerId=${fleetManagerId}`);
            const data = await res.json();
            if (data.success) {
                setVehicles(data.vehicles || []);
            } else {
                setError(data.message || 'Failed to fetch fleet vehicles');
            }
        } catch (err: any) {
            setError(err.message || 'Network error loading fleet');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFleetVehicles();
    }, [fleetManagerId]);

    // KPI Calculations
    const totalVehicles = vehicles.length;
    const activeShiftsCount = vehicles.filter(v => v.vehicleShifts?.some((s: any) => s.status === 'ACTIVE')).length;
    const sharedVehiclesCount = vehicles.filter(v => v.isShared).length;
    const totalAssignedDrivers = vehicles.reduce((acc, v) => acc + (v.vehicleDrivers?.length || 0), 0);

    // Filtered vehicles
    const filteredVehicles = vehicles.filter(v => {
        if (activeTab === 'active') {
            return v.vehicleShifts?.some((s: any) => s.status === 'ACTIVE');
        }
        if (activeTab === 'shared') {
            return v.isShared;
        }
        return true;
    });

    return (
        <MainLayout title="Fleet Manager Command Center | Cabi" description="Real-time vehicle telemetry, driver roster management, and shift tracking for fleet owners.">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-slate-800/60 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs uppercase tracking-widest mb-4">
                                    <Shield className="w-4 h-4 text-blue-400 animate-pulse" /> Fleet Command Portal
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                                    Fleet Operations
                                </h1>
                                <p className="text-slate-400 font-medium text-lg max-w-xl">
                                    Manage multi-driver rosters, track live shifts, and oversee maintenance benefit claims across your entire vehicle fleet.
                                </p>
                            </div>

                            <button
                                onClick={() => alert('Vehicle registration module coming soon.')}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5" /> Register New Vehicle
                            </button>
                        </div>
                    </div>

                    {/* KPI Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-800/40 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Fleet</p>
                                <h3 className="text-4xl font-black text-white tracking-tight">{totalVehicles}</h3>
                            </div>
                            <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                <Car className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-slate-800/40 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active on Shift</p>
                                <h3 className="text-4xl font-black text-emerald-400 tracking-tight">{activeShiftsCount}</h3>
                            </div>
                            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
                            </div>
                        </div>

                        <div className="bg-slate-800/40 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Operators</p>
                                <h3 className="text-4xl font-black text-purple-400 tracking-tight">{totalAssignedDrivers}</h3>
                            </div>
                            <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                                <Users className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>

                        <div className="bg-slate-800/40 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Shared Vehicles</p>
                                <h3 className="text-4xl font-black text-yellow-400 tracking-tight">{sharedVehiclesCount}</h3>
                            </div>
                            <div className="p-4 bg-yellow-500/20 rounded-2xl border border-yellow-500/30">
                                <Share2 className="w-8 h-8 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                activeTab === 'all' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800/40 text-slate-400 hover:text-white border border-white/5'
                            }`}
                        >
                            All Vehicles ({totalVehicles})
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                activeTab === 'active' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-800/40 text-slate-400 hover:text-white border border-white/5'
                            }`}
                        >
                            Active Shifts ({activeShiftsCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('shared')}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                activeTab === 'shared' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-slate-800/40 text-slate-400 hover:text-white border border-white/5'
                            }`}
                        >
                            Shared Fleet ({sharedVehiclesCount})
                        </button>
                    </div>

                    {/* Vehicles Grid / List */}
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Fleet Operations Data...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-3xl text-center max-w-lg mx-auto backdrop-blur-xl">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-white mb-2">Error Loading Fleet</h3>
                            <p className="text-slate-300 mb-6 text-sm">{error}</p>
                            <button
                                onClick={() => fetchFleetVehicles()}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="py-20 bg-slate-800/20 border border-white/5 rounded-3xl text-center p-8 backdrop-blur-xl">
                            <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-white mb-2">No Vehicles Found</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-6">There are no vehicles matching the selected filter criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredVehicles.map((vehicle) => {
                                const activeShift = vehicle.vehicleShifts?.find((s: any) => s.status === 'ACTIVE');
                                const rosterCount = vehicle.vehicleDrivers?.length || 0;

                                return (
                                    <div key={vehicle.id} className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-white/10 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 shadow-2xl flex flex-col justify-between backdrop-blur-xl">
                                        <div>
                                            {/* Top Row: Plate & Status */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 group-hover:scale-110 transition-transform">
                                                        <Car className="w-7 h-7 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white tracking-tight">{vehicle.plateNumber}</h3>
                                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{vehicle.usage}</span>
                                                    </div>
                                                </div>

                                                {activeShift ? (
                                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live Shift
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full bg-slate-700/50 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                        Standby
                                                    </span>
                                                )}
                                            </div>

                                            {/* Make/Model & Specs */}
                                            <div className="space-y-1 mb-6">
                                                <p className="text-lg font-black text-white">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                                {vehicle.isShared ? (
                                                    <span className="inline-block px-2.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                                                        Shared Vehicle Roster
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                                                        Dedicated Driver
                                                    </span>
                                                )}
                                            </div>

                                            {/* Live Telemetry Info */}
                                            {activeShift && (
                                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6 space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-black text-emerald-300 uppercase tracking-widest">
                                                        <Activity className="w-4 h-4 text-emerald-400" /> Active Operator
                                                    </div>
                                                    <p className="font-bold text-white text-sm">
                                                        {activeShift.driver?.user ? `${activeShift.driver.user.firstName} ${activeShift.driver.user.lastName}` : 'Assigned Operator'}
                                                    </p>
                                                    <p className="text-xs text-emerald-400/80 font-mono">Started: {new Date(activeShift.startTime).toLocaleTimeString()}</p>
                                                </div>
                                            )}

                                            {/* Roster & Claims Summary */}
                                            <div className="grid grid-cols-2 gap-3 p-4 bg-black/30 rounded-2xl border border-white/5 mb-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roster Size</span>
                                                    <span className="text-lg font-black text-white flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-blue-400" /> {rosterCount} Operators
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claims Filed</span>
                                                    <span className="text-lg font-black text-white flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-purple-400" /> {vehicle.benefitClaims?.length || 0} Claims
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                            <Link
                                                href={`/fleet/vehicles/${vehicle.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                                            >
                                                Manage Roster & Telemetry <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
