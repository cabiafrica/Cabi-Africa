import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import AppDownloadButtons from '@/components/ui/AppDownloadButtons';

interface FeatureSplitProps {
    type: 'driver' | 'passenger';
}

export default function FeatureSplit({ type }: FeatureSplitProps) {
    const isDriver = type === 'driver';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const content = isDriver
        ? {
              eyebrow: 'For Drivers',
              badge: 'Driver Partner',
              titlePrefix: 'Drive & Earn on Your',
              titleHighlight: 'Terms',
              message:
                  'Join a growing network of professional drivers. Enjoy fair earnings, transparent tracking, and dedicated support built for long-term growth.',
              buttonText: 'Learn More',
              buttonLink: '/drivers',
              image: '/images/driver-partner-ecosystem.jpg',
              imageAlt: 'CABI Africa driver-partner mobility platform — reusable commission model, Cabi Legacy equity, and instant mobile money settlement illustration',
          }
        : {
              eyebrow: 'For Passengers',
              badge: 'Passenger Experience',
              titlePrefix: 'Ride in Comfort &',
              titleHighlight: 'Style',
              message:
                  'Experience seamless urban mobility. Whether it is a quick city commute or an executive transfer, CABI gets you there smoothly and safely.',
              buttonText: 'Learn More',
              buttonLink: '/passengers',
              image: '/images/passenger-executive-comfort.jpg',
              imageAlt: 'CABI Africa executive passenger cabin experience — ambient luxury sanctuary, verified PIN safety, and seamless urban transit in Nairobi',
          };

    return (
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 overflow-hidden relative group/section transition-colors duration-300">
            {/* Ambient Obsidian-Gold Background Glow */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 ${
                    isDriver ? 'left-1/4' : 'right-1/4'
                } w-[520px] h-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none animate-gold-aura`}
            />

            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                <div
                    className={`flex flex-col lg:flex-row items-center gap-10 sm:gap-16 lg:gap-20 ${
                        isDriver ? '' : 'lg:flex-row-reverse'
                    }`}
                >
                    {/* Visual Showcase with Golden Aura & Shimmer Animation */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#D4AF37]/40 via-[#FACC15]/25 to-[#ffe088]/35 rounded-[2.25rem] blur-2xl animate-gold-aura group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

                        <figure className="relative rounded-3xl bg-white dark:bg-card-dark/90 p-2.5 sm:p-3.5 border border-slate-200 dark:border-[#D4AF37]/35 shadow-2xl transition-transform duration-700 group-hover:-translate-y-1">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A0A0B]">
                                <Image
                                    src={content.image}
                                    alt={content.imageAlt}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority={isDriver}
                                />

                                {/* Dark-Gold Cinematic Contrast Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

                                {/* Animated Golden Shimmer Sweep */}
                                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#ffe088]/25 to-transparent pointer-events-none animate-gold-shimmer" />

                                {/* Obsidian-Gold Partner Pill */}
                                <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#D4AF37]/45 bg-black/80 backdrop-blur-xl shadow-lg">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]" />
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#ffe088]">
                                            {content.badge}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <figcaption className="sr-only">
                                {content.imageAlt}
                            </figcaption>
                        </figure>
                    </div>

                    {/* Editorial Copy & Golden CTA */}
                    <div className="w-full lg:w-1/2 text-left">
                        <div className="mb-4 sm:mb-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                                {content.eyebrow}
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-5 sm:mb-7 leading-[1.08] tracking-tight">
                            {content.titlePrefix}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                {content.titleHighlight}
                            </span>
                        </h2>

                        <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 mb-8 sm:mb-10 leading-relaxed max-w-xl font-normal">
                            {content.message}
                        </p>

                        <Link
                            href={content.buttonLink}
                            className="group/btn relative overflow-hidden inline-flex w-full sm:w-auto justify-center items-center gap-3.5 px-8 sm:px-9 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FACC15] to-[#D4AF37] text-black font-black uppercase tracking-widest text-xs sm:text-sm shadow-[0_18px_40px_-12px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_48px_-10px_rgba(250,204,21,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
                        >
                            <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/btn:translate-x-[350%] transition-transform duration-700 skew-x-[-18deg]" />
                            <span className="relative z-10">{content.buttonText}</span>
                            {mounted && (
                                <FaArrowRight className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                            )}
                        </Link>

                        <AppDownloadButtons
                            role={type}
                            align="start"
                            caption={
                                isDriver
                                    ? 'Download the CABI Driver App'
                                    : 'Download the CABI Passenger App'
                            }
                            className="mt-7"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
