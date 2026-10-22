'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Award, Zap, ArrowRight, Car, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

export default function ExecutiveHero() {
    const scrollToBooking = () => {
        const el = document.getElementById('booking-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
            {/* Ambient Radial Gold Backlight */}
            <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
            <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                {/* Left Column: Copy & Actions */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] border border-[#D4AF37]/30 shadow-sm">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
                            Sovereign African Mobility
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                        Precision Chauffeur &amp; <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                            Urban Transit
                        </span>{' '}
                        across Africa.
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl font-normal leading-relaxed">
                        Ultra-premium mobility powered by real-time telemetry, M-Pesa instant settlement, and executive concierge. Engineered for business leaders, diplomats, and high-frequency urban travelers.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                            onClick={scrollToBooking}
                            className="px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm tracking-wide shadow-lg hover:bg-[#ffe088] transition-all duration-300 flex items-center gap-2 group active:scale-95"
                        >
                            <span>Book Executive Ride</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                        <Link
                            href="/drivers"
                            className="px-7 py-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white border border-neutral-300 dark:border-white/10 font-bold text-sm hover:border-[#D4AF37]/50 transition-all duration-300 shadow-md flex items-center gap-2"
                        >
                            <Car className="w-4 h-4 text-[#D4AF37]" />
                            <span>Drive with Cabi</span>
                        </Link>
                    </div>

                    {/* Trust Mini-bar */}
                    <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-semibold border-t border-neutral-200 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                            <span>NTSA Licensed Fleet</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#10B981]" />
                            <span>M-Pesa STK Instant Auth</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#D4AF37]" />
                            <span>Biometric Vetted Drivers</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Obsidian Luxury Fleet Visual Mockup */}
                <div className="lg:col-span-5 relative">
                    <div className="relative rounded-3xl bg-neutral-100 dark:bg-[#141416] p-3.5 border border-neutral-200 dark:border-[#D4AF37]/25 shadow-2xl flex flex-col gap-3">
                        {/* Vehicle Visual Header with Overlays */}
                        <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden bg-neutral-900">
                            <img
                                alt="Cabi Africa Executive Fleet"
                                className="w-full h-full object-cover"
                                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
                            />
                            {/* Scrim Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                            {/* Top Floating Telemetry Pill */}
                            <div className="absolute top-4 left-4 rounded-xl bg-black/75 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 border border-white/10 shadow-lg">
                                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                                    Fleet Node: NBO-EXC-09
                                </span>
                            </div>

                            {/* Bottom Visual Highlights */}
                            <div className="absolute bottom-4 inset-x-4 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                                        Flagship Unit
                                    </p>
                                    <p className="text-base font-bold text-white">
                                        Mercedes E-Class Obsidian Suite
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-neutral-400 uppercase tracking-wider">Surge Rate</p>
                                    <p className="text-xs font-black text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded border border-[#10B981]/40">
                                        1.0x Fixed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mini Route Live Tracker Simulation Widget */}
                        <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-3.5 flex items-center justify-between border border-neutral-200 dark:border-white/5 shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        JKIA VIP Terminal » Villa Rosa Kempinski
                                    </p>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        Expressway Priority • 18 mins est.
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-[#D4AF37] font-mono">
                                KES 1,850/-
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
