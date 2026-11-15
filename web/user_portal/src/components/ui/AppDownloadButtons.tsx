import React from 'react';
import { FaArrowDown, FaMobileAlt, FaCarSide } from 'react-icons/fa';

interface AppDownloadButtonsProps {
    role?: 'passenger' | 'driver' | 'both';
    caption?: string;
    tone?: 'auto' | 'dark';
    align?: 'center' | 'start';
    className?: string;
}

/**
 * Scrolls the user to the Footer Download Menu where all official
 * CABI Go (Passenger) & CABI Drive (Driver) download links reside.
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
            ? 'Official Driver App Available in Footer Menu'
            : role === 'passenger'
                ? 'Official Passenger App Available in Footer Menu'
                : 'Official Mobile Apps Available in Footer Menu';

    const captionColor =
        tone === 'dark'
            ? 'text-neutral-400'
            : 'text-neutral-500 dark:text-neutral-400';

    const alignOuter = align === 'start' ? 'items-start' : 'items-center';

    const label =
        role === 'driver'
            ? 'Download CABI Drive (Footer Menu)'
            : role === 'passenger'
                ? 'Download CABI Go (Footer Menu)'
                : 'Download Apps in Footer Menu';

    const Icon = role === 'driver' ? FaCarSide : FaMobileAlt;

    return (
        <div className={`flex flex-col ${alignOuter} ${className}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] mb-3 ${captionColor}`}>
                {caption || defaultCaption}
            </p>
            <a
                href="#footer-download-menu"
                className="group inline-flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-black text-sm shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
            >
                <Icon className="text-lg shrink-0" />
                <span>{label}</span>
                <FaArrowDown className="text-xs shrink-0 transition-transform group-hover:translate-y-0.5" />
            </a>
        </div>
    );
}
