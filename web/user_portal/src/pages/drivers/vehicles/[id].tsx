import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Car, Shield, CheckCircle2, AlertCircle, Clock, Sparkles, Award, ArrowLeft, Plus, FileText, UserCheck, Calendar, Trophy, Wrench, ExternalLink } from 'lucide-react';

export default function VehicleAccountPage() {
    const router = useRouter();
    const { id } = router.query;
    const [vehicle, setVehicle] = useState<any>(null);
    const [unlockedQualifications, setUnlockedQualifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchVehicleDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/vehicles/${id}`);
                const data = await res.json();
                if (data.success) {
                    setVehicle(data.vehicle);
                    setUnlockedQualifications(data.unlockedQualifications || []);
                } else {
                    setError(data.message || 'Failed to fetch vehicle account');
                }
            } catch (err: any) {
                setError(err.message || 'Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicleDetail();
    }, [id]);

    if (loading) {
        return (
            <MainLayout title="Loading Vehicle Account..." description="Fetching vehicle details and qualifications.">
                <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-white font-black text-lg tracking-widest uppercase text-yellow-500 animate-pulse">Loading Vehicle Account...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !vehicle) {
        return (
            <MainLayout title="Vehicle Not Found" description="Could not load vehicle account details.">
                <div className="min-h-screen bg-brand-black py-20 px-4 text-center">
                    <div className="max-w-md mx-auto bg-slate-800/40 p-12 rounded-3xl border border-white/5 shadow-2xl">
                        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Account Not Found</h2>
                        <p className="text-slate-400 mb-8 font-medium">{error || 'The requested vehicle could not be loaded.'}</p>
                        <Link href="/drivers/vehicles" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-500 text-black font-black uppercase text-sm tracking-widest hover:bg-yellow-400 transition-all shadow-lg">
                            <ArrowLeft className="w-5 h-5" /> Back to My Vehicles
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const hasActiveShift = vehicle.vehicleShifts?.some((s: any) => s.status === 'ACTIVE');

    return (
        <MainLayout title={`${vehicle.plateNumber} Account | Cabi`} description="View vehicle benefits, active shifts, unlocked qualifications, and claim history.">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back navigation */}
                    <div className="mb-8">
                        <Link href="/drivers/vehicles" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-yellow-400 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> My Vehicles
                        </Link>
                    </div>

                    {/* Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-slate-800/60 border border-white/10 p-8 sm:p-12 mb-12 shadow-2xl backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-6 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl shadow-xl border border-yellow-400/30">
                                    <Car className="w-12 h-12 text-black" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{vehicle.plateNumber}</h1>
                                        {hasActiveShift && (
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-widest animate-pulse">
                                                Active Shift
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 font-bold text-lg">
                                        {vehicle.year} {vehicle.make} {vehicle.model} • <span className="text-yellow-400">{vehicle.usage}</span>
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/drivers/vehicles/${vehicle.id}/report-benefit`}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-widest shadow-xl transition-all transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5" /> Self-Report Benefit Claim
                            </Link>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left & Center: Qualifications & Roster */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Unlocked Qualifications */}
                            <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-500/30">
                                            <Award className="w-7 h-7 text-yellow-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">Unlocked Qualifications</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Achieved through approved vehicle benefits</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-black text-sm">
                                        {unlockedQualifications.length} Unlocked
                                    </span>
                                </div>

                                {unlockedQualifications.length === 0 ? (
                                    <div className="text-center py-12 bg-black/30 rounded-2xl border border-white/5 p-8">
                                        <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium mb-4">No qualifications unlocked yet. Submit and get benefit claims approved to unlock premium rewards and priority dispatch!</p>
                                        <Link href={`/drivers/vehicles/${vehicle.id}/report-benefit`} className="text-yellow-400 hover:text-yellow-300 font-black uppercase text-xs tracking-widest underline">
                                            Submit Claim Now →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {unlockedQualifications.map((qual) => (
                                            <div key={qual.id} className="relative bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-2xl border border-yellow-500/30 p-6 flex items-start gap-4 shadow-xl">
                                                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center">
                                                    <Trophy className="w-8 h-8 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-white mb-1 tracking-tight">{qual.name}</h4>
                                                    <p className="text-slate-400 text-xs mb-3">{qual.description}</p>
                                                    <div className="inline-block px-3 py-1 bg-yellow-500 text-black font-black text-[10px] uppercase tracking-widest rounded-full shadow">
                                                        {qual.rewardLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Driver Roster */}
                            <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                        <UserCheck className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Assigned Driver Roster</h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active authorized operators for this vehicle</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {vehicle.vehicleDrivers && vehicle.vehicleDrivers.length > 0 ? (
                                        vehicle.vehicleDrivers.map((vd: any) => (
                                            <div key={vd.id} className="flex items-center justify-between p-5 bg-black/30 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-black text-white shadow-lg text-lg">
                                                        {vd.driver?.user?.firstName?.[0] || 'D'}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white text-lg">
                                                            {vd.driver?.user ? `${vd.driver.user.firstName} ${vd.driver.user.lastName}` : 'Authorized Driver'}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono">{vd.driver?.user?.phone || 'No phone listed'}</div>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-widest">
                                                    Active Operator
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-400 font-medium p-6 bg-black/30 rounded-2xl border border-white/5 text-center">
                                            No drivers assigned in the roster yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Claim History Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                                            <FileText className="w-7 h-7 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight">Claims History</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Benefit self-reports</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {vehicle.benefitClaims && vehicle.benefitClaims.length > 0 ? (
                                        vehicle.benefitClaims.map((claim: any) => (
                                            <div key={claim.id} className="p-5 bg-black/30 rounded-2xl border border-white/5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-yellow-500">
                                                            <Wrench className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-black text-white">{claim.benefit?.name || 'Benefit Claim'}</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        claim.status === 'APPROVED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                                        claim.status === 'REJECTED' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                                        'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 animate-pulse'
                                                    }`}>
                                                        {claim.status}
                                                    </span>
                                                </div>
                                                {claim.notes && <p className="text-xs text-slate-300 italic">"{claim.notes}"</p>}
                                                {claim.rejectionReason && <p className="text-xs text-red-400 font-bold bg-red-500/10 p-2 rounded">Rejection: {claim.rejectionReason}</p>}
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                                                    <span>{new Date(claim.reportedAt).toLocaleDateString()}</span>
                                                    {claim.evidenceUrl && (
                                                        <a href={claim.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline flex items-center gap-1">
                                                            View Evidence <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-400 font-medium p-8 bg-black/30 rounded-2xl border border-white/5 text-center">
                                            No benefit claims submitted for this vehicle.
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
