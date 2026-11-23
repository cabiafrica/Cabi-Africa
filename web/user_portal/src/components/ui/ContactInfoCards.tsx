import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, CalendarCheck, Copy, Check, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT_INFO } from '@/config/contactConfig';

interface ContactInfoCardsProps {
    layout?: 'stack' | 'grid';
    className?: string;
}

/**
 * Shared Phone (copy + dialer), WhatsApp (direct chat), Email (mailto composer), and Office Appointment CTA cards.
 */
export default function ContactInfoCards({
    layout = 'stack',
    className = '',
}: ContactInfoCardsProps) {
    const [copiedPhone, setCopiedPhone] = useState(false);

    const handlePhoneClick = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(CONTACT_INFO.phoneDisplay).catch((err) => {
                console.warn('[Clipboard] Failed to copy phone number:', err);
            });
        }
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2500);
    };

    const containerClass =
        layout === 'grid'
            ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`
            : `space-y-4 ${className}`;

    const mailtoHref = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent('Cabi Africa Inquiry')}`;

    return (
        <div className={containerClass}>
            {/* Phone: copies number & triggers device dialer */}
            <a
                href={`tel:${CONTACT_INFO.phoneDial}`}
                onClick={handlePhoneClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handlePhoneClick();
                    }
                }}
                aria-label={`Call and copy ${CONTACT_INFO.phoneDisplay}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/60 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                            Phone Hotline
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors truncate">
                            {CONTACT_INFO.phoneDisplay}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {copiedPhone ? 'Copied & opening dialer...' : 'Click to copy & open dialer'}
                        </p>
                    </div>
                </div>
                <span className="text-neutral-400 group-hover:text-[#D4AF37] shrink-0">
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </span>
            </a>

            {/* WhatsApp: direct chat with WhatsApp Concierge */}
            <a
                href={CONTACT_INFO.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat on WhatsApp at ${CONTACT_INFO.whatsAppDisplay}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#25D366]/60 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0">
                        <FaWhatsapp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                            WhatsApp Concierge
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#25D366] transition-colors truncate">
                            {CONTACT_INFO.whatsAppDisplay}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Click to chat on WhatsApp
                        </p>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all shrink-0" />
            </a>

            {/* Email: opens email composer with recipient pre-selected */}
            <a
                href={mailtoHref}
                aria-label={`Email ${CONTACT_INFO.email}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/60 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                            Email Support
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors truncate">
                            {CONTACT_INFO.email}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Click to compose email
                        </p>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0" />
            </a>

            {/* Visit our office: Book an appointment */}
            <Link
                href={CONTACT_INFO.appointmentPath}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card-dark border border-[#D4AF37]/35 hover:border-[#D4AF37] transition-all group shadow-sm"
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black shrink-0">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                            Visit Our Office
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors truncate">
                            Book an Appointment
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                            {CONTACT_INFO.officeName}
                        </p>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
        </div>
    );
}

