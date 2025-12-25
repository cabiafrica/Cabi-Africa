import { DispatchMetrics, RideRequest, Driver } from '../types';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricsOverviewProps {
    metrics: DispatchMetrics;
    rideRequests: RideRequest[];
    drivers: Driver[];
}

const MetricsOverview = ({ metrics, rideRequests, drivers }: MetricsOverviewProps) => {
    // Generate sample data for charts
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        rides: Math.floor(Math.random() * 50) + 10,
        drivers: Math.floor(Math.random() * 30) + 15,
    }));

    const recentData = Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 5}m ago`,
        requests: Math.floor(Math.random() * 20) + 5,
    }));

    const pendingRides = rideRequests.filter(r => r.status === 'pending');
    const activeRides = rideRequests.filter(r => r.status === 'in-progress' || r.status === 'assigned');
    const onlineDrivers = drivers.filter(d => d.status === 'online');
    const busyDrivers = drivers.filter(d => d.status === 'busy');

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Rides */}
                <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-400 mb-1">Active Rides</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{activeRides.length}</h3>
                            <p className="text-xs text-slate-400">
                                <span className="text-green-400">↑ 12%</span> from last hour
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-400 mb-1">Completed Today</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{metrics.completedToday}</h3>
                            <p className="text-xs text-slate-400">
                                <span className="text-green-400">↑ 8%</span> vs yesterday
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                            <Area type="monotone" dataKey="rides" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRides)" />
                            <Area type="monotone" dataKey="drivers" stroke="#10b981" fillOpacity={1} fill="url(#colorDrivers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
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
                    {metrics.peakDemandZones.map((zone, index) => (
                        <div
                            key={zone}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
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
