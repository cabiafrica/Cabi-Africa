import React from 'react';
import { FaDownload, FaCheckCircle, FaMobileAlt, FaCarSide } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

interface AppDownloadButtonsProps {
    role?: 'passenger' | 'driver' | 'both';
    caption?: string;
    tone?: 'auto' | 'dark';
    align?: 'center' | 'start';
    className?: string;
}

/**
 * Direct Device Download Market Options for CABI Go (Passenger) & CABI Drive (Driver).
 * Downloads the full production .apk directly to the gadget's Downloads folder.
 */
export default function AppDownloadButtons({
    role = 'both',
    caption,
    tone = 'auto',
    align = 'center',
    className = '',
}: AppDownloadButtonsProps) {
    const defaultCaption =
        role === 'driver'
            ? 'Official Full Release — Direct Device Download'
            : role === 'passenger'
                ? 'Official Full Release — Direct Device Download'
                : 'Select App Edition — Direct Download to Device';

    const captionColor =
        tone === 'dark'
            ? 'text-neutral-400'
            : 'text-neutral-500 dark:text-neutral-400';

    const primarySurface =
        'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black border-[#D4AF37] hover:brightness-110';

    const secondarySurface =
        tone === 'dark'
            ? 'bg-black/80 text-white border-white/20 hover:border-[#D4AF37]/80'
            : 'bg-slate-900 dark:bg-card-dark text-white border-slate-800 dark:border-white/20 hover:border-[#D4AF37]/80';

    const alignOuter = align === 'start' ? 'items-start' : 'items-center';
    const alignRow = align === 'start' ? 'justify-start' : 'justify-center';

    const passengerFirst = role !== 'driver';

    const passengerButton = (isPrimary: boolean) => (
        <a
            key="passenger-download"
            href={APP_LINKS.passenger.apkDirect}
            download={APP_LINKS.passenger.fileName}
            aria-label="Download CABI Go Passenger Full Version APK to device"
            className={`group inline-flex items-center justify-between gap-3.5 px-5 py-3.5 rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(212,175,55,0.4)] active:scale-95 ${
                isPrimary ? primarySurface : secondarySurface
            }`}
        >
            <div className="flex items-center gap-3">
                <FaMobileAlt className={`text-xl shrink-0 ${isPrimary ? 'text-black' : 'text-[#D4AF37]'}`} />
                <div className="text-left">
                    <div className={`text-[10px] font-bold uppercase tracking-wider leading-tight flex items-center gap-1 ${isPrimary ? 'text-black/80' : 'text-emerald-400'}`}>
                        <FaCheckCircle className="text-[9px]" /> Full Version • Passenger
                    </div>
                    <div className="text-sm font-black leading-tight">
                        Download CABI Go
                    </div>
                </div>
            </div>
            <FaDownload className={`text-sm shrink-0 transition-transform group-hover:translate-y-0.5 ${isPrimary ? 'text-black' : 'text-[#D4AF37]'}`} />
        </a>
    );

    const driverButton = (isPrimary: boolean) => (
        <a
            key="driver-download"
            href={APP_LINKS.driver.apkDirect}
            download={APP_LINKS.driver.fileName}
            aria-label="Download CABI Drive Driver Full Version APK to device"
            className={`group inline-flex items-center justify-between gap-3.5 px-5 py-3.5 rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(212,175,55,0.4)] active:scale-95 ${
                isPrimary ? primarySurface : secondarySurface
            }`}
        >
            <div className="flex items-center gap-3">
                <FaCarSide className={`text-xl shrink-0 ${isPrimary ? 'text-black' : 'text-[#D4AF37]'}`} />
                <div className="text-left">
                    <div className={`text-[10px] font-bold uppercase tracking-wider leading-tight flex items-center gap-1 ${isPrimary ? 'text-black/80' : 'text-emerald-400'}`}>
                        <FaCheckCircle className="text-[9px]" /> Full Version • Driver
                    </div>
                    <div className="text-sm font-black leading-tight">
                        Download CABI Drive
                    </div>
                </div>
            </div>
            <FaDownload className={`text-sm shrink-0 transition-transform group-hover:translate-y-0.5 ${isPrimary ? 'text-black' : 'text-[#D4AF37]'}`} />
        </a>
    );

    return (
        <div className={`flex flex-col ${alignOuter} ${className}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] mb-3 ${captionColor}`}>
                {caption || defaultCaption}
            </p>
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center ${alignRow} gap-3 w-full sm:w-auto`}>
                {passengerFirst
                    ? [passengerButton(true), driverButton(false)]
                    : [driverButton(true), passengerButton(false)]}
            </div>
        </div>
    );
}
