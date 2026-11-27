import { useState } from 'react';
import { ExternalLink, User, Car } from 'lucide-react';
import { RideRequest, Driver, Passenger } from '../types';
import TripDetailsModal from './TripDetailsModal';

interface RideRequestsListProps {
    rideRequests: RideRequest[];
    drivers: Driver[];
    passengers?: Passenger[];
    onAssignDriver: (rideId: string, driverId: string) => void;
    onCancelRide: (rideId: string) => void;
    onCompleteRide?: (rideId: string) => void;
    selectedRide: RideRequest | null;
    onSelectRide: (ride: RideRequest | null) => void;
}

const RideRequestsList = ({
    rideRequests,
    drivers,
    passengers = [],
    onAssignDriver,
    onCancelRide,
    onCompleteRide,
    selectedRide,
    onSelectRide,
}: RideRequestsListProps) => {
    const [inspectedRide, setInspectedRide] = useState<RideRequest | null>(null);
    const getStatusColor = (status: RideRequest['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'assigned':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'accepted':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'in-progress':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'completed':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getPriorityColor = (priority: RideRequest['priority']) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500 text-white';
            case 'high':
                return 'bg-orange-500 text-white';
            case 'medium':
                return 'bg-yellow-500 text-white';
            case 'low':
                return 'bg-amber-500 text-black';
            default:
                return 'bg-slate-500 text-white';
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    const availableDrivers = drivers.filter(d => d.status === 'online');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Ride Requests List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        All Requests ({rideRequests.length})
                    </h3>
                    <div className="flex gap-2">
                        <button className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-[3px] border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors">
                            Filter
                        </button>
                        <button className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black rounded-[3px] text-xs font-bold transition-all shadow-sm">
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {rideRequests.map((ride) => (
                        <div
                            key={ride.id}
                            onClick={() => onSelectRide(ride)}
                            className={`bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-[3px] p-5 cursor-pointer transition-all duration-200 hover:border-amber-500/50 ${selectedRide?.id === ride.id
                                    ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                                    : 'border-slate-200 dark:border-slate-800/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-sm">
                                        {ride.passengerName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-bold">{ride.passengerName}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{ride.passengerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[3px] ${getPriorityColor(ride.priority)}`}>
                                        {ride.priority.toUpperCase()}
                                    </span>
                                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[3px] border ${getStatusColor(ride.status)}`}>
                                        {ride.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Pickup</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ride.pickupLocation.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Dropoff</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ride.dropoffLocation.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{getTimeAgo(ride.requestedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <span>{ride.distance} km</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                        <span>KES {ride.estimatedFare}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {ride.assignedDriverId && (
                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                            Captain: {drivers.find(d => d.id === ride.assignedDriverId)?.name}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInspectedRide(ride);
                                        }}
                                        className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-[3px] flex items-center gap-1 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Dossier
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ride Details / Driver Assignment Panel */}
            <div className="lg:col-span-1">
                {selectedRide ? (
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-6 sticky top-0 shadow-lg space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Dispatch View</h3>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{selectedRide.id}</p>
                            </div>
                            <button
                                onClick={() => onSelectRide(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Open Full Dossier Button */}
                        <button
                            onClick={() => setInspectedRide(selectedRide)}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-[3px] flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open Full Trip & Profiles Dossier
                        </button>

                        {/* Passenger Mini Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-sky-500" /> Passenger
                                </span>
                                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">Verified</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedRide.passengerName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{selectedRide.passengerPhone}</p>
                        </div>

                        {/* Assigned Driver Mini Card */}
                        {selectedRide.assignedDriverId ? (
                            (() => {
                                const driver = drivers.find(d => d.id === selectedRide.assignedDriverId);
                                return driver ? (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <Car className="w-3.5 h-3.5 text-amber-500" /> Assigned Captain
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">⭐ {driver.rating}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{driver.name}</p>
                                            <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-[3px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                                {driver.vehiclePlate || 'KDA 892J'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">{driver.vehicleType} • {driver.phone}</p>
                                    </div>
                                ) : null;
                            })()
                        ) : (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[3px] text-center">
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">No Captain Assigned</p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Estimated Fare</span>
                                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">KES {selectedRide.estimatedFare}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-slate-400">Distance</span>
                                <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedRide.distance} km</span>
                            </div>
                        </div>

                        {selectedRide.status === 'pending' && (
                            <>
                                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-3 pt-2">
                                    Available Drivers ({availableDrivers.length})
                                </h4>
                                <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                                    {availableDrivers.map((driver) => (
                                        <button
                                            key={driver.id}
                                            onClick={() => onAssignDriver(selectedRide.id, driver.id)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/50 rounded-[3px] p-3 text-left transition-all duration-150"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-slate-900 dark:text-white font-bold text-sm">{driver.name}</span>
                                                <span className="text-[10px] font-bold bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-[3px] border border-green-500/20">
                                                    Score: {driver.score}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span>{driver.vehicleType}</span>
                                                <span>•</span>
                                                <span>⭐ {driver.rating}</span>
                                                <span>•</span>
                                                <span>{driver.acceptanceRate}% acceptance</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => onCancelRide(selectedRide.id)}
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-[3px] py-2.5 text-xs font-bold transition-colors"
                                >
                                    Cancel Request
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-6 h-full flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Select a ride to view details</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Comprehensive Trip Details & Counterpart Profiles Modal */}
            {inspectedRide && (
                <TripDetailsModal
                    trip={inspectedRide}
                    driver={drivers.find(d => d.id === inspectedRide.assignedDriverId || d.activeRideId === inspectedRide.id)}
                    passenger={passengers.find(p => p.id === inspectedRide.passengerId)}
                    availableDrivers={availableDrivers}
                    onClose={() => setInspectedRide(null)}
                    onAssignDriver={onAssignDriver}
                    onCancelRide={onCancelRide}
                    onCompleteRide={onCompleteRide}
                />
            )}
        </div>
    );
};

export default RideRequestsList;
