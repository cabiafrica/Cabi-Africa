'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
    SupportedLang,
    TranslationResult,
    translatePhraseOrWordsSync,
    translateTextWithBreakdown,
} from '@/lib/translator';

const UI_TRANSLATIONS: Record<SupportedLang, Record<string, string>> = {
    en: {
        'nav.home': 'Home',
        'nav.intel': 'Intel',
        'nav.about': 'About Us',
        'nav.download': 'Download App',
        'nav.login': 'Sign In',
        'nav.register': 'Get Started',
        'booking.compute': 'Compute Trajectory',
        'booking.forOther': 'Requesting this ride for someone else?',
        'settings.title': 'App Settings & Profile',
    },
    sw: {
        'nav.home': 'Nyumbani',
        'nav.intel': 'Habari',
        'nav.about': 'Kuhusu Sisi',
        'nav.download': 'Pakua Programu',
        'nav.login': 'Ingia',
        'nav.register': 'Anza Sasa',
        'booking.compute': 'Kokotoa Njia',
        'booking.forOther': 'Je, unaomba safari kwa ajili ya mtu mwingine?',
        'settings.title': 'Mipangilio na Wasifu',
    },
    fr: {
        'nav.home': 'Accueil',
        'nav.intel': 'Infos',
        'nav.about': 'À Propos',
        'nav.download': 'Télécharger',
        'nav.login': 'Connexion',
        'nav.register': 'Commencer',
        'booking.compute': 'Calculer le Trajet',
        'booking.forOther': 'Commander cette course pour quelqu’un d’autre ?',
        'settings.title': 'Paramètres et Profil',
    },
    ar: {
        'nav.home': 'الرئيسية',
        'nav.intel': 'الأخبار',
        'nav.about': 'من نحن',
        'nav.download': 'تحميل التطبيق',
        'nav.login': 'تسجيل الدخول',
        'nav.register': 'ابدأ الآن',
        'booking.compute': 'حساب المسار',
        'booking.forOther': 'هل تطلب هذه الرحلة لشخص آخر؟',
        'settings.title': 'إعدادات التطبيق والملف الشخصي',
    },
};

interface LanguageContextValue {
    language: SupportedLang;
    setLanguage: (lang: SupportedLang) => void;
    t: (key: string, fallback?: string) => string;
    translateUserInput: (text: string, target?: SupportedLang) => Promise<TranslationResult>;
}

const LanguageContext = createContext<LanguageContextValue>({
    language: 'en',
    setLanguage: () => undefined,
    t: (key, fallback) => fallback || key,
    translateUserInput: (text, target = 'sw') => translateTextWithBreakdown(text, target),
});

function shouldSkipText(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return true;
    if (/^[\d\s.,:/+\-–—()]+(\s?(AM|PM|KES|USD))?$/i.test(trimmed)) return true;
    if (/^(KES|USD|EUR)\s?[\d,]+(\.\d+)?$/i.test(trimmed)) return true;
    if (/^(EN|SW|FR|AR|CABI|GPS|PSV|OTP|SMS)$/i.test(trimmed)) return true;
    if (trimmed.includes('@') && !trimmed.includes(' ')) return true;
    return false;
}

