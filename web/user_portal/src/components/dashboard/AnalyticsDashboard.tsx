import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface AnalyticsProps {
    role?: 'driver' | 'passenger';
}

export default function AnalyticsDashboard({ role = 'driver' }: AnalyticsProps) {
    const driverData = [
        { name: 'Mon', revenue: 4000, rides: 24, referrals: 240 },
        { name: 'Tue', revenue: 3000, rides: 13, referrals: 139 },
        { name: 'Wed', revenue: 4500, rides: 98, referrals: 980 },
        { name: 'Thu', revenue: 2780, rides: 39, referrals: 390 },
        { name: 'Fri', revenue: 5890, rides: 48, referrals: 480 },
        { name: 'Sat', revenue: 6390, rides: 58, referrals: 580 },
        { name: 'Sun', revenue: 7490, rides: 63, referrals: 630 },
    ];

    const passengerData = [
        { name: 'Mon', spend: 400, distance: 12 },
        { name: 'Tue', spend: 300, distance: 8 },
        { name: 'Wed', spend: 800, distance: 24 },
        { name: 'Thu', spend: 200, distance: 5 },
        { name: 'Fri', spend: 1200, distance: 35 },
        { name: 'Sat', spend: 1500, distance: 40 },
        { name: 'Sun', spend: 600, distance: 15 },
    ];

    const activityData = [
        { subject: 'Reliability', A: role === 'driver' ? 98 : 95, fullMark: 100 },
        { subject: 'Punctuality', A: role === 'driver' ? 85 : 90, fullMark: 100 },
        { subject: 'Communication', A: role === 'driver' ? 92 : 88, fullMark: 100 },
        { subject: 'Safety', A: role === 'driver' ? 100 : 98, fullMark: 100 },
        { subject: 'Efficiency', A: role === 'driver' ? 78 : 82, fullMark: 100 },
    ];

    const hourlyActivity = [
        { hour: '00:00', value: 10 }, { hour: '04:00', value: 5 }, { hour: '08:00', value: 85 },
        { hour: '12:00', value: 45 }, { hour: '16:00', value: 95 }, { hour: '20:00', value: 30 },
    ];

    const data: any[] = role === 'driver' ? driverData : passengerData;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{role === 'driver' ? 'Driver Performance' : 'Travel Insights'}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Trend */}
                <div className="glass p-8 rounded-[1.25rem] border border-white/5 bg-white/5 dark:bg-black/20">
                    <h3 className="text-slate-500 dark:text-gray-500 text-[10px] uppercase mb-6 font-black tracking-[0.2em]">
                        {role === 'driver' ? 'Revenue Trend (Weekly)' : 'Spending Trend (Weekly)'}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBC05" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FBBC05" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#888"
                                    fontSize={10}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#888"
                                    fontSize={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#FBBC05', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={role === 'driver' ? 'revenue' : 'spend'}
                                    stroke="#FBBC05"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorMain)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="glass p-8 rounded-[1.25rem] border border-white/5 bg-white/5 dark:bg-black/20">
                    <h3 className="text-slate-500 dark:text-gray-500 text-[10px] uppercase mb-6 font-black tracking-[0.2em]">
                        {role === 'driver' ? 'Rides & Business Builder' : 'Distance vs Cost'}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#888"
                                    fontSize={10}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#888"
                                    fontSize={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        fontWeight: 'black',
                                        letterSpacing: '0.1em',
                                        paddingBottom: '20px'
                                    }}
                                />
                                <Bar
                                    dataKey={role === 'driver' ? 'rides' : 'distance'}
                                    fill="#00f2fe"
                                    radius={[6, 6, 0, 0]}
                                    name={role === 'driver' ? 'Rides Completed' : 'Distance (KM)'}
                                    animationDuration={2500}
                                />
                                {role === 'driver' && (
                                    <Bar
                                        dataKey="referrals"
                                        fill="#FBBC05"
                                        radius={[6, 6, 0, 0]}
                                        name="Referral Bonus"
                                        animationDuration={3000}
                                    />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Intensity (Hourly) */}
                <div className="lg:col-span-2 glass p-8 rounded-[1.25rem] border border-white/5 bg-white/5 dark:bg-black/20">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-slate-500 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Activity Analyst</h3>
                            <div className="text-lg font-bold mt-1">Peak Intensity Hours</div>
                        </div>
                        <div className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-md text-[10px] font-black uppercase tracking-widest">Live Analysis</div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyActivity}>
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} fontSize={10} stroke="#888" />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '8px', border: 'none' }}
                                    itemStyle={{ color: '#FBBC05' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#FBBC05"
                                    fill="#FBBC05"
                                    fillOpacity={0.1}
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-6 p-4 bg-slate-100 dark:bg-white/5 rounded-lg border border-white/5">
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-black">Morning Peak</div>
                            <div className="font-bold">08:45 AM</div>
                        </div>
                        <div className="w-[1px] bg-slate-200 dark:bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-black">Evening Peak</div>
                            <div className="font-bold">05:30 PM</div>
                        </div>
                        <div className="w-[1px] bg-slate-200 dark:bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-black">Engagement</div>
                            <div className="font-bold text-brand-accent">High</div>
                        </div>
                    </div>
                </div>

                {/* Behavioral Radar */}
                <div className="glass p-8 rounded-[1.25rem] border border-white/5 bg-white/5 dark:bg-black/20 overflow-hidden">
                    <h3 className="text-slate-500 dark:text-gray-500 text-[10px] uppercase mb-6 font-black tracking-[0.2em]">Performance Index</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={activityData}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#00f2fe"
                                    fill="#00f2fe"
                                    fillOpacity={0.5}
                                    animationDuration={2000}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: '8px', border: 'none' }}
                                    itemStyle={{ color: '#00f2fe' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 text-center">
                        <div className="text-2xl font-black text-brand-accent">9.2<span className="text-xs text-slate-500 font-bold ml-1">/10</span></div>
                        <div className="text-[10px] text-slate-500 uppercase font-black mt-1">Global Activity Score</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
