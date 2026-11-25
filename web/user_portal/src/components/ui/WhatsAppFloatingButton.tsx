import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT_INFO } from '@/config/contactConfig';

export default function WhatsAppFloatingButton() {
    const defaultMessage = encodeURIComponent('Hello CABI Africa Concierge, I would like assistance.');
    const whatsappUrl = `${CONTACT_INFO.whatsAppUrl}?text=${defaultMessage}`;

    return (
        <aside aria-label="WhatsApp Support Concierge" className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with CABI Africa Support on WhatsApp at ${CONTACT_INFO.whatsAppDisplay}`}
                title={`Chat on WhatsApp (${CONTACT_INFO.whatsAppDisplay})`}
                className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_25px_-5px_rgba(37,211,102,0.55)] hover:shadow-[0_12px_30px_-4px_rgba(37,211,102,0.7)] transition-all duration-300 hover:scale-110 active:scale-95"
            >
                {/* Live Concierge Pulse Indicator */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#25D366]" />
                </span>

                <FaWhatsapp className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-12" />

                {/* Subtle Hover Tooltip for Desktop */}
                <span className="pointer-events-none absolute -top-9 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-bold bg-neutral-900/95 dark:bg-black/95 text-white px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-white/10 hidden sm:block">
                    Chat on WhatsApp ({CONTACT_INFO.whatsAppDisplay})
                </span>
            </a>
        </aside>
    );
}
