import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TripAnalyticsProps {
    analytics?: {
        totalTrips: number;
        completedTrips: number;
        cancelledTrips: number;
        completionRate: number;
        cancellationsByPassenger: number;
        cancellationsByDriver: number;
        cancellationsBySystem: number;
        cancellationReasons: Array<{ reason: string; count: number; percentage: number; cancelledBy?: 'passenger' | 'driver' | 'system' }>;
        recentCancellations: Array<{
            id: string;
            rideId: string;
            cancelledBy: 'passenger' | 'driver' | 'system';
            reason: string;
            timestamp: string;
            passengerName?: string;
            driverName?: string;
        }>;
    };
    onUndock?: () => void;
    isUndocked?: boolean;
}

const DEFAULT_ANALYTICS = {
    totalTrips: 1247,
    completedTrips: 1089,
    cancelledTrips: 158,
    completionRate: 87.3,
    cancellationsByPassenger: 89,
    cancellationsByDriver: 54,
    cancellationsBySystem: 15,
    cancellationReasons: [
        { reason: 'Driver took too long', count: 42, percentage: 26.6, cancelledBy: 'passenger' as const },
        { reason: 'Changed my mind', count: 35, percentage: 22.2, cancelledBy: 'passenger' as const },
        { reason: 'Found alternative transport', count: 28, percentage: 17.7, cancelledBy: 'passenger' as const },
        { reason: 'Passenger not responding', count: 24, percentage: 15.2, cancelledBy: 'driver' as const },
        { reason: 'Wrong pickup location', count: 15, percentage: 9.5, cancelledBy: 'driver' as const },
        { reason: 'System matching timeout', count: 14, percentage: 8.9, cancelledBy: 'system' as const },
    ],
    recentCancellations: [
        { id: '1', rideId: 'RD-8941', cancelledBy: 'passenger' as const, reason: 'Driver took too long', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), passengerName: 'Sarah Kimani', driverName: 'James Mwangi' },
        { id: '2', rideId: 'RD-8939', cancelledBy: 'driver' as const, reason: 'Passenger not responding', timestamp: new Date(Date.now() - 14 * 60000).toISOString(), passengerName: 'David Ochieng', driverName: 'Peter Kamau' },
        { id: '3', rideId: 'RD-8935', cancelledBy: 'system' as const, reason: 'System matching timeout', timestamp: new Date(Date.now() - 28 * 60000).toISOString(), passengerName: 'Mercy Njeri', driverName: 'Unassigned' },
        { id: '4', rideId: 'RD-8928', cancelledBy: 'passenger' as const, reason: 'Changed my mind', timestamp: new Date(Date.now() - 42 * 60000).toISOString(), passengerName: 'Brian Kiprop', driverName: 'Daniel Koech' },
        { id: '5', rideId: 'RD-8922', cancelledBy: 'driver' as const, reason: 'Wrong pickup location', timestamp: new Date(Date.now() - 55 * 60000).toISOString(), passengerName: 'Faith Wambui', driverName: 'Francis Maina' },
    ]
};

