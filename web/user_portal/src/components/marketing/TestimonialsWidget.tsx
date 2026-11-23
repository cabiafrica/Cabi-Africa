'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ShieldCheck, TrendingUp, Sparkles, Wrench } from 'lucide-react';

const testimonials = [
    {
        content: "The captains are suddenly so calm, courteous, and respectful. It proved the driver was never the problem—oppressive commissions on legacy apps were. Treated with dignity and fair pay, you get an executive experience no other app can touch.",
        author: "Amina N.",
        role: "Corporate Commuter, Nairobi",
        seal: "Dignity & Courtesy Crest",
        initials: "AN",
        icon: ShieldCheck,
        highlight: "Respect & Dignity",
    },
    {
        content: "You feel a different energy in the cabin. Daily rides directly fund vehicle ownership and family security through Cabi Legacy and our reusable commission. Drivers can finally build lasting generational wealth, and that pride shines in every mile.",
        author: "David M.",
        role: "Tech Executive & Regular Rider",
        seal: "Partner Legacy & Equity Crest",
        initials: "DM",
        icon: TrendingUp,
        highlight: "Cabi Legacy Programs",
    },
    {
        content: "Oppressive commissions on other apps forced us to postpone repairs. Now, with Cabi's reusable commission funding vehicle upkeep and Cabi Legacy equity, servicing my car is completely effortless. Passengers immediately notice how silent and well-maintained it is.",
        author: "Josphat K.",
        role: "Driver Partner (4 Yrs Driving), Nairobi",
        seal: "Vehicle Wellness & Upkeep Crest",
        initials: "JK",
        icon: Wrench,
        highlight: "Effortless Maintenance & Pride",
    },
    {
        content: "Hands down the best mobility experience. Verified 4-digit PIN safety, calm sanctuaries, and zero surge extortion. Cabi proved drivers were never chaotic—greedy app design was. Riding here is peaceful, reliable, and best-in-class.",
        author: "Zainab B.",
        role: "Regional Business Traveler",
        seal: "Executive Sanctuary Seal",
        initials: "ZB",
        icon: Sparkles,
        highlight: "Best Experience Like No Other",
    },
];

export default function TestimonialsWidget() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [visibleCount, setVisibleCount] = useState(1);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Responsive visible count tracking
    useEffect(() => {
        const updateVisibleCount = () => {
            if (typeof window === 'undefined') return;
            if (window.innerWidth >= 1024) {
                setVisibleCount(3);
            } else if (window.innerWidth >= 768) {
                setVisibleCount(2);
            } else {
                setVisibleCount(1);
            }
        };

        updateVisibleCount();
        window.addEventListener('resize', updateVisibleCount);
        return () => window.removeEventListener('resize', updateVisibleCount);
    }, []);

    const maxIndex = Math.max(0, testimonials.length - visibleCount);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    }, [maxIndex]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, [maxIndex]);

    // Keep currentIndex in bounds when window resizes
    useEffect(() => {
        if (currentIndex > maxIndex) {
            setCurrentIndex(maxIndex);
        }
    }, [currentIndex, maxIndex]);

    // Auto-advance every 5 seconds unless paused
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, handleNext]);

    // Touch Swipe Handlers for Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsPaused(true);
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current !== null && touchEndX.current !== null) {
            const diff = touchStartX.current - touchEndX.current;
            const threshold = 40; // minimum swipe distance in px
            if (diff > threshold) {
                handleNext();
            } else if (diff < -threshold) {
                handlePrev();
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
        setTimeout(() => setIsPaused(false), 2000);
    };

    return (
        <section
            aria-label="Community Testimonials"
            className="py-14 sm:py-20 lg:py-24 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 transition-colors duration-300 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Ambient Gold Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[780px] h-[320px] bg-[#D4AF37]/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="mb-3 flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                            Satisfied Users
                        </span>
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                    </div>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                        Voice of the{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                            Ecosystem.
                        </span>
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
                        Real reflections from riders and driver partners across Kenya enjoying dignified, surge-free transit.
                    </p>
                </div>

                {/* Carousel Container */}
                <div
                    className="relative overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Slides Track */}
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                        }}
                    >
                        {testimonials.map((t, i) => {
                            const IconComponent = t.icon;
                            return (
                                <div
                                    key={i}
                                    style={{ flex: `0 0 ${100 / visibleCount}%` }}
                                    className="px-2 sm:px-3 py-2"
                                >
                                    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group relative overflow-hidden">
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <FaQuoteLeft className="text-[#D4AF37]/35 group-hover:text-[#D4AF37]/70 text-xl sm:text-2xl transition-colors duration-300" />
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                                                    {t.highlight}
                                                </span>
                                            </div>

                                            <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm sm:leading-relaxed leading-normal mb-5 font-medium italic relative z-10">
                                                &ldquo;{t.content}&rdquo;
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/10 relative z-10">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-[#D4AF37]/40 flex items-center justify-center shadow-md">
                                                    <IconComponent className="w-4 h-4 text-[#D4AF37]" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight uppercase truncate">
                                                        {t.author}
                                                    </h3>
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                                                        {t.initials}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider truncate">
                                                    {t.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile & Desktop Navigation Controls */}
                <div className="flex items-center justify-between sm:justify-center gap-4 mt-6 sm:mt-8">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous testimonial"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
                    >
                        <FaChevronLeft className="text-xs sm:text-sm" />
                    </button>

                    {/* Pagination Indicator Pills */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    currentIndex === idx
                                        ? 'w-7 sm:w-8 bg-[#D4AF37]'
                                        : 'w-2 bg-slate-300 dark:bg-white/20 hover:bg-[#D4AF37]/50'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next testimonial"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
                    >
                        <FaChevronRight className="text-xs sm:text-sm" />
                    </button>
                </div>

                {/* Mobile Swipe Hint */}
                <p className="text-center sm:hidden text-[10px] text-neutral-400 mt-2 font-medium">
                    Swipe left or right to explore testimonials
                </p>
            </div>
        </section>
    );
}
