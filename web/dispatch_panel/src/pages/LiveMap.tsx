import { useEffect, useState } from 'react';
import { CabiMap, MapMarker } from '../components/CabiMap';

interface Driver {
    id: string;
    name: string;
    position: [number, number];
    isOnline: boolean;
    currentTrip?: {
        passengerId: string;
        passengerName: string;
        pickup: [number, number];
        dropoff: [number, number];
    };
}

// Mock data - Nairobi locations
const mockDrivers: Driver[] = [
    {
        id: 'drv-001',
        name: 'John Kamau',
        position: [-1.286389, 36.817223], // Westlands
        isOnline: true,
        currentTrip: {
            passengerId: 'pass-001',
            passengerName: 'Jane Wanjiku',
            pickup: [-1.286389, 36.817223],
            dropoff: [-1.319167, 36.928611], // JKIA
        },
    },
    {
        id: 'drv-002',
        name: 'Peter Mwangi',
        position: [-1.292066, 36.821946], // CBD
        isOnline: true,
    },
    {
        id: 'drv-003',
        name: 'Mary Njeri',
        position: [-1.303209, 36.707047], // Karen
        isOnline: true,
    },
    {
        id: 'drv-004',
        name: 'David Ochieng',
        position: [-1.257677, 36.795206], // Parklands
        isOnline: false,
    },
    {
        id: 'drv-005',
        name: 'Sarah Akinyi',
        position: [-1.270000, 36.890000], // Gigiri
        isOnline: true,
    },
];

export default function LiveMapPage() {
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // Simulate real-time driver movement
    useEffect(() => {
        const interval = setInterval(() => {
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) => {
                    if (!driver.isOnline) return driver;

                    // Simulate small movement
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
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const filteredDrivers = showOnlineOnly
        ? drivers.filter((d) => d.isOnline)
        : drivers;

    const markers: MapMarker[] = filteredDrivers.map((driver) => ({
        id: driver.id,
        position: driver.position,
        type: 'driver',
        popup: `
      <div style="padding: 8px;">
        <strong>${driver.name}</strong><br/>
        Status: ${driver.isOnline ? '🟢 Online' : '⚫ Offline'}<br/>
        ${driver.currentTrip ? `Trip: ${driver.currentTrip.passengerName}` : 'Available'}
      </div>
    `,
        onClick: () => setSelectedDriver(driver),
    }));

    // Add trip markers if a driver is selected and has an active trip
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
        online: drivers.filter((d) => d.isOnline).length,
        onTrip: drivers.filter((d) => d.currentTrip).length,
        available: drivers.filter((d) => d.isOnline && !d.currentTrip).length,
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Real-time driver tracking and trip monitoring
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Show online only</span>
                        </label>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-xs text-blue-700">Total Drivers</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{stats.online}</div>
                        <div className="text-xs text-green-700">Online</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-600">{stats.onTrip}</div>
                        <div className="text-xs text-purple-700">On Trip</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-orange-600">{stats.available}</div>
                        <div className="text-xs text-orange-700">Available</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Map */}
                <div className="flex-1 relative">
                    <CabiMap
                        center={[-1.286389, 36.817223]}
                        zoom={12}
                        markers={markers}
                        route={route}
                        height="100%"
                    />
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Active Drivers ({filteredDrivers.length})
                        </h2>

                        <div className="space-y-2">
                            {filteredDrivers.map((driver) => (
                                <div
                                    key={driver.id}
                                    onClick={() => setSelectedDriver(driver)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedDriver?.id === driver.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                                        }`}
                                                />
                                                <span className="font-medium text-gray-900">
                                                    {driver.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                ID: {driver.id}
                                            </div>
                                            {driver.currentTrip && (
                                                <div className="mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                    On trip with {driver.currentTrip.passengerName}
                                                </div>
                                            )}
                                            {driver.isOnline && !driver.currentTrip && (
                                                <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    Available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
