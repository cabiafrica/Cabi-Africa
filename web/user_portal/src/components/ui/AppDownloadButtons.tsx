import React from 'react';
import Link from 'next/link';
import { FaAndroid, FaApple, FaDownload, FaMobileAlt, FaCarSide } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

interface AppDownloadButtonsProps {
    role?: 'passenger' | 'driver' | 'both';
    caption?: string;
    tone?: 'auto' | 'dark';
    align?: 'center' | 'start';
    className?: string;
}

export default function AppDownloadButtons({
    role = 'both',
    caption,
    tone = 'auto',
    align = 'center',
    className = '',
}: AppDownloadButtonsProps) {
    const alignOuter = align === 'start' ? 'items-start text-left' : 'items-center text-center';

    const defaultCaption =
        role === 'driver'
            ? 'Download Official CABI Drive App'
            : role === 'passenger'
                ? 'Download Official CABI Go App'
                : 'Download Official CABI Mobile Apps';

    const captionColor =
        tone === 'dark'
            ? 'text-neutral-400'
            : 'text-neutral-500 dark:text-neutral-400';

    return (
        <div className={`flex flex-col ${alignOuter} ${className}`}>
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] mb-3 ${captionColor}`}>
                {caption || defaultCaption}
            </p>

            <div className="flex flex-wrap items-center gap-3">
                {/* Passenger Apps */}
                {(role === 'passenger' || role === 'both') && (
                    <div className="flex items-center gap-2">
                        <a
                            href={APP_LINKS.passenger.apkDirect}
                            download={APP_LINKS.passenger.fileName}
                            className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold text-xs tracking-wide shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                            title="Download CABI Go APK for Android"
                        >
                            <FaAndroid className="text-base text-emerald-950" />
                            <span>Passenger (.apk)</span>
                            <FaDownload className="text-xs opacity-75" />
                        </a>
                        <a
                            href={APP_LINKS.passenger.iosWebApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-3 rounded-xl bg-white/10 dark:bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white border border-neutral-300 dark:border-white/15 font-bold text-xs transition-all duration-300 hover:-translate-y-0.5"
                            title="Install CABI Go iOS PWA"
                        >
                            <FaApple className="text-sm" />
                            <span>iOS App</span>
                        </a>
                    </div>
                )}

                {/* Driver Apps */}
                {(role === 'driver' || role === 'both') && (
                    <div className="flex items-center gap-2">
                        <a
                            href={APP_LINKS.driver.apkDirect}
                            download={APP_LINKS.driver.fileName}
                            className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 dark:bg-black hover:bg-neutral-800 text-white border border-[#D4AF37]/60 font-extrabold text-xs tracking-wide shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                            title="Download CABI Drive APK for Android"
                        >
                            <FaCarSide className="text-sm text-[#D4AF37]" />
                            <span>Driver (.apk)</span>
                            <FaDownload className="text-xs text-[#D4AF37]" />
                        </a>
                        <a
                            href={APP_LINKS.driver.iosWebApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-3 rounded-xl bg-white/10 dark:bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white border border-neutral-300 dark:border-white/15 font-bold text-xs transition-all duration-300 hover:-translate-y-0.5"
                            title="Install CABI Drive iOS PWA"
                        >
                            <FaApple className="text-sm" />
                            <span>Driver iOS</span>
                        </a>
                    </div>
                )}

                <Link
                    href="/download"
                    className="text-[11px] font-bold text-[#D4AF37] hover:underline underline-offset-4 ml-1"
                >
                    All Downloads &rarr;
                </Link>
            </div>
        </div>
    );
}
