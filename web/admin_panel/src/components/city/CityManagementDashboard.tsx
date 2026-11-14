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
            <div className="text-slate-500 animate-pulse">Loading City Dashboard...</div>
        </div>
    );

    const cards = [
        {
            label: "Active Drivers",
            value: kpis?.activeDrivers || 0,
            icon: DirectionsCar,
            color: "blue",
            bgClass: "bg-amber-50 dark:bg-amber-900/20",
            textClass: "text-amber-600 dark:text-amber-400"
        },
        {
            label: "Total Trips (Today)",
            value: kpis?.totalTrips || 0,
            icon: LocationCity,
            color: "green",
            bgClass: "bg-green-50 dark:bg-green-900/20",
            textClass: "text-green-600 dark:text-green-400"
        },
        {
            label: "Avg Surge Multiplier",
            value: `${kpis?.avgSurge || 1.0}x`,
            icon: TrendingUp,
            color: "yellow",
            bgClass: "bg-yellow-50 dark:bg-yellow-900/20",
            textClass: "text-yellow-600 dark:text-yellow-400"
        },
        {
            label: "Open Complaints",
            value: kpis?.complaints || 0,
            icon: ReportProblem,
            color: "red",
            bgClass: "bg-red-50 dark:bg-red-900/20",
            textClass: "text-red-600 dark:text-red-400"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LocationCity className="text-amber-600 dark:text-amber-400" />
                        City Management: Nairobi
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time city performance and configuration.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        OPERATIONAL
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${card.bgClass} ${card.textClass}`}>
                                <card.icon fontSize="medium" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SETTINGS PANEL */}
                <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Settings className="text-slate-400" />
                        Regional Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                            <div className="p-3 bg-amber-50 dark:bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <AttachMoney className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Base Fare</span>
                            <span className="text-xs text-slate-500 text-center mt-1">Manage pricing models</span>
                        </button>

                        <button className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                            <div className="p-3 bg-amber-50 dark:bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Surge Settings</span>
                            <span className="text-xs text-slate-500 text-center mt-1">Configure multipliers</span>
                        </button>

                        <button className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                            <div className="p-3 bg-amber-50 dark:bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <Map className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Zone Management</span>
                            <span className="text-xs text-slate-500 text-center mt-1">Geofencing & Borders</span>
                        </button>
                    </div>
                </div>

                {/* ALERTS PANEL */}
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Warning className="text-orange-500" />
                        Active Alerts
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg text-sm">
                            <p className="font-semibold text-orange-800 dark:text-orange-300">High Demand in CBD</p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Surge multiplier auto-set to 1.5x due to lack of drivers.</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/10 rounded-lg text-sm text-center text-slate-500 italic">
                            No critical system alerts.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
