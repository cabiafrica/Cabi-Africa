'use client';

import { useEffect, useState } from 'react';

interface Stats {
    activeDrivers: number;
    completedTrips: number;
    happyPassengers: number;
}

export default function DynamicStats() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    if (!stats) return null;

    return (
        <section className="py-24 sm:py-32 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="text-center mb-20 animate-reveal">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                            <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,1)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Network Integrity: 99.9%</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6">
                            Scalable <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-accent">Neural Logistics.</span>
                        </h2>
                        <p className="text-lg leading-8 text-white/40 max-w-2xl mx-auto font-medium">
                            Our distributed ecosystem is expanding across Nairobi, creating a decentralized web of efficient urban mobility.
                        </p>
                    </div>

                    <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                        {[
                            { label: 'Active Terminals', value: stats.activeDrivers, accent: 'brand-yellow' },
                            { label: 'Neural Deployments', value: stats.completedTrips, accent: 'brand-accent' },
                            { label: 'Verified Voyagers', value: stats.happyPassengers, accent: 'white' }
                        ].map((item, idx) => (
                            <div 
                                key={idx} 
                                className="flex flex-col items-center justify-center glass-premium p-10 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all duration-700 group hover:-translate-y-2"
                            >
                                <dt className="text-[10px] font-black leading-6 text-white/40 uppercase tracking-[0.4em] mb-4">
                                    {item.label}
                                </dt>
                                <dd className="order-first text-5xl md:text-6xl font-black tracking-tighter text-white mb-2 flex items-baseline gap-1 group-hover:scale-110 transition-transform duration-700">
                                    {formatNumber(item.value)}
                                    <span className={`text-2xl font-black text-${item.accent} opacity-40 animate-pulse`}>+</span>
                                </dd>
                                <div className="w-12 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
                                     <div className={`h-full w-2/3 bg-${item.accent} opacity-20 animate-[scan_3s_linear_infinite]`} />
                                </div>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
