import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    LocationCity,
    DirectionsCar,
    TrendingUp,
    ReportProblem,
    Settings,
    Map,
    AttachMoney,
    Warning
} from '@mui/icons-material';

export const CityManagementDashboard: React.FC = () => {
    const [kpis, setKPIs] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getCityKPIs('nairobi').then(setKPIs).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="text-slate-400 animate-pulse text-sm">Loading City Dashboard...</div>
        </div>
    );

    const cards = [
        {
            label: "Active Drivers",
            value: kpis?.activeDrivers || 0,
            icon: DirectionsCar,
            bgClass: "bg-amber-500/10",
            textClass: "text-amber-400"
        },
        {
            label: "Total Trips (Today)",
            value: kpis?.totalTrips || 0,
            icon: LocationCity,
            bgClass: "bg-emerald-500/10",
            textClass: "text-emerald-400"
        },
        {
            label: "Avg Surge Multiplier",
            value: `${kpis?.avgSurge || 1.0}x`,
            icon: TrendingUp,
            bgClass: "bg-amber-500/10",
            textClass: "text-amber-400"
        },
        {
            label: "Open Complaints",
            value: kpis?.complaints || 0,
            icon: ReportProblem,
            bgClass: "bg-rose-500/10",
            textClass: "text-rose-400"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <LocationCity className="text-amber-500" />
                        City Management: Nairobi
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Real-time city performance and configuration.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        OPERATIONAL
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-[#131722] p-5 rounded shadow-sm border border-white/10 transition-all hover:border-white/20">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 rounded ${card.bgClass} ${card.textClass}`}>
                                <card.icon fontSize="small" />
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400 mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-white">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SETTINGS PANEL */}
                <div className="lg:col-span-2 bg-[#131722] rounded shadow-sm border border-white/10 p-6">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Settings className="text-amber-500" />
                        Regional Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center p-5 border border-white/10 rounded bg-[#0a0a0a] hover:bg-white/[0.04] transition-all group active:scale-95">
                            <div className="p-2.5 bg-amber-500/10 rounded mb-2 group-hover:scale-105 transition-transform">
                                <AttachMoney className="text-amber-400" />
                            </div>
                            <span className="font-semibold text-white text-xs">Base Fare</span>
                            <span className="text-[11px] text-slate-400 text-center mt-0.5">Manage pricing models</span>
                        </button>

                        <button className="flex flex-col items-center justify-center p-5 border border-white/10 rounded bg-[#0a0a0a] hover:bg-white/[0.04] transition-all group active:scale-95">
                            <div className="p-2.5 bg-amber-500/10 rounded mb-2 group-hover:scale-105 transition-transform">
                                <TrendingUp className="text-amber-400" />
                            </div>
                            <span className="font-semibold text-white text-xs">Surge Settings</span>
                            <span className="text-[11px] text-slate-400 text-center mt-0.5">Configure multipliers</span>
                        </button>

                        <button className="flex flex-col items-center justify-center p-5 border border-white/10 rounded bg-[#0a0a0a] hover:bg-white/[0.04] transition-all group active:scale-95">
                            <div className="p-2.5 bg-amber-500/10 rounded mb-2 group-hover:scale-105 transition-transform">
                                <Map className="text-amber-400" />
                            </div>
                            <span className="font-semibold text-white text-xs">Zone Management</span>
                            <span className="text-[11px] text-slate-400 text-center mt-0.5">Geofencing & Borders</span>
                        </button>
                    </div>
                </div>

                {/* ALERTS PANEL */}
                <div className="bg-[#131722] rounded shadow-sm border border-white/10 p-6">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Warning className="text-amber-500" />
                        Active Alerts
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-[#0a0a0a] border border-amber-500/20 rounded text-xs">
                            <p className="font-semibold text-amber-400">High Demand in CBD</p>
                            <p className="text-slate-400 mt-1">Surge multiplier auto-set to 1.5x due to lack of drivers.</p>
                        </div>
                        <div className="p-3 bg-[#0a0a0a] border border-white/10 rounded text-xs">
                            <p className="font-semibold text-slate-300">Weather Alert</p>
                            <p className="text-slate-400 mt-1">Light rain expected near Westlands. ETA thresholds widened by 2 mins.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
