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
        <div className="py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl filter drop-shadow-md">
                            Trusted by thousands in Nairobi
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-400">
                            Our growing community ensures you always have a ride when you need it.
                        </p>
                    </div>
                    <dl className="mt-16 grid grid-cols-1 gap-8 rounded-2xl text-center sm:grid-cols-3">
                        <div className="flex flex-col glass p-8 rounded-2xl border hover:border-brand-yellow/30 transition-colors">
                            <dt className="text-sm font-semibold leading-6 text-gray-400 uppercase tracking-wider">Active Drivers</dt>
                            <dd className="order-first text-4xl font-extrabold tracking-tight text-white mb-2">
                                {formatNumber(stats.activeDrivers)}<span className="text-brand-yellow">+</span>
                            </dd>
                        </div>
                        <div className="flex flex-col glass p-8 rounded-2xl border hover:border-brand-yellow/30 transition-colors">
                            <dt className="text-sm font-semibold leading-6 text-gray-400 uppercase tracking-wider">Completed Trips</dt>
                            <dd className="order-first text-4xl font-extrabold tracking-tight text-white mb-2">
                                {formatNumber(stats.completedTrips)}<span className="text-brand-yellow">+</span>
                            </dd>
                        </div>
                        <div className="flex flex-col glass p-8 rounded-2xl border hover:border-brand-yellow/30 transition-colors">
                            <dt className="text-sm font-semibold leading-6 text-gray-400 uppercase tracking-wider">Happy Passengers</dt>
                            <dd className="order-first text-4xl font-extrabold tracking-tight text-white mb-2">
                                {formatNumber(stats.happyPassengers)}<span className="text-brand-yellow">+</span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