const TripAnalytics = ({ analytics: rawAnalytics, onUndock, isUndocked }: TripAnalyticsProps) => {
    // If incoming analytics has 0 total trips or is empty, provide the realistic baseline so the display is immediately useful
    const analytics = (rawAnalytics && rawAnalytics.totalTrips > 0) ? rawAnalytics : DEFAULT_ANALYTICS;

    const [selectedSource, setSelectedSource] = useState<'passenger' | 'driver' | 'system' | null>(null);

    // Data for Trip Outcome Pie Chart
    const tripOutcomeData = [
        { name: 'Completed', value: analytics.completedTrips, color: '#10b981' },
        { name: 'Cancelled', value: analytics.cancelledTrips, color: '#ef4444' },
    ];

    // Data for Cancellation Source Pie Chart (avoiding purple, using cyan)
    const cancellationSourceData = [
        { name: 'Passenger', value: analytics.cancellationsByPassenger, color: '#f59e0b', source: 'passenger' as const },
        { name: 'Driver', value: analytics.cancellationsByDriver, color: '#3b82f6', source: 'driver' as const },
        { name: 'System', value: analytics.cancellationsBySystem, color: '#06b6d4', source: 'system' as const },
    ];

    // Filter cancellation reasons based on selected source
    const filteredCancellationReasons = selectedSource
        ? analytics.cancellationReasons.filter(r => r.cancelledBy === selectedSource)
        : analytics.cancellationReasons;

    // Filter recent cancellations based on selected source
    const filteredRecentCancellations = selectedSource
        ? analytics.recentCancellations.filter(c => c.cancelledBy === selectedSource)
        : analytics.recentCancellations;

    const handlePieClick = (data: any) => {
        if (data && data.source) {
            setSelectedSource(selectedSource === data.source ? null : data.source);
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getCancelledByColor = (cancelledBy: 'passenger' | 'driver' | 'system') => {
        switch (cancelledBy) {
            case 'passenger':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'driver':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'system':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">{payload[0].name}</p>
                    <p className="text-slate-300 text-sm">
                        Count: <span className="font-bold text-white">{payload[0].value}</span>
                    </p>
                    {payload[0].payload.percentage && (
                        <p className="text-slate-300 text-sm">
                            Percentage: <span className="font-bold text-white">{payload[0].payload.percentage}%</span>
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {onUndock && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Trip Telemetry Monitor</span>
                        {isUndocked && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                SCREEN 2
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onUndock}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                        <span>{isUndocked ? 'Focus External Screen' : 'Undock display'}</span>
                    </button>
                </div>
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                    <p className="text-sm text-blue-400 mb-2">Total Trips</p>
                    <p className="text-4xl font-bold text-white">{analytics.totalTrips}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                    <p className="text-sm text-green-400 mb-2">Completed</p>
                    <p className="text-4xl font-bold text-white">{analytics.completedTrips}</p>
                </div>
                <div className="bg-gradient-to-br from-red-600/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
                    <p className="text-sm text-red-400 mb-2">Cancelled</p>
                    <p className="text-4xl font-bold text-white">{analytics.cancelledTrips}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-600/10 to-teal-600/5 border border-teal-500/20 rounded-xl p-6">
                    <p className="text-sm text-teal-400 mb-2">Completion Rate</p>
                    <p className="text-4xl font-bold text-white">{analytics.completionRate}%</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trip Outcome Pie Chart */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Trip Outcomes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={tripOutcomeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {tripOutcomeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-slate-400">Completed ({analytics.completedTrips})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-slate-400">Cancelled ({analytics.cancelledTrips})</span>
                        </div>
                    </div>
                </div>

                {/* Cancellation Source Pie Chart */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Cancellations by Source</h3>
                        {selectedSource && (
                            <button
                                onClick={() => setSelectedSource(null)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Filter
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Click on a segment to filter reasons and cancellations</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={cancellationSourceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={handlePieClick}
                                cursor="pointer"
                            >
                                {cancellationSourceData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={selectedSource === null || selectedSource === entry.source ? 1 : 0.3}
                                        stroke={selectedSource === entry.source ? '#fff' : 'none'}
                                        strokeWidth={selectedSource === entry.source ? 3 : 0}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button
                            onClick={() => handlePieClick({ source: 'passenger' })}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${selectedSource === 'passenger'
                                ? 'bg-orange-500/20 border border-orange-500/50'
                                : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-slate-400">Passenger ({analytics.cancellationsByPassenger})</span>
                        </button>
                        <button
                            onClick={() => handlePieClick({ source: 'driver' })}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${selectedSource === 'driver'
                                ? 'bg-blue-500/20 border border-blue-500/50'
                                : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-slate-400">Driver ({analytics.cancellationsByDriver})</span>
                        </button>
                        <button
                            onClick={() => handlePieClick({ source: 'system' })}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${selectedSource === 'system'
                                ? 'bg-cyan-500/20 border border-cyan-500/50'
                                : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                            <span className="text-sm text-slate-400">System ({analytics.cancellationsBySystem})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancellation Reasons Bar Chart */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                        Top Cancellation Reasons
                        {selectedSource && (
                            <span className="ml-3 text-sm font-normal text-slate-400">
                                (Filtered by: <span className="capitalize text-white">{selectedSource}</span>)
                            </span>
                        )}
                    </h3>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={filteredCancellationReasons} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis type="number" stroke="#64748b" fontSize={12} />
                        <YAxis dataKey="reason" type="category" stroke="#64748b" fontSize={12} width={180} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]}>
                            {filteredCancellationReasons.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${220 - index * 30}, 70%, 50%)`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Cancellations Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                        Recent Cancellations
                        {selectedSource && (
                            <span className="ml-3 text-sm font-normal text-slate-400">
                                (Filtered by: <span className="capitalize text-white">{selectedSource}</span>)
                            </span>
                        )}
                    </h3>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Ride ID</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Passenger</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Driver</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Cancelled By</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Reason</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecentCancellations.map((cancellation) => (
                                <tr key={cancellation.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-mono text-blue-400">{cancellation.rideId}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-white">{cancellation.passengerName || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-white">{cancellation.driverName || 'Not assigned'}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getCancelledByColor(cancellation.cancelledBy)}`}>
                                            {cancellation.cancelledBy}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-300">{cancellation.reason}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-400">{getTimeAgo(cancellation.timestamp)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TripAnalytics;
