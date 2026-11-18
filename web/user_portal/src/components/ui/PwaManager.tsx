'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaManager() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
                console.warn('Service worker registration failed:', err);
            });
        }

        const wasDismissed = sessionStorage.getItem('cabi_pwa_dismissed') === '1';
        if (wasDismissed) setDismissed(true);

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (!deferredPrompt || dismissed) return null;

    const handleInstall = async () => {
        try {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
        } finally {
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem('cabi_pwa_dismissed', '1');
    };

    return (
        <div className="fixed top-20 right-4 z-50 max-w-xs bg-[#111216] text-white border border-[#D4AF37]/40 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">Install CABI PWA</p>
                <p className="text-[11px] text-slate-300 truncate">Quick ride access & offline support</p>
            </div>
            <button
                type="button"
                onClick={handleInstall}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleInstall();
                    }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black text-[11px] font-black uppercase tracking-wider hover:bg-amber-400 transition-colors"
            >
                Install
            </button>
            <button
                type="button"
                onClick={handleDismiss}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDismiss();
                    }
                }}
                aria-label="Dismiss install prompt"
                className="p-1 text-slate-400 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
