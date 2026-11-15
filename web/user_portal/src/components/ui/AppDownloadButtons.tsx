import React from 'react';
import { FaApple, FaAndroid } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

interface AppDownloadButtonsProps {
    role: 'passenger' | 'driver';
    caption?: string;
    tone?: 'auto' | 'dark';
    align?: 'center' | 'start';
    className?: string;
}

/**
 * Direct iOS Web App & Android APK download links parameterized by app role.
 */
export default function AppDownloadButtons({
    role,
    caption,
    tone = 'auto',
    align = 'center',
    className = '',
}: AppDownloadButtonsProps) {
    const links = APP_LINKS[role];
    const defaultCaption =
        role === 'driver'
            ? 'Direct Install — CABI Driver App (iOS & Android)'
            : 'Direct Install — CABI Passenger App (iOS & Android)';

    const captionColor =
        tone === 'dark'
            ? 'text-neutral-400'
            : 'text-neutral-500 dark:text-neutral-400';

    const cardSurface =
        tone === 'dark'
            ? 'bg-black/70 text-white border-white/15 hover:border-[#D4AF37]/70'
            : 'bg-slate-900 dark:bg-card-dark text-white border-slate-800 dark:border-white/15 hover:border-[#D4AF37]/70';

    const alignOuter = align === 'start' ? 'items-start' : 'items-center';
    const alignRow = align === 'start' ? 'justify-start' : 'justify-center';

    return (
        <div className={`flex flex-col ${alignOuter} ${className}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] mb-3 ${captionColor}`}>
                {caption || defaultCaption}
            </p>
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center ${alignRow} gap-3 w-full sm:w-auto`}>
                <a
                    href={links.appStore}
                    aria-label={`Install CABI ${role === 'driver' ? 'Driver' : 'Passenger'} App on iPhone (iOS)`}
                    className={`group inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(212,175,55,0.35)] active:scale-95 ${cardSurface}`}
                >
                    <FaApple className="text-xl text-white group-hover:text-[#ffe088] transition-colors shrink-0" />
                    <div className="text-left">
                        <div className="text-[10px] uppercase tracking-wider opacity-70 leading-tight">
                            Launch & Install on
                        </div>
                        <div className="text-sm font-extrabold leading-tight">iPhone / iOS</div>
                    </div>
                </a>

                <a
                    href={links.playStore}
                    download
                    aria-label={`Download CABI ${role === 'driver' ? 'Driver' : 'Passenger'} Android APK`}
                    className={`group inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(212,175,55,0.35)] active:scale-95 ${cardSurface}`}
                >
                    <FaAndroid className="text-xl text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="text-left">
                        <div className="text-[10px] uppercase tracking-wider opacity-70 leading-tight">
                            Direct Download
                        </div>
                        <div className="text-sm font-extrabold leading-tight">Android APK</div>
                    </div>
                </a>
            </div>
        </div>
    );
}
