import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
    FaTwitter,
    FaInstagram,
    FaFacebookF,
    FaTiktok,
    FaYoutube,
    FaWhatsapp,
} from 'react-icons/fa';
import { getEnabledSocialPlatforms, SocialPlatformId } from '@/config/socialLinks';

const PLATFORM_ICONS: Record<SocialPlatformId, React.ComponentType<{ className?: string }>> = {
    x: FaTwitter,
    instagram: FaInstagram,
    facebook: FaFacebookF,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    whatsapp: FaWhatsapp,
};

interface SocialLinksProps {
    variant?: 'footer' | 'contact';
    className?: string;
}

/**
 * Renders configurable social media platform links driven by SOCIAL_PLATFORMS.
 */
export default function SocialLinks({ variant = 'contact', className = '' }: SocialLinksProps) {
    const platforms = getEnabledSocialPlatforms();
    if (platforms.length === 0) return null;

    if (variant === 'footer') {
        return (
            <div className={`pt-2 ${className}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-2.5">
                    Social Channels
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {platforms.map((platform) => {
                        const Icon = PLATFORM_ICONS[platform.id];
                        return (
                            <a
                                key={platform.id}
                                href={platform.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${platform.name} (${platform.handle})`}
                                title={`${platform.name} — ${platform.handle}`}
                                className="w-9 h-9 rounded-xl bg-white dark:bg-card-dark text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-black hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-1 hover:scale-110 hover:shadow-[0_8px_20px_-4px_rgba(212,175,55,0.45)] active:scale-95"
                            >
                                <Icon className="w-3.5 h-3.5 transition-transform duration-300" />
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                <div>
                    <div className="inline-flex items-center gap-2 mb-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">
                            Official Channels
                        </p>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Connect on{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                            Social Media
                        </span>
                    </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                    Follow live service updates, safety advisories, and community announcements.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {platforms.map((platform, idx) => {
                    const Icon = PLATFORM_ICONS[platform.id];
                    return (
                        <div
                            key={platform.id}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className="animate-slide-up"
                        >
                            <a
                                href={platform.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden flex items-center gap-3 px-3.5 py-3.5 rounded-2xl bg-white/90 dark:bg-card-dark/90 shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.03] hover:bg-white dark:hover:bg-[#1a1a1d] hover:shadow-[0_14px_30px_-8px_rgba(212,175,55,0.4)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                            >
                                {/* Subtle gold hover sheen sweep */}
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent"
                                />

                                <div className="relative w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_0_16px_rgba(212,175,55,0.45)]">
                                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#D4AF37] truncate transition-colors duration-200">
                                        {platform.name.replace(' (Twitter)', '')}
                                    </p>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                                        {platform.handle}
                                    </p>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#D4AF37] shrink-0 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

