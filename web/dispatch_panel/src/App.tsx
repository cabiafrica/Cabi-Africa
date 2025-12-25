import { useState, useEffect } from 'react';
import { RideRequest, Driver, DispatchMetrics } from './types';
import { mockRideRequests, mockDrivers, mockMetrics, mockSurgeZones, mockTripAnalytics } from './mockData';
import MetricsOverview from './components/MetricsOverview';
import RideRequestsList from './components/RideRequestsList';
import DriversList from './components/DriversList';
import LiveMap from './components/LiveMap';
import SurgeMonitor from './components/SurgeMonitor';
import TripAnalytics from './components/TripAnalytics';

function App() {
    const [activeView, setActiveView] = useState<'overview' | 'rides' | 'drivers' | 'map' | 'surge' | 'analytics'>('overview');
    const [rideRequests, setRideRequests] = useState<RideRequest[]>(mockRideRequests);
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
    const [metrics, setMetrics] = useState<DispatchMetrics>(mockMetrics);
    const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Update metrics with slight variations
            setMetrics(prev => ({
                ...prev,
                activeRides: prev.activeRides + Math.floor(Math.random() * 3) - 1,
                pendingRequests: Math.max(0, prev.pendingRequests + Math.floor(Math.random() * 3) - 1),
                onlineDrivers: prev.onlineDrivers + Math.floor(Math.random() * 5) - 2,
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleAssignDriver = (rideId: string, driverId: string) => {
        setRideRequests(prev =>
            prev.map(ride =>
                ride.id === rideId
                    ? { ...ride, status: 'assigned', assignedDriverId: driverId }
                    : ride
            )
        );
        setDrivers(prev =>
            prev.map(driver =>
                driver.id === driverId
                    ? { ...driver, status: 'busy', activeRideId: rideId }
                    : driver
            )
        );
    };

    const handleCancelRide = (rideId: string) => {
        setRideRequests(prev =>
            prev.map(ride =>
                ride.id === rideId ? { ...ride, status: 'cancelled' } : ride
            )
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">CABI</h1>
                            <p className="text-xs text-slate-400">Dispatch Control</p>
                        </div>
                    </div>
                </div>

                {/* Live Status */}
                <div className="px-6 py-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                        <span className="text-sm font-medium text-green-400">System Online</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">All services operational</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Main Views
                    </div>

                    <button
                        onClick={() => setActiveView('overview')}
                        className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === 'overview'
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="font-medium">Overview</span>
                    </button>

                    <button
                        onClick={() => setActiveView('rides')}
                        className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === 'rides'
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium">Ride Requests</span>
                        {metrics.pendingRequests > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {metrics.pendingRequests}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveView('drivers')}
                        className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === 'drivers'
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">Drivers</span>
                        <span className="ml-auto text-xs text-green-400 font-semibold">
                            {drivers.filter(d => d.status === 'online').length} online
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveView('map')}
                        className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === 'map'
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="font-medium">Live Map</span>
                    </button>

                    <button
                        onClick={() => setActiveView('surge')}
                        className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === 'surge'
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium">Surge Monitor</span>
                        {mockSurgeZones.length > 0 && (
                            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {mockSurgeZones.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveView('analytics')}
                        className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === 'analytics'
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">Trip Analytics</span>
                    </button>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            OP
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Operator</p>
                            <p className="text-xs text-slate-500">Dispatch Team</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {/* Header */}
                <header className="bg-slate-900/30 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white capitalize">
                                {activeView === 'overview' && 'Dispatch Overview'}
                                {activeView === 'rides' && 'Ride Requests'}
                                {activeView === 'drivers' && 'Driver Management'}
                                {activeView === 'map' && 'Live Map View'}
                                {activeView === 'surge' && 'Surge Pricing Monitor'}
                                {activeView === 'analytics' && 'Trip Analytics'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {activeView === 'analytics' ? 'Comprehensive trip performance and cancellation analysis' : 'Real-time dispatch operations and monitoring'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Last Updated</p>
                                <p className="text-sm font-medium text-white">
                                    {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeView === 'overview' && (
                        <MetricsOverview
                            metrics={metrics}
                            rideRequests={rideRequests}
                            drivers={drivers}
                        />
                    )}
                    {activeView === 'analytics' && (
                        <TripAnalytics analytics={mockTripAnalytics} />
                    )}
                    {activeView === 'rides' && (
                        <RideRequestsList
                            rideRequests={rideRequests}
                            drivers={drivers}
                            onAssignDriver={handleAssignDriver}
                            onCancelRide={handleCancelRide}
                            selectedRide={selectedRide}
                            onSelectRide={setSelectedRide}
                        />
                    )}
                    {activeView === 'drivers' && (
                        <DriversList drivers={drivers} />
                    )}
                    {activeView === 'map' && (
                        <LiveMap
                            drivers={drivers}
                            rideRequests={rideRequests}
                            surgeZones={mockSurgeZones}
                        />
                    )}
                    {activeView === 'surge' && (
                        <SurgeMonitor surgeZones={mockSurgeZones} />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
