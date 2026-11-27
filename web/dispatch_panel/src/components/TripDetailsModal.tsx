import React, { useState } from 'react';
import {
    X,
    User,
    Phone,
    Mail,
    Star,
    Car,
    Shield,
    MapPin,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    RotateCcw
} from 'lucide-react';
import { RideRequest, Driver, Passenger, TripHistory } from '../types';

interface TripDetailsModalProps {
    trip: RideRequest | TripHistory;
    driver?: Driver | null;
    passenger?: Passenger | null;
    availableDrivers?: Driver[];
    onClose: () => void;
    onAssignDriver?: (rideId: string, driverId: string) => void;
    onCancelRide?: (rideId: string) => void;
    onCompleteRide?: (rideId: string) => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
    trip,
    driver,
    passenger,
    availableDrivers = [],
    onClose,
    onAssignDriver,
    onCancelRide,
    onCompleteRide,
}) => {
    const [selectedReassignDriverId, setSelectedReassignDriverId] = useState<string>('');
    const [isReassigning, setIsReassigning] = useState<boolean>(false);
    const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('Driver vehicle mechanical issue');

    const isCompleted = trip.status === 'completed';
    const isCancelled = trip.status === 'cancelled';
    const isActive = trip.status === 'in-progress' || trip.status === 'accepted' || trip.status === 'assigned';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'COMPLETED',
                    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                    dot: 'bg-emerald-500'
                };
            case 'in-progress':
                return {
                    label: 'TRIP IN PROGRESS',
                    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                    dot: 'bg-amber-500 animate-pulse'
                };
            case 'accepted':
            case 'assigned':
                return {
                    label: 'DRIVER EN ROUTE',
                    bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
                    dot: 'bg-sky-500'
                };
            case 'pending':
                return {
                    label: 'MATCHING DRIVER',
                    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                    dot: 'bg-amber-500 animate-ping'
                };
            case 'cancelled':
                return {
                    label: 'CANCELLED',
                    bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
                    dot: 'bg-rose-500'
                };
            default:
                return {
                    label: status.toUpperCase(),
                    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
                    dot: 'bg-slate-400'
                };
        }
    };

    const statusBadge = getStatusBadge(trip.status);
    const actualFare = (trip as TripHistory).actualFare ?? trip.estimatedFare;
    const durationMin = (trip as TripHistory).duration ?? Math.max(8, Math.round(trip.distance * 2.5));
    const paymentMethod = (trip as TripHistory).paymentMethod ?? 'mobile-money';
    const paymentStatus = (trip as TripHistory).paymentStatus ?? (isCompleted ? 'completed' : isCancelled ? 'failed' : 'pending');

    const handleConfirmReassign = () => {
        if (!selectedReassignDriverId || !onAssignDriver) return;
        onAssignDriver(trip.id, selectedReassignDriverId);
        setIsReassigning(false);
    };

    const handleConfirmCancel = () => {
        if (!onCancelRide) return;
        onCancelRide(trip.id);
        setShowCancelPrompt(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3px] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── 1. MODAL HEADER ── */}
                <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[3px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Car className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Trip Dossier</h3>
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[3px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {trip.id}
                                </span>
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[3px] border flex items-center gap-1.5 ${statusBadge.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                                    {statusBadge.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Requested at {new Date(trip.requestedAt).toLocaleString()} • Priority: <span className="font-bold uppercase text-amber-600 dark:text-amber-400">{trip.priority}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-[3px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── 2. MODAL BODY (SCROLLABLE) ── */}
                <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                    {/* ── PROFILES GRID (DRIVER & PASSENGER) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ── DRIVER PROFILE CARD ── */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[3px] p-5 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-amber-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Assigned Driver Profile</h4>
                                </div>
                                {driver ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        ACTIVE CAPTAIN
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        UNASSIGNED
                                    </span>
                                )}
                            </div>

                            {driver ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-[3px] bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm flex-shrink-0">
                                            {driver.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">{driver.name}</h5>
                                                <span className="flex items-center text-xs font-bold text-amber-500">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                                                    {driver.rating?.toFixed(1) || '4.9'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{driver.phone}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-[3px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                                    {driver.vehiclePlate || 'KDA 892J'}
                                                </span>
                                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                                    {driver.vehicleType || 'Executive Sedan'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Pill Grid */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                        <div className="bg-white dark:bg-slate-800/80 p-2 rounded-[3px] border border-slate-200 dark:border-slate-700/60 text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Completed</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{driver.completedRides || 124}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800/80 p-2 rounded-[3px] border border-slate-200 dark:border-slate-700/60 text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Acceptance</p>
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{driver.acceptanceRate || 96}%</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800/80 p-2 rounded-[3px] border border-slate-200 dark:border-slate-700/60 text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Score</p>
                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{driver.score || 98}</p>
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <a
                                            href={`tel:${driver.phone}`}
                                            className="flex-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-[3px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                            Call Driver
                                        </a>
                                        {isActive && onAssignDriver && (
                                            <button
                                                onClick={() => setIsReassigning(!isReassigning)}
                                                className="py-1.5 px-3 border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-[3px] text-xs font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Reassign
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Driver Assigned</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Select an online driver from the fleet pool</p>
                                    </div>
                                    {availableDrivers.length > 0 && onAssignDriver && (
                                        <div className="pt-2">
                                            <select
                                                value={selectedReassignDriverId}
                                                onChange={(e) => setSelectedReassignDriverId(e.target.value)}
                                                className="w-full text-xs p-2 rounded-[3px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mb-2"
                                            >
                                                <option value="">Choose Available Driver...</option>
                                                {availableDrivers.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name} • {d.vehicleType} (Score: {d.score})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleConfirmReassign}
                                                disabled={!selectedReassignDriverId}
                                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-[3px] transition-all disabled:opacity-50"
                                            >
                                                Assign Captain Immediately
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Inline Reassign Box */}
                            {isReassigning && driver && (
                                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-[3px] space-y-2">
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Reassign to another available driver:</p>
                                    <select
                                        value={selectedReassignDriverId}
                                        onChange={(e) => setSelectedReassignDriverId(e.target.value)}
                                        className="w-full text-xs p-1.5 rounded-[3px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Select replacement driver...</option>
                                        {availableDrivers.filter(d => d.id !== driver.id).map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} • {d.vehicleType} (⭐ {d.rating})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsReassigning(false)}
                                            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmReassign}
                                            disabled={!selectedReassignDriverId}
                                            className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-[3px] disabled:opacity-50"
                                        >
                                            Confirm Reassignment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── PASSENGER PROFILE CARD ── */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[3px] p-5">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-sky-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Passenger Profile</h4>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                                    VERIFIED RIDER
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-[3px] bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0">
                                        {(passenger?.name || trip.passengerName || 'P').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {passenger?.name || trip.passengerName}
                                            </h5>
                                            <span className="flex items-center text-xs font-bold text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                                                {passenger?.rating?.toFixed(1) || '4.8'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                            {passenger?.phone || trip.passengerPhone}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {passenger?.email || `${(trip.passengerName || 'passenger').toLowerCase().replace(/\s+/g, '.')}@cabi.africa`}
                                        </p>
                                    </div>
                                </div>

                                {/* Passenger History Metrics */}
                                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                    <div className="bg-white dark:bg-slate-800/80 p-2 rounded-[3px] border border-slate-200 dark:border-slate-700/60 text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Rides</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{passenger?.totalRides || 28}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800/80 p-2 rounded-[3px] border border-slate-200 dark:border-slate-700/60 text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Spend Tier</p>
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            KES {((passenger?.totalSpent || 18450) / 1000).toFixed(1)}k
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800/80 p-2 rounded-[3px] border border-slate-200 dark:border-slate-700/60 text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">VIP Status</p>
                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Gold Exec</p>
                                    </div>
                                </div>

                                {/* Passenger Action Row */}
                                <div className="flex items-center gap-2 pt-1">
                                    <a
                                        href={`tel:${passenger?.phone || trip.passengerPhone}`}
                                        className="flex-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-[3px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                        Call Passenger
                                    </a>
                                    <a
                                        href={`mailto:${passenger?.email || 'passenger@cabi.africa'}`}
                                        className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[3px] text-xs font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ROUTE & TELEMETRY SECTION ── */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[3px] p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-amber-500" />
                                Route & Navigation Telemetry
                            </h4>
                            <div className="flex items-center gap-3 text-xs font-bold">
                                <span className="text-slate-600 dark:text-slate-300">{trip.distance} km</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 dark:text-slate-300">~{durationMin} mins</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Pickup */}
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Pickup Location</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{trip.pickupLocation.address}</p>
                                    <p className="text-[11px] font-mono text-slate-400">
                                        GPS: {trip.pickupLocation.lat.toFixed(5)}, {trip.pickupLocation.lng.toFixed(5)}
                                    </p>
                                </div>
                            </div>

                            {/* Dropoff */}
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">Destination</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{trip.dropoffLocation.address}</p>
                                    <p className="text-[11px] font-mono text-slate-400">
                                        GPS: {trip.dropoffLocation.lat.toFixed(5)}, {trip.dropoffLocation.lng.toFixed(5)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── FINANCIAL & PAYMENT BREAKDOWN ── */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[3px] p-5">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2 mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                Financial & Payment Telemetry
                            </h4>
                            <span className="text-xs font-mono font-bold text-slate-500">KES / Kenya Shillings</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Total Fare</p>
                                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                    KES {actualFare.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Payment Channel</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                                    {paymentMethod === 'mobile-money' ? 'M-Pesa / Mobile Money' : paymentMethod}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Payment Status</p>
                                <p className={`text-sm font-bold uppercase ${paymentStatus === 'completed'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : paymentStatus === 'pending'
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {paymentStatus}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Platform Split</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    KES {Math.round(actualFare * 0.82)} driver • {Math.round(actualFare * 0.18)} cabi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Prompt */}
                    {showCancelPrompt && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-[3px] p-4 space-y-3">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                                <AlertTriangle className="w-4 h-4" />
                                Confirm Dispatch Cancellation for Trip {trip.id}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Cancelling this trip will immediately notify the passenger and release the assigned driver back to the active fleet.
                            </p>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Cancellation Reason</label>
                                <select
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full text-xs p-2 rounded-[3px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mt-1"
                                >
                                    <option value="Driver vehicle mechanical issue">Driver vehicle mechanical issue</option>
                                    <option value="Passenger unreachable / no-show">Passenger unreachable / no-show</option>
                                    <option value="Major road closure / security blockade">Major road closure / security blockade</option>
                                    <option value="Dispatch operator emergency override">Dispatch operator emergency override</option>
                                    <option value="Duplicate request">Duplicate request</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowCancelPrompt(false)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-[3px]"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-[3px] transition-colors"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 3. MODAL FOOTER / DISPATCH CONTROLS ── */}
                <div className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Dispatch Audit:</span>
                        <span className="text-xs font-mono text-slate-700 dark:text-slate-300">OP-STATION-01 • LOGGED</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isActive && onCompleteRide && (
                            <button
                                onClick={() => {
                                    onCompleteRide(trip.id);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Force Complete Trip
                            </button>
                        )}
                        {isActive && onCancelRide && !showCancelPrompt && (
                            <button
                                onClick={() => setShowCancelPrompt(true)}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-[3px] text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel Trip
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-[3px] text-xs font-bold transition-colors"
                        >
                            Close Dossier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDetailsModal;