function loadNmtCache(lang: SupportedLang): Record<string, string> {
    if (typeof window === 'undefined' || lang === 'en') return {};
    try {
        const raw = localStorage.getItem(`cabi_nmt_cache:${lang}`);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveNmtCache(lang: SupportedLang, cache: Record<string, string>) {
    if (typeof window === 'undefined' || lang === 'en') return;
    try {
        localStorage.setItem(`cabi_nmt_cache:${lang}`, JSON.stringify(cache));
    } catch {
        // Ignore storage quota errors
    }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [language, setLanguageState] = useState<SupportedLang>('en');
    const originalTextsRef = useRef<WeakMap<Text, string>>(new WeakMap());
    const originalAttrsRef = useRef<WeakMap<Element, { placeholder?: string; ariaLabel?: string }>>(new WeakMap());
    const inFlightRef = useRef<Set<string>>(new Set());
    const lastLangRef = useRef<SupportedLang>('en');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('cabi_language') as SupportedLang | null;
        if (saved && ['en', 'sw', 'fr', 'ar'].includes(saved)) {
            setLanguageState(saved);
            document.documentElement.lang = saved;
            document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        // If already in English and never translated away from English, let React manage DOM freely
        if (language === 'en' && lastLangRef.current === 'en') {
            return;
        }
        lastLangRef.current = language;
        let isApplying = false;

        const translateWithCache = (original: string, cache: Record<string, string>): string => {
            const trimmed = original.trim();
            if (shouldSkipText(trimmed)) return original;
            const cached = cache[trimmed];
            if (cached) {
                return original.replace(trimmed, cached);
            }
            return translatePhraseOrWordsSync(original, language);
        };

        const applyDomTranslation = (allowFetch: boolean) => {
            if (isApplying) return;
            isApplying = true;
            const cache = loadNmtCache(language);
            const missingTexts: string[] = [];

            try {
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                let node = walker.nextNode() as Text | null;
                while (node) {
                    const parentTag = node.parentElement?.tagName;
                    if (
                        parentTag &&
                        !['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(parentTag) &&
                        !node.parentElement?.closest('select[aria-label="Select Language"]') &&
                        node.nodeValue &&
                        node.nodeValue.trim().length > 0
                    ) {
                        if (!originalTextsRef.current.has(node)) {
                            originalTextsRef.current.set(node, node.nodeValue);
                        }
                        const original = originalTextsRef.current.get(node) || node.nodeValue;
                        const trimmed = original.trim();
                        if (language !== 'en' && !shouldSkipText(trimmed) && !cache[trimmed] && !inFlightRef.current.has(`${language}:${trimmed}`)) {
                            missingTexts.push(trimmed);
                        }
                        const nextVal = language === 'en' ? original : translateWithCache(original, cache);
                        if (node.nodeValue !== nextVal) {
                            node.nodeValue = nextVal;
                        }
                    }
                    node = walker.nextNode() as Text | null;
                }

                const elements = document.querySelectorAll('input[placeholder], textarea[placeholder], [aria-label]');
                elements.forEach((el) => {
                    if (el.getAttribute('aria-label') === 'Select Language') return;
                    if (!originalAttrsRef.current.has(el)) {
                        originalAttrsRef.current.set(el, {
                            placeholder: el.getAttribute('placeholder') || undefined,
                            ariaLabel: el.getAttribute('aria-label') || undefined,
                        });
                    }
                    const orig = originalAttrsRef.current.get(el);
                    if (orig?.placeholder) {
                        const tPh = orig.placeholder.trim();
                        if (language !== 'en' && !shouldSkipText(tPh) && !cache[tPh] && !inFlightRef.current.has(`${language}:${tPh}`)) {
                            missingTexts.push(tPh);
                        }
                        const nextPh = language === 'en' ? orig.placeholder : translateWithCache(orig.placeholder, cache);
                        if (el.getAttribute('placeholder') !== nextPh) el.setAttribute('placeholder', nextPh);
                    }
                    if (orig?.ariaLabel) {
                        const tAria = orig.ariaLabel.trim();
                        if (language !== 'en' && !shouldSkipText(tAria) && !cache[tAria] && !inFlightRef.current.has(`${language}:${tAria}`)) {
                            missingTexts.push(tAria);
                        }
                        const nextAria = language === 'en' ? orig.ariaLabel : translateWithCache(orig.ariaLabel, cache);
                        if (el.getAttribute('aria-label') !== nextAria) el.setAttribute('aria-label', nextAria);
                    }
                });
            } finally {
                isApplying = false;
            }

            if (allowFetch && language !== 'en' && missingTexts.length > 0) {
                const batch = Array.from(new Set(missingTexts)).slice(0, 80);
                batch.forEach((item) => inFlightRef.current.add(`${language}:${item}`));
                fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts: batch, targetLang: language }),
                })
                    .then((r) => (r.ok ? r.json() : null))
                    .then((data) => {
                        if (data?.translations) {
                            const updated = { ...loadNmtCache(language), ...data.translations };
                            saveNmtCache(language, updated);
                            applyDomTranslation(false);
                        }
                    })
                    .catch(() => undefined);
            }
        };

        applyDomTranslation(true);
        const t1 = setTimeout(() => applyDomTranslation(true), 150);
        const t2 = setTimeout(() => applyDomTranslation(true), 600);

        const observer = new MutationObserver(() => applyDomTranslation(false));
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        const onRouteComplete = () => applyDomTranslation(true);
        router.events?.on('routeChangeComplete', onRouteComplete);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            observer.disconnect();
            router.events?.off('routeChangeComplete', onRouteComplete);
        };
    }, [language, router.asPath, router.events]);

    const setLanguage = (lang: SupportedLang) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('cabi_language', lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        }
    };

    const t = (key: string, fallback?: string) => {
        return UI_TRANSLATIONS[language]?.[key] || UI_TRANSLATIONS.en[key] || fallback || key;
    };

    const translateUserInput = async (text: string, target?: SupportedLang) => {
        const dest = target || language;
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang: dest }),
            });
            if (res.ok) {
                return await res.json();
            }
        } catch {
            // fallback to local
        }
        return translateTextWithBreakdown(text, dest);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateUserInput }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
