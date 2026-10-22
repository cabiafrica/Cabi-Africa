'use client';

import React from 'react';
import { Activity, Zap, Clock, ShieldCheck } from 'lucide-react';

export default function LiveTelemetryBar() {
    return (
        <section className="w-full bg-[#141416] border-y border-[#D4AF37]/20 py-2.5 px-4 sm:px-6 relative z-30 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
                {/* Left: Operational corridors */}
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[#D4AF37] font-semibold tracking-wider uppercase text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                        <span className="relative w-2 h-2 rounded-full bg-[#10B981] -ml-3.5" />
                        Live Dispatch Telemetry
                    </span>
                    <span className="hidden md:inline text-neutral-700">|</span>
                    <span className="hidden md:inline text-neutral-300 font-medium truncate">
                        Nairobi Central • Westlands • Upper Hill • Kilimani Corridor Operational
                    </span>
                </div>

                {/* Right: Telemetry Key Performance Indicators */}
                <div className="flex items-center gap-5 text-[11px] font-medium text-neutral-300">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Average Arrival: <strong className="text-white">3.4 mins</strong></span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[#10B981]">
                        <Zap className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>M-Pesa Daraja 3.0 Instant Payouts Active</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-1 text-[#D4AF37]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>100% NTSA Clearance</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
