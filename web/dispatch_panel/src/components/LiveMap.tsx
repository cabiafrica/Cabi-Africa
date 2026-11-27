import { useState } from 'react';
import { Driver, RideRequest, SurgeZone } from '../types';
import { CabiMap, MapMarker } from './CabiMap';

export interface EmergencyAlertItem {
    id: string;
    obNumber: string;
    callerName?: string;
    callerType?: string;
    userType?: string;
    location: { lat: number; lng: number };
    tripId?: string;
    timestamp?: string | Date;
    status?: string;
}

interface LiveMapProps {
    drivers: Driver[];
    rideRequests: RideRequest[];
    surgeZones: SurgeZone[];
    emergencyAlerts?: EmergencyAlertItem[];
}

const LiveMap = ({ drivers, rideRequests, surgeZones, emergencyAlerts = [] }: LiveMapProps) => {
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    const onlineDrivers = drivers.filter(d => d.status === 'online' || d.status === 'busy');
    const activeRides = rideRequests.filter(r => r.status === 'in-progress' || r.status === 'assigned');

    // Filter drivers based on toggle
    const filteredDrivers = showOnlineOnly ? onlineDrivers : drivers;

    // Create markers for drivers
    const driverMarkers: MapMarker[] = filteredDrivers.map((driver) => ({
        id: driver.id,
        position: [driver.currentLocation.lat, driver.currentLocation.lng],
        type: 'driver',
        popup: `
            <div style="padding: 8px; min-width: 150px;">
                <strong style="font-size: 14px;">${driver.name}</strong><br/>
                <span style="color: ${driver.status === 'online' ? '#10b981' : driver.status === 'busy' ? '#f59e0b' : '#6b7280'};">
                    ${driver.status === 'online' ? '🟢 Available' : driver.status === 'busy' ? '🟡 On Trip' : '⚫ Offline'}
                </span><br/>
                <span style="font-size: 12px; color: #666;">Rating: ⭐ ${driver.rating.toFixed(1)}</span>
            </div>
        `,
        onClick: () => setSelectedDriver(driver),
    }));

    // Create markers for active ride pickups/dropoffs
    const rideMarkers: MapMarker[] = [];
    activeRides.forEach((ride) => {
        rideMarkers.push({
            id: `pickup-${ride.id}`,
            position: [ride.pickupLocation.lat, ride.pickupLocation.lng],
            type: 'pickup',
            popup: `
                <div style="padding: 8px;">
                    <strong>Pickup</strong><br/>
                    ${ride.passengerName}<br/>
                    <span style="font-size: 12px; color: #666;">${ride.pickupLocation.address}</span>
                </div>
            `,
        });
        rideMarkers.push({
            id: `dropoff-${ride.id}`,
            position: [ride.dropoffLocation.lat, ride.dropoffLocation.lng],
            type: 'dropoff',
            popup: `
                <div style="padding: 8px;">
                    <strong>Dropoff</strong><br/>
                    ${ride.passengerName}<br/>
                    <span style="font-size: 12px; color: #666;">${ride.dropoffLocation.address}</span>
                </div>
            `,
        });
    });

    // Create markers for active emergency SOS alerts
    const emergencyMarkers: MapMarker[] = emergencyAlerts.map((alert) => ({
        id: `emergency-${alert.id || alert.obNumber}`,
        position: [alert.location.lat, alert.location.lng],
        type: 'emergency',
        popup: `
            <div style="padding: 10px; min-width: 220px; font-family: sans-serif;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">🚨 SOS DISTRESS</span>
                    <span style="font-weight: 800; font-size: 11px; color: #111;">${alert.obNumber}</span>
                </div>
                <p style="margin: 4px 0; font-size: 13px; color: #111;">
                    <strong>${alert.callerType || alert.userType || 'Victim'}:</strong> ${alert.callerName || 'Distressed User'}
                </p>
                <p style="margin: 2px 0; font-size: 11px; color: #666;">
                    Trip: ${alert.tripId || 'UNASSIGNED'}
                </p>
                <p style="margin: 2px 0 8px 0; font-size: 11px; color: #666;">
                    Coords: [${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}]
                </p>
                <a href="https://cabi.africa/sos/${alert.obNumber}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #111; color: white; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
                    Open Incident Tracking Map →
                </a>
            </div>
        `,
    }));

    const allMarkers = [...emergencyMarkers, ...driverMarkers, ...rideMarkers];

    // Get route for selected driver if they have an active ride
    const selectedDriverRide = selectedDriver
        ? activeRides.find(r => r.assignedDriverId === selectedDriver.id)
        : null;

    const route = selectedDriverRide
        ? [
            [selectedDriver!.currentLocation.lat, selectedDriver!.currentLocation.lng] as [number, number],
            [selectedDriverRide.pickupLocation.lat, selectedDriverRide.pickupLocation.lng] as [number, number],
            [selectedDriverRide.dropoffLocation.lat, selectedDriverRide.dropoffLocation.lng] as [number, number],
        ]
        : undefined;

    return (
        <div className="space-y-6">
            {/* Map Container */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Map View</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Real-time driver and trip tracking across regions</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="rounded-[2px] border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-700"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Show online only</span>
                    </label>
                </div>

                <div className="relative h-[600px]">
                    <CabiMap
                        center={[-1.286389, 36.817223]} // Nairobi, Kenya
                        zoom={12}
                        markers={allMarkers}
                        route={route}
                        height="600px"
                    />

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-[3px] p-4 shadow-lg z-[1000]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2.5">Map Legend</h4>
                        <div className="space-y-1.5">
                            {emergencyAlerts.length > 0 && (
                                <div className="flex items-center gap-2 animate-pulse pb-1 border-b border-slate-200 dark:border-slate-700">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.9)]"></div>
                                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400">🚨 SOS Distress Active ({emergencyAlerts.length})</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-slate-700 dark:text-slate-300">Available Drivers ({onlineDrivers.filter(d => d.status === 'online').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                <span className="text-xs text-slate-700 dark:text-slate-300">On Trip ({onlineDrivers.filter(d => d.status === 'busy').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                                <span className="text-xs text-slate-700 dark:text-slate-300">Pickup Points ({activeRides.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                <span className="text-xs text-slate-700 dark:text-slate-300">Dropoff Points ({activeRides.length})</span>
                            </div>
                        </div>
                    </div>

                    {/* Selected Driver Info */}
                    {selectedDriver && (
                        <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-[3px] p-4 shadow-xl z-[1000] max-w-xs">
                            <div className="flex items-start justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedDriver.name}</h4>
                                <button
                                    onClick={() => setSelectedDriver(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                <p>ID: <span className="font-mono font-semibold">{selectedDriver.id}</span></p>
                                <p>Status: <span className={`font-bold ${selectedDriver.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' :
                                    selectedDriver.status === 'busy' ? 'text-amber-600 dark:text-amber-400' :
                                        'text-slate-400'
                                    }`}>{selectedDriver.status}</span></p>
                                <p>Rating: ⭐ {selectedDriver.rating.toFixed(1)}</p>
                                {selectedDriverRide && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <p className="font-bold text-slate-900 dark:text-white">Current Trip:</p>
                                        <p className="font-medium">{selectedDriverRide.passengerName}</p>
                                        <p className="text-slate-500 text-[11px]">{selectedDriverRide.pickupLocation.address} → {selectedDriverRide.dropoffLocation.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[3px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Drivers</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{drivers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Online</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{onlineDrivers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[3px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Active Trips</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{activeRides.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[3px] bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Surge Zones</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{surgeZones.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
