'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Car } from 'lucide-react';

export default function ExecutiveHero() {
    const scrollToBooking = () => {
        const el = document.getElementById('booking-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative pt-10 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
            {/* Ambient Radial Gold Backlight */}
            <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Left Column: Copy & Actions */}
                <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                        Precision Captain &amp;{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                            Urban Transit
                        </span>{' '}
                        across Africa.
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl font-normal leading-relaxed">
                        Premium mobility powered by seamless ride booking, mobile money instant checkout, and dedicated executive service. Engineered for business leaders, travelers, and everyday city commutes.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
                        <button
                            onClick={scrollToBooking}
                            className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm tracking-wide shadow-lg hover:bg-[#ffe088] transition-all duration-300 flex items-center gap-2 group active:scale-95"
                        >
                            <span>Book a Ride</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                        <Link
                            href="/drivers"
                            className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white border border-neutral-300 dark:border-white/10 font-bold text-sm hover:border-[#D4AF37]/50 transition-all duration-300 shadow-md flex items-center gap-2"
                        >
                            <Car className="w-4 h-4 text-[#D4AF37]" />
                            <span>Drive with Cabi</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Clean Multi-Tier Fleet Lineup Showcase */}
                <div className="lg:col-span-6 relative">
                    <div className="relative rounded-3xl bg-neutral-100 dark:bg-card-dark/90 backdrop-blur-2xl p-2.5 sm:p-3.5 border border-neutral-200 dark:border-[#D4AF37]/30 shadow-2xl">
                        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900">
                            <img
                                alt="Cabi Africa multi-tier mobility fleet including electric Boda, CabiGo compact, Executive Sedan, and Diplomatic XL Van across Nairobi"
                                className="w-full h-full object-cover"
                                src="/images/hero-fleet.jpg?v=2"
                                width={1200}
                                height={750}
                                loading="eager"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between gap-2">
                                <div className="bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D4AF37]/35">
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                                        Complete Mobility Suite
                                    </p>
                                    <p className="text-xs sm:text-sm font-bold text-white">
                                        Boda &bull; CabiGo &bull; Executive Suite &bull; Diplomatic XL
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
