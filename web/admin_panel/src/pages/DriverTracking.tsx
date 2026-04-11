import React, { useState, useEffect } from 'react';
import { CabiMap, MapMarker } from '../components/CabiMap';

interface Driver {
    id: string;
    name: string;
    position: [number, number];
    status: 'online' | 'offline' | 'busy';
    rating: number;
    totalTrips: number;
    currentTrip?: {
        passengerId: string;
        passengerName: string;
        pickup: [number, number];
        dropoff: [number, number];
    };
}

// Mock driver data - Nairobi locations
const mockDrivers: Driver[] = [];

export default function DriverTracking() {
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'busy' | 'offline'>('all');

    // Simulate real-time driver movement
    useEffect(() => {
        const interval = setInterval(() => {
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) => {
                    if (driver.status === 'offline') return driver;

                    const latOffset = (Math.random() - 0.5) * 0.002;
                    const lngOffset = (Math.random() - 0.5) * 0.002;

                    return {
                        ...driver,
                        position: [
                            driver.position[0] + latOffset,
                            driver.position[1] + lngOffset,
                        ] as [number, number],
                    };
                })
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filteredDrivers = drivers.filter((d) =>
        filterStatus === 'all' ? true : d.status === filterStatus
    );

    const markers: MapMarker[] = filteredDrivers.map((driver) => ({
        id: driver.id,
        position: driver.position,
        type: 'driver',
        popup: `
      <div style="padding: 8px; min-width: 150px;">
        <strong style="font-size: 14px;">${driver.name}</strong><br/>
        <span style="color: ${driver.status === 'online' ? '#10b981' : driver.status === 'busy' ? '#f59e0b' : '#6b7280'
            };">
          ${driver.status === 'online' ? '🟢 Available' : driver.status === 'busy' ? '🟡 On Trip' : '⚫ Offline'}
        </span><br/>
        <span style="font-size: 12px; color: #666;">⭐ ${driver.rating.toFixed(1)} • ${driver.totalTrips} trips</span>
      </div>
    `,
        onClick: () => setSelectedDriver(driver),
    }));

    // Add trip markers for selected driver
    if (selectedDriver?.currentTrip) {
        markers.push({
            id: 'pickup',
            position: selectedDriver.currentTrip.pickup,
            type: 'pickup',
            popup: 'Pickup Location',
        });
        markers.push({
            id: 'dropoff',
            position: selectedDriver.currentTrip.dropoff,
            type: 'dropoff',
            popup: 'Dropoff Location',
        });
    }

    const route = selectedDriver?.currentTrip
        ? [
            selectedDriver.position,
            selectedDriver.currentTrip.pickup,
            selectedDriver.currentTrip.dropoff,
        ]
        : undefined;

    const stats = {
        total: drivers.length,
        online: drivers.filter((d) => d.status === 'online').length,
        busy: drivers.filter((d) => d.status === 'busy').length,
        offline: drivers.filter((d) => d.status === 'offline').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Tracking</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time driver location monitoring</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Drivers</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.online}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Available</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.busy}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">On Trip</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.offline}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Offline</div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
                    <div className="flex gap-2">
                        {(['all', 'online', 'busy', 'offline'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative">
                    <CabiMap
                        center={[-1.286389, 36.817223]}
                        zoom={12}
                        markers={markers}
                        route={route}
                        height="600px"
                    />

                    {/* Selected Driver Info */}
                    {selectedDriver && (
                        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">{selectedDriver.name}</h3>
                                <button
                                    onClick={() => setSelectedDriver(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID:</span>
                                    <span className="font-medium">{selectedDriver.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span
                                        className={`font-medium ${selectedDriver.status === 'online'
                                            ? 'text-green-600'
                                            : selectedDriver.status === 'busy'
                                                ? 'text-yellow-600'
                                                : 'text-gray-600'
                                            }`}
                                    >
                                        {selectedDriver.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rating:</span>
                                    <span className="font-medium">⭐ {selectedDriver.rating.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Trips:</span>
                                    <span className="font-medium">{selectedDriver.totalTrips}</span>
                                </div>
                                {selectedDriver.currentTrip && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="font-medium text-gray-900 mb-1">Current Trip:</div>
                                        <div className="text-gray-600">{selectedDriver.currentTrip.passengerName}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Driver List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                        Drivers ({filteredDrivers.length})
                    </h2>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredDrivers.map((driver) => (
                        <div
                            key={driver.id}
                            onClick={() => setSelectedDriver(driver)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedDriver?.id === driver.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-3 h-3 rounded-full ${driver.status === 'online'
                                            ? 'bg-green-500'
                                            : driver.status === 'busy'
                                                ? 'bg-yellow-500'
                                                : 'bg-gray-400'
                                            }`}
                                    />
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{driver.name}</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">{driver.id}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                        ⭐ {driver.rating.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">{driver.totalTrips} trips</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
