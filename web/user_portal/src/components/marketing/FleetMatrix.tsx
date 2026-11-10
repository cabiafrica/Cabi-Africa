'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, Users, Navigation, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface FleetTier {
    id: string;
    name: string;
    category: 'all' | 'executive' | 'airport';
    tagline: string;
    description: string;
    capacity: string;
    trafficIndex: string;
    highlight: string;
    features: string[];
    isPopular?: boolean;
}

const FLEET_TIERS: FleetTier[] = [
    {
        id: 'boda',
        name: 'Cabi Boda',
        category: 'all',
        tagline: 'Agile Metropolitan Transit',
        description: 'Fastest Nairobi traffic bypass with sanitized dual helmets, DOT-certified protective gear, and hair nets.',
        capacity: '1 Passenger',
        trafficIndex: 'Express City Transit',
        highlight: 'Fastest in Congestion',
        features: ['Sanitized dual helmets', 'Live ride sharing', 'Trained defensive riders', 'Direct M-Pesa fare'],
    },
    {
        id: 'cabigo',
        name: 'CabiGo',
        category: 'all',
        tagline: 'Essential Urban Mobility',
        description: 'Everyday reliability with clean, air-conditioned compact sedans for budget-conscious corporate and private commuters.',
        capacity: '4 Passengers',
        trafficIndex: 'Standard City Service',
        highlight: 'Best Everyday Value',
        features: ['Air conditioned', 'Professional chauffeur', 'Trip security PIN', 'Clean sedans'],
        isPopular: true,
    },
    {
        id: 'executive',
        name: 'Executive Suite',
        category: 'executive',
        tagline: 'Prestige Chauffeur Service',
        description: 'Mercedes-Benz E-Class & Lexus luxury sedans with professional suited chauffeurs, onboard Wi-Fi, and mineral water.',
        capacity: '3 Passengers',
        trafficIndex: 'VIP Lane & Expressway',
        highlight: 'Luxury & Diplomatic',
        features: ['Mercedes E-Class / Lexus', 'Suited executive chauffeur', 'High-speed 5G Wi-Fi', 'Bottled water & chargers'],
    },
    {
        id: 'xl',
        name: 'Diplomatic XL / Van',
        category: 'airport',
        tagline: 'Airport & Delegation Lounge',
        description: 'Toyota Alphard Executive Lounge & Land Cruisers for diplomatic motorcades, airport delegations, and team transfers.',
        capacity: '6-7 Passengers',
        trafficIndex: 'Expressway Priority',
        highlight: 'Delegations & Airport',
        features: ['Captain recliner seats', 'JKIA luggage hold capacity', 'Expressway toll included', 'Security escort compatible'],
    },
];

export default function FleetMatrix() {
    const [activeTab, setActiveTab] = useState<'all' | 'executive' | 'airport'>('all');

    const filteredTiers = activeTab === 'all' 
        ? FLEET_TIERS 
        : FLEET_TIERS.filter(tier => tier.category === activeTab || (activeTab === 'executive' && tier.id === 'xl'));

    const handleSelectTier = (tier: FleetTier) => {
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tactical-booking', {
                detail: {
                    pickup: 'Current Location',
                    destination: tier.category === 'airport' ? 'JKIA Terminal 1A, Nairobi' : 'Westlands, Nairobi',
                }
            }));
        }
    };

    return (
        <section id="fleet" className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
            {/* Header & Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                            Our Fleet
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Flagship <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">Fleet Selection</span>
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-xl mt-2 font-medium">
                        Engineered for rapid metropolitan transit, corporate commutes, diplomatic delegations, and seamless airport connections.
                    </p>
                </div>

                {/* Filter Selector Tabs */}
                <div className="bg-neutral-100 dark:bg-[#1A1A1A] p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-1 border border-neutral-300 dark:border-neutral-800 self-start w-full sm:w-auto shadow-sm">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                            activeTab === 'all'
                                ? 'bg-[#D4AF37] text-black shadow-md'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        All Tiers
                    </button>
                    <button
                        onClick={() => setActiveTab('executive')}
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                            activeTab === 'executive'
                                ? 'bg-[#D4AF37] text-black shadow-md'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Executive Suite
                    </button>
                    <button
                        onClick={() => setActiveTab('airport')}
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                            activeTab === 'airport'
                                ? 'bg-[#D4AF37] text-black shadow-md'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Airport & Delegation
                    </button>
                </div>
            </div>

            {/* Grid of Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTiers.map((tier) => (
                    <div
                        key={tier.id}
                        className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 ${
                            tier.isPopular
                                ? 'bg-white dark:bg-[#18181A] border-2 border-[#D4AF37] shadow-[0_12px_40px_rgba(212,175,55,0.18)]'
                                : 'bg-white dark:bg-[#141416] border border-neutral-200 dark:border-white/10 shadow-lg hover:border-[#D4AF37]/50'
                        }`}
                    >
                        {tier.isPopular && (
                            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                                Most Popular
                            </div>
                        )}

                        <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                                    {tier.highlight}
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                    <Navigation className="w-4 h-4" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                                {tier.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">
                                {tier.description}
                            </p>

                            {/* Spec Badges */}
                            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-[#1E1E20] space-y-2 mb-6 border border-neutral-200 dark:border-white/5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Capacity
                                    </span>
                                    <strong className="text-slate-900 dark:text-white">{tier.capacity}</strong>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-[#10B981]" /> Transit Route
                                    </span>
                                    <strong className="text-[#10B981]">{tier.trafficIndex}</strong>
                                </div>
                            </div>

                            {/* Features Checklist */}
                            <ul className="space-y-2 mb-6">
                                {tier.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Card Bottom / CTA */}
                        <div className="pt-4 border-t border-neutral-200 dark:border-white/10">
                            <button
                                onClick={() => handleSelectTier(tier)}
                                className="w-full py-3 rounded-xl bg-slate-900 text-white dark:bg-[#D4AF37] dark:text-black font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 group shadow-md"
                            >
                                <span>Select & Book</span>
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
