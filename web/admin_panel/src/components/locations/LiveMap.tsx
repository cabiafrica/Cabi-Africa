import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CabiMap, MapMarker } from '../CabiMap';
import {
    DirectionsCar,
    Wifi,
    WifiOff,
    LocalTaxi,
    FilterList,
    Refresh,
    Layers,
    Map
} from '@mui/icons-material';

interface DriverStats {
    total: number;
    available: number;
    onTrip: number;
    offline: number;
}

export const LiveMap: React.FC = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [stats, setStats] = useState<DriverStats>({ total: 0, available: 0, onTrip: 0, offline: 0 });
    const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE'>('ALL');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);

    const fetchDrivers = () => {
        adminService.getLiveDrivers().then(data => {
            setDrivers(data);
            setLastUpdated(new Date());

            // Calculate Stats
            const newStats = {
                total: data.length,
                available: data.filter((d: any) => d.status === 'AVAILABLE').length,
                onTrip: data.filter((d: any) => d.status === 'ON_TRIP').length,
                offline: data.filter((d: any) => d.status === 'OFFLINE').length
            };
            setStats(newStats);
        });
    };

    useEffect(() => {
        fetchDrivers();
        let interval: NodeJS.Timeout;
        if (isAutoRefresh) {
            interval = setInterval(fetchDrivers, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoRefresh]);

    useEffect(() => {
        // Filter Markers
        const filteredDrivers = filter === 'ALL'
            ? drivers
            : drivers.filter(d => d.status === filter);

        const newMarkers: MapMarker[] = filteredDrivers.map((d: any) => ({
            id: d.id,
            position: [d.lat, d.lng],
            type: 'driver',
            // We could customize icons here based on status if CabiMap supported dynamic icons better
            // For now, we rely on the popup content
            popup: `
                <div class="p-2 min-w-[150px]">
                    <h3 class="font-bold text-sm mb-1">${d.name || 'Unknown Driver'}</h3>
                    <div class="flex items-center gap-2 text-xs">
                        <span class="px-2 py-0.5 rounded-full ${d.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    d.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }">
                            ${d.status}
                        </span>
                        <span class="text-gray-500">ID: ${d.id.substring(0, 6)}</span>
                    </div>
                </div>
            `
        }));
        setMarkers(newMarkers);
    }, [drivers, filter]);

    return (
        <div className="relative h-[calc(100vh-100px)] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            {/* Map Container */}
            <div className="absolute inset-0 z-0">
                <CabiMap
                    markers={markers}
                    center={[-1.2921, 36.8219]} // Nairobi
                    zoom={13}
                    height="100%"
                />
            </div>

            {/* Floating Control Panel */}
            <div className="absolute top-4 left-4 z-10 w-80 flex flex-col gap-4">

                {/* Stats Card */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Map fontSize="small" className="text-blue-600" />
                                Live Operations
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={fetchDrivers}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                            title="Refresh Now"
                        >
                            <Refresh fontSize="small" className={isAutoRefresh ? "animate-spin-slow" : ""} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div
                            onClick={() => setFilter('AVAILABLE')}
                            className={`p-2 rounded-lg cursor-pointer transition-all border ${filter === 'AVAILABLE'
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800'
                                    : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-700/50'
                                }`}
                        >
                            <div className="text-green-600 dark:text-green-400 mb-1"><Wifi fontSize="small" /></div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.available}</div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase">Available</div>
                        </div>

                        <div
                            onClick={() => setFilter('ON_TRIP')}
                            className={`p-2 rounded-lg cursor-pointer transition-all border ${filter === 'ON_TRIP'
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
                                    : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-700/50'
                                }`}
                        >
                            <div className="text-blue-600 dark:text-blue-400 mb-1"><DirectionsCar fontSize="small" /></div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.onTrip}</div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase">On Trip</div>
                        </div>

                        <div
                            onClick={() => setFilter('OFFLINE')}
                            className={`p-2 rounded-lg cursor-pointer transition-all border ${filter === 'OFFLINE'
                                    ? 'bg-slate-200 border-slate-300 dark:bg-slate-600 dark:border-slate-500'
                                    : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-700/50'
                                }`}
                        >
                            <div className="text-slate-500 dark:text-slate-400 mb-1"><WifiOff fontSize="small" /></div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.offline}</div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase">Offline</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Layers fontSize="small" /> Map Filters
                        </span>
                        {filter !== 'ALL' && (
                            <button
                                onClick={() => setFilter('ALL')}
                                className="text-xs text-blue-600 font-bold hover:underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'AVAILABLE', 'ON_TRIP', 'OFFLINE'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend / Status Bar (Bottom) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex gap-6 text-xs font-medium">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                    <span className="text-slate-700 dark:text-slate-300">Live Updates Active</span>
                </div>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">Total Fleet:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
                </div>
            </div>
        </div>
    );
};
