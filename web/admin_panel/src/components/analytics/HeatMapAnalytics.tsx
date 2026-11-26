import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Whatshot,
    People,
    DirectionsCar,
    FilterList,
    Info
} from '@mui/icons-material';
import { PageHeader } from '../common/PageHeader';

export const HeatMapAnalytics: React.FC = () => {
    const [points, setPoints] = useState<any[]>([]);
    const [type, setType] = useState<'DEMAND' | 'SUPPLY'>('DEMAND');
    const [serviceId, setServiceId] = useState<string>('ALL');
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        // Fetch services for filter
        adminService.getServices().then(data => {
            setServices([{ id: 'ALL', name: 'All Services' }, ...data]);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        adminService.getHeatMapData(type, serviceId).then(setPoints).finally(() => setLoading(false));
    }, [type, serviceId]);

    const totalIntensity = points.reduce((acc, p) => acc + p.intensity, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                category="Command Center"
                title="Heat Map Analytics"
                subtitle="Visualize demand and supply density across urban operational regions."
                icon={<Whatshot className="text-amber-500" />}
                actions={
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative">
                            <select
                                aria-label="Filter service type"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-[3px] text-white text-xs font-semibold focus:ring-1 focus:ring-amber-500 outline-none shadow-sm min-w-[140px]"
                            >
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <FilterList fontSize="small" />
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] p-0.5 rounded-[3px] border border-white/10 flex">
                            <button
                                onClick={() => setType('DEMAND')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs font-semibold transition-all ${type === 'DEMAND'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <People fontSize="small" />
                                Demand
                            </button>
                            <button
                                onClick={() => setType('SUPPLY')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs font-semibold transition-all ${type === 'SUPPLY'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <DirectionsCar fontSize="small" />
                                Supply
                            </button>
                        </div>
                    </div>
                }
            />

            <div className="relative aspect-[16/9] lg:aspect-[21/9] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden group">

                {/* Loader Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                            <span className="text-white font-medium text-sm">Generating Heatmap...</span>
                        </div>
                    </div>
                )}

                {/* Map Grid Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* HUD Elements */}
                <div className="absolute top-6 left-6 z-10">
                    <div className="bg-black/40 backdrop-blur px-4 py-2 rounded border border-white/10 text-white font-mono text-xs">
                        NAIROBI REGION
                        <div className="text-slate-400 mt-0.5 whitespace-pre">LAT: -1.2921  LNG: 36.8219</div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end">
                    <div className="bg-black/40 backdrop-blur px-4 py-2 rounded border border-white/10 text-white text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Data Density</div>
                        <div className="text-2xl font-bold font-mono">{points.length} Pts</div>
                        <div className="text-xs text-slate-500">Intensity: {(totalIntensity / 100).toFixed(1)}k</div>
                    </div>
                </div>

                {/* Heat Points */}
                <div className="absolute inset-0">
                    {points.map((p, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full blur-2xl mix-blend-screen transition-all duration-1000 animate-pulse-slow"
                            style={{
                                left: `${(p.lng - 36.7) * 400}%`,
                                top: `${(p.lat + 1.2) * 400}%`,
                                width: `${p.intensity * 80}px`,
                                height: `${p.intensity * 80}px`,
                                backgroundColor: type === 'DEMAND' ? `rgba(239, 68, 68, ${p.intensity * 0.4})` : `rgba(34, 197, 94, ${p.intensity * 0.4})`,
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.8
                            }}
                        />
                    ))}
                </div>

                {points.length === 0 && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
                        <Info fontSize="large" className="mb-2 opacity-50" />
                        <p>No activity detected in this region for the selected filter.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Analysis Cards? Could go here */}
            </div>
        </div>
    );
};
