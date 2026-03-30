import { useState } from 'react';
import { Driver, RideRequest, SurgeZone } from '../types';
import { CabiMap, MapMarker } from './CabiMap';

interface LiveMapProps {
    drivers: Driver[];
    rideRequests: RideRequest[];
    surgeZones: SurgeZone[];
}

const LiveMap = ({ drivers, rideRequests, surgeZones }: LiveMapProps) => {
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

    const allMarkers = [...driverMarkers, ...rideMarkers];

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
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Live Map View</h3>
                        <p className="text-sm text-slate-400">Real-time driver and trip tracking</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                        />
                        <span className="text-sm text-slate-300">Show online only</span>
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
                    <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-lg z-[1000]">
                        <h4 className="text-sm font-semibold text-white mb-3">Map Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-slate-300">Available Drivers ({onlineDrivers.filter(d => d.status === 'online').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-xs text-slate-300">On Trip ({onlineDrivers.filter(d => d.status === 'busy').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-slate-300">Pickup Points ({activeRides.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-slate-300">Dropoff Points ({activeRides.length})</span>
                            </div>
                        </div>
                    </div>

                    {/* Selected Driver Info */}
                    {selectedDriver && (
                        <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-lg z-[1000] max-w-xs">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-semibold text-white">{selectedDriver.name}</h4>
                                <button
                                    onClick={() => setSelectedDriver(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-1 text-xs text-slate-300">
                                <p>ID: {selectedDriver.id}</p>
                                <p>Status: <span className={`font-semibold ${selectedDriver.status === 'online' ? 'text-green-400' :
                                    selectedDriver.status === 'busy' ? 'text-yellow-400' :
                                        'text-gray-400'
                                    }`}>{selectedDriver.status}</span></p>
                                <p>Rating: ⭐ {selectedDriver.rating.toFixed(1)}</p>
                                {selectedDriverRide && (
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                        <p className="font-semibold text-white">Current Trip:</p>
                                        <p>{selectedDriverRide.passengerName}</p>
                                        <p className="text-slate-400">{selectedDriverRide.pickupLocation.address} → {selectedDriverRide.dropoffLocation.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Drivers</p>
                            <p className="text-2xl font-bold text-white">{drivers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Online</p>
                            <p className="text-2xl font-bold text-white">{onlineDrivers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Active Trips</p>
                            <p className="text-2xl font-bold text-white">{activeRides.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Surge Zones</p>
                            <p className="text-2xl font-bold text-white">{surgeZones.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
