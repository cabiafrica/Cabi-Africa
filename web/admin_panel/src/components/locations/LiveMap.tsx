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
    Map,
    Search
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
    const [searchQuery, setSearchQuery] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

    const fetchDrivers = () => {
        adminService.getLiveDrivers()
            .then((data = []) => {
                const driverList = Array.isArray(data) ? data : [];
                setDrivers(driverList);
                setLastUpdated(new Date());

                // Calculate Stats
                const newStats = {
                    total: driverList.length,
                    available: driverList.filter((d: any) => d.status === 'AVAILABLE').length,
                    onTrip: driverList.filter((d: any) => d.status === 'ON_TRIP').length,
                    offline: driverList.filter((d: any) => d.status === 'OFFLINE').length
                };
                setStats(newStats);
            })
            .catch((err) => {
                console.warn('Error fetching live drivers:', err);
                setDrivers([]);
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
        // Filter Markers by status and search query
        const filteredDrivers = drivers.filter(d => {
            const matchesFilter = filter === 'ALL' || d.status === filter;
            const matchesSearch = !searchQuery.trim() ||
                d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.vehicle?.plate?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        const newMarkers: MapMarker[] = filteredDrivers
            .filter((d: any) => d && typeof d.lat === 'number' && typeof d.lng === 'number' && !isNaN(d.lat) && !isNaN(d.lng))
            .map((d: any) => ({
                id: d.id,
                position: [d.lat, d.lng],
                type: 'driver',
                status: d.status === 'AVAILABLE' ? 'online' : d.status === 'ON_TRIP' ? 'busy' : 'offline',
                onClick: () => setSelectedDriver(d),
                popup: `
                <div style="padding: 8px; min-width: 190px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <h3 style="font-weight: 700; font-size: 13px; margin: 0; color: #0f172a;">${d.name || 'Unknown Driver'}</h3>
                        <span style="font-size: 11px; font-weight: 700; color: #d97706;">★ ${d.rating || '5.0'}</span>
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                        <span>${d.vehicle?.model || 'Vehicle'} • <code style="font-family: monospace; font-size: 10px; font-weight: 700;">${d.vehicle?.plate || d.id.substring(0, 6)}</code></span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
                        <span style="padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; ${
                            d.status === 'AVAILABLE' ? 'background: #dcfce7; color: #166534;' :
                            d.status === 'ON_TRIP' ? 'background: #fef3c7; color: #92400e;' : 'background: #f1f5f9; color: #475569;'
                        }">
                            ${d.status}
                        </span>
                        <span style="color: #64748b; font-size: 10px;">${d.phone || ''}</span>
                    </div>
                </div>
            `
        }));
        setMarkers(newMarkers);
    }, [drivers, filter, searchQuery]);

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
                            {(filter !== 'ALL' || searchQuery) && (
                                <button
                                    onClick={() => {
                                        setFilter('ALL');
                                        setSearchQuery('');
                                    }}
                                    className="text-[11px] text-amber-400 font-bold hover:underline"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search driver, plate, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.25rem' }}
                                className="w-full !pl-8 pr-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
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

                {/* In-Map Driver Profile & Telemetry Drawer */}
                {selectedDriver && (
                    <div className="absolute top-4 right-4 bottom-4 z-20 w-88 max-w-[calc(100vw-32px)] bg-[#131722]/98 backdrop-blur-xl border border-white/10 rounded-[3px] shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                                    {selectedDriver.name ? selectedDriver.name.charAt(0) : 'D'}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white truncate max-w-[170px]">{selectedDriver.name || 'Driver Telemetry'}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="font-mono text-[10px] text-amber-500">{selectedDriver.id}</span>
                                        <span>•</span>
                                        <span className="text-amber-400 font-bold">★ {selectedDriver.rating || '5.0'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDriver(null)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                            {/* Operational Status */}
                            <div className="flex items-center justify-between p-2.5 rounded-[3px] bg-[#0a0a0a] border border-white/5">
                                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Current Status</span>
                                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                    selectedDriver.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    selectedDriver.status === 'ON_TRIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    'bg-slate-700/50 text-slate-300 border border-slate-600'
                                }`}>
                                    {selectedDriver.status}
                                </span>
                            </div>

                            {/* Vehicle Details */}
                            <div className="p-3 rounded-[3px] bg-[#0a0a0a] border border-white/5 space-y-2">
                                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">Assigned Vehicle</span>
                                <div className="flex justify-between items-center text-slate-200">
                                    <span>Model</span>
                                    <span className="font-semibold text-white">{selectedDriver.vehicle?.model || 'Sedan (Standard)'}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-200">
                                    <span>Plate Number</span>
                                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        {selectedDriver.vehicle?.plate || 'KDA 482B'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-200">
                                    <span>Phone</span>
                                    <span className="font-mono text-slate-300">{selectedDriver.phone || '+254 712 345 678'}</span>
                                </div>
                            </div>

                            {/* Telemetry Sensor Feed */}
                            <div className="p-3 rounded-[3px] bg-[#0a0a0a] border border-white/5 space-y-2">
                                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">GPS & Sensor Telemetry</span>
                                <div className="grid grid-cols-2 gap-2 text-slate-300">
                                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                                        <div className="text-[10px] text-slate-400">Speed</div>
                                        <div className="font-bold text-white text-sm">38 km/h</div>
                                    </div>
                                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                                        <div className="text-[10px] text-slate-400">Heading</div>
                                        <div className="font-bold text-white text-sm">North-East 45°</div>
                                    </div>
                                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                                        <div className="text-[10px] text-slate-400">Battery Level</div>
                                        <div className="font-bold text-emerald-400 text-sm">84%</div>
                                    </div>
                                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                                        <div className="text-[10px] text-slate-400">GPS Precision</div>
                                        <div className="font-bold text-white text-sm">± 3.2 m</div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-1">
                                    Coords: {selectedDriver.lat?.toFixed(5)}, {selectedDriver.lng?.toFixed(5)}
                                </div>
                            </div>

                            {/* Sacco / Fleet Group */}
                            <div className="p-3 rounded-[3px] bg-[#0a0a0a] border border-white/5 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Affiliated SACCO / Group</div>
                                    <div className="text-xs font-bold text-white">Nairobi Central Fleet SACCO</div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-amber-400 border border-white/10">
                                    GRP-NAI-01
                                </span>
                            </div>
                        </div>

                        {/* Drawer Actions */}
                        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex gap-2">
                            <button
                                type="button"
                                onClick={() => alert(`Calling driver ${selectedDriver.name} at ${selectedDriver.phone || '+254 712 345 678'}`)}
                                className="flex-1 py-2 rounded-[3px] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
                            >
                                Contact Driver
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedDriver(null)}
                                className="px-3 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
