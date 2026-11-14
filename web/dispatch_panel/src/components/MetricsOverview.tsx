import { DispatchMetrics, RideRequest, Driver } from '../types';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricsOverviewProps {
    metrics: DispatchMetrics;
    rideRequests: RideRequest[];
    drivers: Driver[];
    onUndockTripAnalytics?: () => void;
    isTripAnalyticsUndocked?: boolean;
}

const MetricsOverview = ({
    metrics,
    rideRequests,
    drivers,
    onUndockTripAnalytics,
    isTripAnalyticsUndocked,
}: MetricsOverviewProps) => {
    // Generate data for charts - currently zeroed for clean production start
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        rides: 0,
        drivers: 0,
    }));

    const recentData = Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 5}m ago`,
        requests: 0,
    }));

    const pendingRides = rideRequests.filter(r => r.status === 'pending');
    const activeRides = rideRequests.filter(r => r.status === 'in-progress' || r.status === 'assigned');
    const onlineDrivers = drivers.filter(d => d.status === 'online');
    const busyDrivers = drivers.filter(d => d.status === 'busy');

    return (
        <div className="space-y-6">
            {/* Multi-Monitor Dispatch Banner */}
            {onUndockTripAnalytics && (
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-900/30 via-slate-900/40 to-slate-900/30 border border-amber-500/20 backdrop-blur-xl shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">Multi-Screen Command Center</span>
                                {isTripAnalyticsUndocked ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        SCREEN 2 CONNECTED
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                                        READY FOR DUAL SCREEN
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400">
                                {isTripAnalyticsUndocked
                                    ? 'Trip Outcome & Cancellation telemetry is actively streaming to your secondary monitor.'
                                    : 'Undock Trip Outcome telemetry (completed vs cancelled) to a secondary screen or wallboard.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onUndockTripAnalytics}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isTripAnalyticsUndocked
                                ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-600/20 border border-amber-400/30'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{isTripAnalyticsUndocked ? 'Focus External Screen' : 'Undock Trip Monitoring'}</span>
                    </button>
                </div>
            )}
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Rides */}
                <div className="bg-gradient-to-br from-amber-600/10 to-amber-600/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-400 mb-1">Active Rides</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{activeRides.length}</h3>
                            <p className="text-xs text-slate-400">
                                <span className="text-green-400">↑ 12%</span> from last hour
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-400 mb-1">Pending Requests</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{pendingRides.length}</h3>
                            <p className="text-xs text-slate-400">
                                Avg wait: <span className="text-orange-400">{metrics.averageWaitTime}min</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Online Drivers */}
                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-400 mb-1">Online Drivers</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{onlineDrivers.length}</h3>
                            <p className="text-xs text-slate-400">
                                <span className="text-yellow-400">{busyDrivers.length} busy</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Completed Today */}
                <div className="bg-gradient-to-br from-teal-600/10 to-teal-600/5 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-teal-400 mb-1">Completed Today</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{metrics.completedToday}</h3>
                            <p className="text-xs text-slate-400">
                                <span className="text-green-400">↑ 8%</span> vs yesterday
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Trends */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">24-Hour Activity</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={hourlyData}>
                            <defs>
                                <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Area type="monotone" dataKey="rides" stroke="#F59E0B" fillOpacity={1} fill="url(#colorRides)" />
                            <Area type="monotone" dataKey="drivers" stroke="#10b981" fillOpacity={1} fill="url(#colorDrivers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm text-slate-400">Rides</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-slate-400">Drivers</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Request Volume</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={recentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="requests"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{ fill: '#f59e0b', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Peak Demand Zones */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Peak Demand Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {metrics.peakDemandZones.map((zone) => (
                        <div
                            key={zone}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">{zone}</span>
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                    High Demand
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{Math.floor(Math.random() * 15) + 5} active rides</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MetricsOverview;
