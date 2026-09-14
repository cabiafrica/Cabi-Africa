import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Car, Shield, Users, Clock, AlertCircle, ArrowLeft, Plus, CheckCircle2, Trash2, UserPlus, Activity, FileText, Sparkles, Phone, Mail, Loader2, Wrench } from 'lucide-react';

export default function FleetVehicleDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unassigning, setUnassigning] = useState<string | null>(null);

    const fetchVehicleDetail = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/vehicles/${id}`);
            const data = await res.json();
            if (data.success) {
                setVehicle(data.vehicle);
            } else {
                setError(data.message || 'Failed to fetch vehicle details');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicleDetail();
    }, [id]);

    const handleUnassignDriver = async (driverProfileId: string, driverName: string) => {
        if (!confirm(`Are you sure you want to revoke operating authorization for ${driverName}? They will be immediately unassigned from this vehicle's roster.`)) {
            return;
        }

        setUnassigning(driverProfileId);
        try {
            const res = await fetch(`/api/vehicles/${id}/drivers/${driverProfileId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                // Refresh list
                await fetchVehicleDetail();
            } else {
                alert(data.message || 'Failed to unassign driver');
            }
        } catch (err: any) {
            alert(err.message || 'Network error');
        } finally {
            setUnassigning(null);
        }
    };

    if (loading) {
        return (
            <MainLayout title="Loading Vehicle Roster..." description="Fetching vehicle telemetry and authorized operators.">
                <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-white font-black text-lg tracking-widest uppercase text-blue-400 animate-pulse">Loading Roster & Telemetry...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !vehicle) {
        return (
            <MainLayout title="Vehicle Not Found" description="Could not load vehicle details.">
                <div className="min-h-screen bg-brand-black py-20 px-4 text-center">
                    <div className="max-w-md mx-auto bg-slate-800/40 p-12 rounded-3xl border border-white/5 shadow-2xl">
                        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Vehicle Not Found</h2>
                        <p className="text-slate-400 mb-8 font-medium">{error || 'The requested vehicle could not be loaded.'}</p>
                        <Link href="/fleet/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-500 text-white font-black uppercase text-sm tracking-widest hover:bg-blue-400 transition-all shadow-lg">
                            <ArrowLeft className="w-5 h-5" /> Back to Fleet Command
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const activeShift = vehicle.vehicleShifts?.find((s: any) => s.status === 'ACTIVE');

    return (
        <MainLayout title={`Fleet: ${vehicle.plateNumber} | Cabi`} description="Manage authorized driver roster and telemetry for this vehicle.">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Back navigation */}
                    <div>
                        <Link href="/fleet/dashboard" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Fleet Command Center
                        </Link>
                    </div>

                    {/* Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-slate-800/60 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl border border-blue-400/30">
                                    <Car className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{vehicle.plateNumber}</h1>
                                        {activeShift && (
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-widest animate-pulse">
                                                Active Shift
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 font-bold text-lg">
                                        {vehicle.year} {vehicle.make} {vehicle.model} • <span className="text-blue-400">{vehicle.usage}</span>
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/fleet/vehicles/${vehicle.id}/assign-driver`}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all transform hover:scale-105"
                            >
                                <UserPlus className="w-5 h-5" /> Assign Authorized Driver
                            </Link>
                        </div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left & Center: Driver Roster */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                            <Users className="w-7 h-7 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">Authorized Operator Roster</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active assigned drivers allowed to start shifts on this vehicle</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-sm">
                                        {vehicle.vehicleDrivers?.length || 0} Assigned
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {vehicle.vehicleDrivers && vehicle.vehicleDrivers.length > 0 ? (
                                        vehicle.vehicleDrivers.map((vd: any) => {
                                            const driverName = vd.driver?.user ? `${vd.driver.user.firstName || ''} ${vd.driver.user.lastName || ''}`.trim() : 'Authorized Driver';
                                            const phone = vd.driver?.user?.phone || 'No phone listed';
                                            const email = vd.driver?.user?.email || 'No email listed';
                                            const isCurrentlyOnShift = activeShift?.driverProfileId === vd.driverProfileId;

                                            return (
                                                <div key={vd.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-black/30 rounded-2xl border border-white/5 transition-all hover:border-white/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-black text-white shadow-xl text-xl flex-shrink-0">
                                                            {driverName[0] || 'D'}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-black text-white text-xl tracking-tight">{driverName}</h4>
                                                                {isCurrentlyOnShift && (
                                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                                                        <Activity className="w-3 h-3 text-emerald-400" /> Active Shift
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>
                                                                <span className="hidden md:flex items-center gap-1"><Mail className="w-3 h-3" /> {email}</span>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                                Assigned: {new Date(vd.assignedAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleUnassignDriver(vd.driverProfileId, driverName)}
                                                        disabled={unassigning === vd.driverProfileId || isCurrentlyOnShift}
                                                        title={isCurrentlyOnShift ? "Cannot remove driver while actively on shift" : "Revoke driver authorization"}
                                                        className="self-end sm:self-center flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40"
                                                    >
                                                        {unassigning === vd.driverProfileId ? (
                                                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Revoking...</span>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4" /> Revoke Access
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-16 text-center bg-black/30 rounded-2xl border border-white/5 p-8">
                                            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400 font-medium mb-4">No drivers currently assigned to this vehicle's operating roster.</p>
                                            <Link href={`/fleet/vehicles/${vehicle.id}/assign-driver`} className="text-blue-400 hover:text-blue-300 font-black uppercase text-xs tracking-widest underline">
                                                Assign Driver Now →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Telemetry & Claim History Sidebar */}
                        <div className="space-y-8">
                            {/* Live Telemetry Card */}
                            <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                        <Activity className="w-7 h-7 text-emerald-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">Shift Telemetry</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Real-time status</p>
                                    </div>
                                </div>

                                {activeShift ? (
                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Current Operator</span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest animate-pulse">Live</span>
                                        </div>
                                        <p className="text-2xl font-black text-white">
                                            {activeShift.driver?.user ? `${activeShift.driver.user.firstName} ${activeShift.driver.user.lastName}` : 'Authorized Driver'}
                                        </p>
                                        <div className="text-xs text-emerald-400 font-mono flex items-center gap-2 pt-2 border-t border-emerald-500/20">
                                            <Clock className="w-4 h-4 flex-shrink-0" /> Started at {new Date(activeShift.startTime).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-black/30 rounded-2xl border border-white/5 text-center space-y-2">
                                        <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                                        <p className="font-bold text-white">Vehicle in Standby</p>
                                        <p className="text-xs text-slate-400">No driver is currently executing an active shift on this vehicle.</p>
                                    </div>
                                )}
                            </div>

                            {/* Claims History */}
                            <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                                            <FileText className="w-7 h-7 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight">Maintenance Logs</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Benefit self-reports</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {vehicle.benefitClaims && vehicle.benefitClaims.length > 0 ? (
                                        vehicle.benefitClaims.map((claim: any) => (
                                            <div key={claim.id} className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Wrench className="w-4 h-4 text-slate-400" />
                                                        <span className="font-black text-white text-sm">{claim.benefit?.name || 'Maintenance'}</span>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        claim.status === 'APPROVED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                                        claim.status === 'REJECTED' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                                        'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 animate-pulse'
                                                    }`}>
                                                        {claim.status}
                                                    </span>
                                                </div>
                                                {claim.notes && <p className="text-xs text-slate-300 italic">"{claim.notes}"</p>}
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                                                    Filed: {new Date(claim.reportedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-400 font-medium p-6 bg-black/30 rounded-2xl border border-white/5 text-center text-xs">
                                            No maintenance records or benefit claims logged.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
