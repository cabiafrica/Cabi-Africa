import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CabiMap, MapMarker } from '../CabiMap';
import { PageHeader } from '../common/PageHeader';
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
                    d.status === 'ON_TRIP' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
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
        <div className="space-y-4">
            <PageHeader
                category="Command Center"
                title="Real-Time Fleet Telemetry & Live Map"
                subtitle="Live vehicle tracking, operational availability, and dynamic trip dispatch map."
                icon={<DirectionsCar className="text-amber-500" />}
                actions={
                    <button
                        onClick={fetchDrivers}
                        className="btn-secondary flex items-center gap-1.5"
                        title="Refresh Map"
                    >
                        <Refresh fontSize="small" className={isAutoRefresh ? "animate-spin" : ""} />
                        Refresh
                    </button>
                }
            />

            <div className="relative h-[calc(100vh-210px)] bg-[#131722] rounded-[3px] overflow-hidden shadow-lg border border-white/10">
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
                <div className="absolute top-4 left-4 z-10 w-80 flex flex-col gap-3">
                    {/* Stats Card */}
                    <div className="bg-[#131722]/95 backdrop-blur-md p-4 rounded-[3px] shadow-xl border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Map fontSize="small" className="text-amber-500" />
                                    Live Operations
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Updated: {lastUpdated.toLocaleTimeString()}
                                </p>
                            </div>
                            <button
                                onClick={fetchDrivers}
                                className="p-1 hover:bg-white/10 rounded-[3px] text-slate-400 hover:text-white transition-colors"
                                title="Refresh Now"
                            >
                                <Refresh fontSize="small" className={isAutoRefresh ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div
                                onClick={() => setFilter('AVAILABLE')}
                                className={`p-2 rounded-[3px] cursor-pointer transition-all border ${filter === 'AVAILABLE'
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-[#0a0a0a] border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-emerald-400 mb-1"><Wifi fontSize="small" /></div>
                                <div className="text-xl font-bold text-white">{stats.available}</div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase">Available</div>
                            </div>

                            <div
                                onClick={() => setFilter('ON_TRIP')}
                                className={`p-2 rounded-[3px] cursor-pointer transition-all border ${filter === 'ON_TRIP'
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-[#0a0a0a] border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-amber-400 mb-1"><DirectionsCar fontSize="small" /></div>
                                <div className="text-xl font-bold text-white">{stats.onTrip}</div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase">On Trip</div>
                            </div>

                            <div
                                onClick={() => setFilter('OFFLINE')}
                                className={`p-2 rounded-[3px] cursor-pointer transition-all border ${filter === 'OFFLINE'
                                        ? 'bg-white/10 border-white/20'
                                        : 'bg-[#0a0a0a] border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-slate-400 mb-1"><WifiOff fontSize="small" /></div>
                                <div className="text-xl font-bold text-white">{stats.offline}</div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase">Offline</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-[#131722]/95 backdrop-blur-md p-3 rounded-[3px] shadow-xl border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Layers fontSize="small" /> Map Filters
                            </span>
                            {filter !== 'ALL' && (
                                <button
                                    onClick={() => setFilter('ALL')}
                                    className="text-[11px] text-amber-400 font-bold hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {['ALL', 'AVAILABLE', 'ON_TRIP', 'OFFLINE'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold transition-all border ${filter === f
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-500 font-bold shadow-sm'
                                            : 'bg-[#0a0a0a] text-slate-300 border-white/10 hover:bg-white/5'
                                        }`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend / Status Bar (Bottom) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-[#131722]/95 backdrop-blur px-4 py-1.5 rounded-[3px] shadow-lg border border-white/10 flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
                        <span className="text-slate-200">Live Updates Active</span>
                    </div>
                    <div className="w-px h-3.5 bg-white/10"></div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Total Fleet:</span>
                        <span className="font-bold text-white">{stats.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
