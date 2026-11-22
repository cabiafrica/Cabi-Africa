import React from 'react';
import Link from 'next/link';
import { FaDownload, FaMobileAlt, FaCarSide } from 'react-icons/fa';

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
            ? 'Get the Official CABI Drive App'
            : role === 'passenger'
                ? 'Get the Official CABI Go App'
                : 'Get Official CABI Mobile Apps';

    const captionColor =
        tone === 'dark'
            ? 'text-neutral-400'
            : 'text-neutral-500 dark:text-neutral-400';

    const targetHref =
        role === 'driver'
            ? '/download#driver'
            : role === 'passenger'
                ? '/download#passenger'
                : '/download';

    const buttonLabel =
        role === 'driver'
            ? 'Download CABI Drive (Driver App)'
            : role === 'passenger'
                ? 'Download CABI Go (Passenger App)'
                : 'Download CABI Africa Apps';

    const Icon = role === 'driver' ? FaCarSide : FaMobileAlt;

    return (
        <div className={`flex flex-col ${alignOuter} ${className}`}>
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] mb-3 ${captionColor}`}>
                {caption || defaultCaption}
            </p>

            <div className="flex items-center gap-3">
                <Link
                    href={targetHref}
                    className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold text-xs tracking-wide shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                >
                    <Icon className="text-sm" />
                    <span>{buttonLabel}</span>
                    <FaDownload className="text-xs opacity-75" />
                </Link>
            </div>
        </div>
    );
}
