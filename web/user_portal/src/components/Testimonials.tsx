'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Testimonial {
    quote: string;
    name: string;
    role: string;
    avatarUrl?: string;
}

interface TestimonialsProps {
    title: string;
    testimonials: Testimonial[];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    const hasExternalAvatar = testimonial.avatarUrl && testimonial.avatarUrl.startsWith('http');
    const initials = testimonial.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/45 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
            <blockquote className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mb-6 font-medium leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="flex items-center">
                <div className="flex-shrink-0 h-11 w-11 relative rounded-xl overflow-hidden bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-sm">
                    {hasExternalAvatar ? (
                        <Image
                            src={testimonial.avatarUrl!}
                            alt={`${testimonial.name} — CABI Africa verified rider testimonial`}
                            fill
                            sizes="44px"
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>
                <div className="ml-4">
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                        {testimonial.name}
                    </div>
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {testimonial.role}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Testimonials({ title, testimonials }: TestimonialsProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    return (
        <section className="py-16 sm:py-24 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-3 mb-3">
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                            Rider Stories
                        </span>
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                </div>

                {/* Mobile: 1 slide per screen, auto-sliding */}
                <div className="md:hidden overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="w-full flex-shrink-0 px-1">
                                <TestimonialCard testimonial={testimonial} />
                            </div>
                        ))}
                    </div>
                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    aria-label={`View testimonial ${idx + 1}`}
                                    onClick={() => setActiveIndex(idx)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setActiveIndex(idx);
                                        }
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        activeIndex === idx ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-slate-300 dark:bg-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop/Tablet: Grid */}
                <div className="hidden md:grid md:grid-cols-2 gap-6 sm:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
}
