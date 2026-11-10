import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Car, Shield, Play, Square, AlertCircle, Plus, CheckCircle2, Clock, Sparkles, Award, ArrowRight, Activity, Loader2 } from 'lucide-react';

export default function MyVehiclesPage() {
    const { user, loading: authLoading } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [conflictModal, setConflictModal] = useState<{ show: boolean; title: string; message: string; data?: any }>({ show: false, title: '', message: '' });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Mock driverProfileId for testing if user profile ID is not mapped
    const driverProfileId = user?.driverProfileId || user?.id || 'mock-driver-123';

    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/vehicles?driverProfileId=${driverProfileId}`);
            const data = await res.json();
            if (data.success) {
                setVehicles(data.vehicles);
            } else {
                setError(data.message || 'Failed to fetch vehicles');
            }
        } catch (err: any) {
            setError(err.message || 'Network error fetching vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchVehicles();
        }
    }, [authLoading]);

    const handleStartShift = async (vehicleId: string) => {
        setActionLoading(vehicleId);
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await fetch('/api/vehicles/shifts/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId, driverProfileId })
            });
            const data = await res.json();

            if (res.status === 409) {
                setConflictModal({
                    show: true,
                    title: 'Shift Exclusivity Conflict',
                    message: data.message,
                    data: data.currentShift
                });
            } else if (data.success) {
                setSuccessMessage('Shift started successfully! Drive safely.');
                fetchVehicles();
            } else {
                setError(data.message || 'Failed to start shift');
            }
        } catch (err: any) {
            setError(err.message || 'Network error starting shift');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEndShift = async (vehicleId: string) => {
        setActionLoading(vehicleId);
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await fetch('/api/vehicles/shifts/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId, driverProfileId })
            });
            const data = await res.json();

            if (data.success) {
                setSuccessMessage('Shift ended successfully.');
                fetchVehicles();
            } else {
                setError(data.message || 'Failed to end shift');
            }
        } catch (err: any) {
            setError(err.message || 'Network error ending shift');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <MainLayout title="My Vehicles & Shifts | Cabi Driver Portal" description="Manage your registered vehicles, start shifts, and report benefit claims.">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-8 sm:p-12 mb-12 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 text-black font-black text-xs uppercase tracking-widest backdrop-blur-md mb-4">
                                    <Sparkles className="w-4 h-4 text-black animate-spin" /> Live Fleet Radar Active
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-2">
                                    My Vehicles & Shifts
                                </h1>
                                <p className="text-black/80 font-medium text-lg max-w-xl">
                                    Start active shifts to start operating on the CABI network, review your vehicle accounts, and report benefit claims.
                                </p>
                            </div>
                            <Link
                                href="/vehicles/register"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface-dark hover:bg-card-dark border border-[#D4AF37]/30 text-[#FACC15] hover:text-[#ffe088] font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5" /> Register New Vehicle
                            </Link>
                        </div>
                    </div>

                    {/* Notifications / Alerts */}
                    {successMessage && (
                        <div className="flex items-center gap-4 bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-2xl mb-8 animate-fadeIn">
                            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                            <span className="font-bold">{successMessage}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-4 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-2xl mb-8 animate-fadeIn">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    {/* Vehicles Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="bg-card-dark rounded-3xl p-8 border border-[#D4AF37]/10 animate-pulse h-80" />
                            ))}
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-20 bg-card-dark/90 rounded-3xl border border-[#D4AF37]/20 backdrop-blur-xl p-12 shadow-2xl max-w-2xl mx-auto">
                            <Car className="w-20 h-20 text-yellow-500/50 mx-auto mb-6 animate-bounce" />
                            <h3 className="text-2xl font-black text-white mb-3">No Vehicles Registered</h3>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                You do not have any vehicles registered or assigned to your driver account yet. Register your vehicle or ask your Fleet Manager to assign you.
                            </p>
                            <Link
                                href="/vehicles/register"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-sm tracking-widest transition-all shadow-lg"
                            >
                                <Plus className="w-5 h-5" /> Add My First Vehicle
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {vehicles.map((vehicle) => {
                                const hasActiveShift = vehicle.vehicleShifts?.some((s: any) => s.status === 'ACTIVE');
                                const activeShift = vehicle.vehicleShifts?.find((s: any) => s.status === 'ACTIVE');

                                return (
                                    <div
                                        key={vehicle.id}
                                        className={`group relative rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between ${
                                            hasActiveShift
                                                ? 'bg-gradient-to-b from-card-dark to-surface-dark border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.15)]'
                                                : 'bg-card-dark/80 hover:bg-card-dark border-white/10 hover:border-[#D4AF37]/30'
                                        } backdrop-blur-xl p-8`}
                                    >
                                        <div>
                                            {/* Header Card */}
                                            <div className="flex items-start justify-between gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-2xl font-black tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                                                            {vehicle.plateNumber}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white/80">
                                                            {vehicle.usage}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 font-bold text-sm">
                                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                                    <Car className="w-6 h-6 text-yellow-500" />
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="mb-8">
                                                {hasActiveShift ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase tracking-widest animate-pulse">
                                                        <Activity className="w-4 h-4 animate-spin" /> Active Shift in Progress
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-700/50 border border-slate-600 text-slate-300 font-bold text-xs uppercase tracking-widest">
                                                        <Clock className="w-4 h-4" /> Shift Inactive
                                                    </div>
                                                )}
                                            </div>

                                            {/* Vehicle Stats Bar */}
                                            <div className="grid grid-cols-2 gap-4 bg-black/30 rounded-2xl p-4 border border-white/5 mb-8">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Claims Filed</div>
                                                    <div className="text-xl font-black text-white">{vehicle.benefitClaims?.length || 0}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Owner</div>
                                                    <div className="text-sm font-bold text-slate-300 truncate">{vehicle.ownerName || 'Self'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            {hasActiveShift ? (
                                                <button
                                                    onClick={() => handleEndShift(vehicle.id)}
                                                    disabled={actionLoading === vehicle.id}
                                                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-600/30"
                                                >
                                                    {actionLoading === vehicle.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Square className="w-4 h-4 fill-current" /> End Active Shift
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartShift(vehicle.id)}
                                                    disabled={actionLoading === vehicle.id}
                                                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 text-black font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20"
                                                >
                                                    {actionLoading === vehicle.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4 fill-current" /> Start Shift
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <Link
                                                href={`/drivers/vehicles/${vehicle.id}`}
                                                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest transition-all border border-white/10"
                                            >
                                                Account Details <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Exclusivity Conflict Modal */}
                {conflictModal.show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
                        <div className="bg-surface-dark border border-red-500/30 rounded-3xl max-w-xl w-full p-8 sm:p-12 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-4 text-red-500 mb-6">
                                <div className="p-4 bg-red-500/20 rounded-2xl border border-red-500/30">
                                    <AlertCircle className="w-10 h-10 animate-bounce" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">{conflictModal.title}</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-red-400">Mutual Exclusivity Enforcement</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">
                                {conflictModal.message}
                            </p>
                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8">
                                <div className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-2">Conflicting Shift Details</div>
                                <div className="text-sm text-slate-300">
                                    <span className="font-bold text-white">Started At:</span> {conflictModal.data?.startedAt ? new Date(conflictModal.data.startedAt).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setConflictModal({ show: false, title: '', message: '' })}
                                    className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black uppercase text-sm tracking-widest transition-all"
                                >
                                    Understood & Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
