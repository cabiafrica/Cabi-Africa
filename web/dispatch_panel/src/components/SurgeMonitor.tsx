import { SurgeZone } from '../types';

interface SurgeMonitorProps {
    surgeZones: SurgeZone[];
}

const SurgeMonitor = ({ surgeZones }: SurgeMonitorProps) => {
    const getMultiplierColor = (multiplier: number) => {
        if (multiplier >= 2.0) return 'from-red-600 to-red-500';
        if (multiplier >= 1.5) return 'from-orange-600 to-orange-500';
        return 'from-yellow-600 to-yellow-500';
    };

    const getMultiplierBadge = (multiplier: number) => {
        if (multiplier >= 2.0) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (multiplier >= 1.5) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    };

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-[3px] p-6">
                    <p className="text-xs uppercase font-bold text-red-600 dark:text-red-400 mb-2">Active Surge Zones</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{surgeZones.length}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-[3px] p-6">
                    <p className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400 mb-2">Highest Multiplier</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">
                        {surgeZones.length > 0 ? Math.max(...surgeZones.map(z => z.multiplier)) : 1.0}x
                    </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[3px] p-6">
                    <p className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 mb-2">Total Active Rides</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">
                        {surgeZones.reduce((sum, z) => sum + z.activeRides, 0)}
                    </p>
                </div>
            </div>

            {/* Surge Zones List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Surge Zone Details</h3>
                    <button className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black rounded-[3px] text-xs font-bold transition-all shadow-sm">
                        Adjust Pricing
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {surgeZones.map((zone) => (
                        <div
                            key={zone.id}
                            className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-6 hover:border-orange-500/50 transition-all duration-200 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{zone.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Zone ID: {zone.id}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[3px] border ${getMultiplierBadge(zone.multiplier)}`}>
                                    {zone.multiplier}x Surge
                                </span>
                            </div>

                            {/* Multiplier Bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-500">Surge Multiplier</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{zone.multiplier}x</span>
                                </div>
                                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-[2px] overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getMultiplierColor(zone.multiplier)} transition-all duration-500`}
                                        style={{ width: `${Math.min((zone.multiplier / 3) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-3.5">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Active Rides</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{zone.activeRides}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-3.5">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Available Drivers</p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{zone.availableDrivers}</p>
                                </div>
                            </div>

                            {/* Demand Indicator */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-[3px] p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-xs font-bold text-red-700 dark:text-red-400">High Demand Area</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Demand exceeds supply by {Math.round((zone.activeRides / Math.max(zone.availableDrivers, 1)) * 100)}%
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-[3px] py-2 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
                                    View on Map
                                </button>
                                <button className="flex-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30 rounded-[3px] py-2 text-xs font-bold transition-colors">
                                    Adjust Surge
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Surge Pricing Info */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-6 shadow-sm">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Surge Pricing Guidelines</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-[3px] bg-amber-500/5 border border-amber-500/10">
                        <div className="w-8 h-8 rounded-[3px] bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">1.5x</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Moderate Demand</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Applied when demand is 20-50% higher than supply</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-[3px] bg-orange-500/5 border border-orange-500/10">
                        <div className="w-8 h-8 rounded-[3px] bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-600 dark:text-orange-400 font-bold text-xs">2.0x</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">High Demand</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Applied when demand is 50-100% higher than supply</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-[3px] bg-red-500/5 border border-red-500/10">
                        <div className="w-8 h-8 rounded-[3px] bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 dark:text-red-400 font-bold text-xs">2.5x+</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Critical Demand</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Applied when demand exceeds supply by 100%+</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurgeMonitor;
