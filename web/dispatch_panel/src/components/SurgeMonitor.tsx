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
                <div className="bg-gradient-to-br from-red-600/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
                    <p className="text-sm text-red-400 mb-2">Active Surge Zones</p>
                    <p className="text-4xl font-bold text-white">{surgeZones.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
                    <p className="text-sm text-orange-400 mb-2">Highest Multiplier</p>
                    <p className="text-4xl font-bold text-white">
                        {Math.max(...surgeZones.map(z => z.multiplier))}x
                    </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6">
                    <p className="text-sm text-yellow-400 mb-2">Total Active Rides</p>
                    <p className="text-4xl font-bold text-white">
                        {surgeZones.reduce((sum, z) => sum + z.activeRides, 0)}
                    </p>
                </div>
            </div>

            {/* Surge Zones List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Surge Zone Details</h3>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Adjust Pricing
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {surgeZones.map((zone) => (
                        <div
                            key={zone.id}
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-1">{zone.name}</h4>
                                    <p className="text-sm text-slate-400">Zone ID: {zone.id}</p>
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getMultiplierBadge(zone.multiplier)}`}>
                                    {zone.multiplier}x Surge
                                </span>
                            </div>

                            {/* Multiplier Bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-500">Surge Multiplier</span>
                                    <span className="text-sm font-bold text-white">{zone.multiplier}x</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getMultiplierColor(zone.multiplier)} transition-all duration-500`}
                                        style={{ width: `${Math.min((zone.multiplier / 3) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 mb-1">Active Rides</p>
                                    <p className="text-2xl font-bold text-white">{zone.activeRides}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 mb-1">Available Drivers</p>
                                    <p className="text-2xl font-bold text-green-400">{zone.availableDrivers}</p>
                                </div>
                            </div>

                            {/* Demand Indicator */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-red-400">High Demand Area</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Demand exceeds supply by {Math.round((zone.activeRides / Math.max(zone.availableDrivers, 1)) * 100)}%
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 text-sm font-medium transition-colors">
                                    View on Map
                                </button>
                                <button className="flex-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg py-2 text-sm font-medium transition-colors">
                                    Adjust Surge
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Surge Pricing Info */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Surge Pricing Guidelines</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-yellow-400 font-bold">1.5x</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white mb-1">Moderate Demand</p>
                            <p className="text-xs text-slate-400">Applied when demand is 20-50% higher than supply</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-400 font-bold">2.0x</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white mb-1">High Demand</p>
                            <p className="text-xs text-slate-400">Applied when demand is 50-100% higher than supply</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-red-400 font-bold">2.5x+</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white mb-1">Critical Demand</p>
                            <p className="text-xs text-slate-400">Applied when demand exceeds supply by 100%+</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurgeMonitor;
