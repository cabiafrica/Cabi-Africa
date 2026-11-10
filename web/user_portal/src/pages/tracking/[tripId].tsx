import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { UserCircle2, Phone, MessageCircle, RadioTower, Radio, CheckCircle2 } from 'lucide-react';

import dynamic from 'next/dynamic';

// Dynamically import CabiMap to avoid SSR issues with Leaflet
const CabiMap = dynamic(() => import('@/components/maps/CabiMap'), {
    ssr: false,
    loading: () => <div className="bg-slate-100 dark:bg-white/5 w-full h-96 rounded-lg animate-pulse flex items-center justify-center">Loading Map...</div>
});

const MOCK_ROUTE: [number, number][] = [
    [-1.286389, 36.817223],
    [-1.285389, 36.818223],
    [-1.284389, 36.819223],
    [-1.283389, 36.820223],
    [-1.282389, 36.821223],
];

const MOCK_DIRECTIONS = [
    { instruction: 'Head north on Moi Ave toward Kenyatta Ave', distance: '200m' },
    { instruction: 'Turn left onto Kenyatta Ave', distance: '1.2km' },
    { instruction: 'Turn right onto State House Rd', distance: '800m' },
    { instruction: 'Your destination will be on the left', distance: '150m' }
];

export default function TrackingPage() {
    const router = useRouter();
    const { tripId } = router.query;
    const [trackingData, setTrackingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTraffic, setShowTraffic] = useState(false);

    useEffect(() => {
        if (!tripId) return;

        const fetchData = async () => {
            try {
                const response = await fetch(`/api/rides/${tripId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setTrackingData(null); // Not found
                    }
                    throw new Error('Failed to fetch ride status');
                }
                const data = await response.json();
                setTrackingData(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                // Only stop loading if we haven't loaded initial data yet? 
                // Or maybe keep loading state handled more gracefully.
                if (loading) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [tripId]);

    if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading delivery status...</div>;
    if (!trackingData) return <div className="p-8 text-center text-red-600">Delivery not found.</div>;

    const markers: any[] = [
        { id: 'driver', position: [trackingData.currentLocation.lat, trackingData.currentLocation.lng], type: 'driver', popup: 'Sarah M. (Driver)' },
        { id: 'pickup', position: trackingData.pickup.position, type: 'pickup', popup: 'Pickup Point' },
        { id: 'dropoff', position: trackingData.dropoff.position, type: 'dropoff', popup: 'Drop-off Point' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black pb-12 transition-colors duration-300">
            <Head>
                <title>Track Delivery #{tripId}</title>
            </Head>

            {/* Sub-Header */}
            <header className="bg-white/70 dark:bg-brand-black/70 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-3 flex justify-between items-center sticky top-16 md:top-20 z-40">
                <div className="font-black text-sm tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
                    <span>Live Telemetry Tracking</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trip #{tripId}</div>
            </header>

            <main className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Status Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status Card */}
                    <div className="glass rounded-2xl overflow-hidden shadow-2xl animate-slide-in">
                        <div className="bg-gradient-to-r from-[#D4AF37] via-[#FACC15] to-[#ffe088] p-6 text-black">
                            <h1 className="text-3xl font-black tracking-tighter mb-1">Arriving in {trackingData.eta}</h1>
                            <p className="font-bold opacity-80 text-sm">Your package is on the way</p>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center mb-8">
                                <div className="w-14 h-14 bg-brand-yellow/10 rounded-xl flex items-center justify-center border border-brand-yellow/20 shadow-inner">
                                    <UserCircle2 className="w-8 h-8 text-brand-yellow" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{trackingData.driver.name}</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mt-1">
                                        {trackingData.driver.vehicle} • <span className="text-brand-yellow">{trackingData.driver.plate}</span>
                                    </p>
                                </div>
                                <div className="ml-auto flex items-center gap-1 bg-brand-yellow/10 px-2 py-1 rounded-lg">
                                    <span className="text-brand-yellow text-xs">★</span>
                                    <span className="font-black text-brand-yellow text-sm">{trackingData.driver.rating}</span>
                                </div>
                            </div>

                            <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-white/5">
                                <div className="relative pl-10">
                                    <div className="absolute left-3 top-1 w-2 h-2 rounded-full bg-slate-400"></div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">PICKUP</p>
                                    <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                        {trackingData.pickup.address}
                                    </p>
                                    <span className="text-green-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                                    </span>
                                </div>
                                <div className="relative pl-10">
                                    <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-brand-yellow border-4 border-white dark:border-brand-black shadow-lg shadow-brand-yellow/20"></div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">DROPOFF</p>
                                    <p className="font-extrabold text-slate-900 dark:text-white leading-tight">
                                        {trackingData.dropoff.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex gap-4">
                            <button className="flex-1 py-3 bg-surface-dark dark:bg-[#FACC15] border border-[#D4AF37]/30 text-white dark:text-black font-black rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" /> Call Driver
                            </button>
                            <button className="flex-1 py-3 bg-white dark:bg-brand-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </div>

                    {/* Quick Support */}
                    <div className="glass p-6 rounded-2xl border-dashed border-2 border-slate-300 dark:border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                        <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mb-3">Need help with this delivery?</p>
                        <button className="text-brand-yellow text-sm font-black hover:underline underline-offset-4">
                            Contact 24/7 Support →
                        </button>
                    </div>
                </div>

                {/* Right Column: Map View */}
                <div className="lg:col-span-2 relative h-[600px] lg:h-auto rounded-3xl overflow-hidden shadow-3xl animate-fade-in border border-slate-200 dark:border-white/10">
                    <CabiMap
                        markers={markers}
                        route={MOCK_ROUTE}
                        height="100%"
                        showTraffic={showTraffic}
                        directions={MOCK_DIRECTIONS}
                    />

                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-4">
                        <button
                            onClick={() => setShowTraffic(!showTraffic)}
                            className={`px-6 py-3 rounded-full font-black text-sm shadow-2xl transition-all flex items-center gap-2 ${showTraffic ? 'bg-brand-yellow text-black' : 'bg-white dark:bg-brand-black text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'}`}
                        >
                            {showTraffic
                                ? <RadioTower className="w-4 h-4" />
                                : <Radio className="w-4 h-4" />
                            }
                            Traffic updates
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
