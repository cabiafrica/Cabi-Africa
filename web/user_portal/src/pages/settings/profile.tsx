import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import PassportPhotoUploader from '@/components/ui/PassportPhotoUploader';
import { TranslationResult } from '@/lib/translator';
import { FaUserShield, FaSave, FaLanguage, FaWallet } from 'react-icons/fa';

export default function ProfileSettings() {
    const { user } = useAuth();
    const { language, setLanguage, translateUserInput } = useLanguage();

    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        privacySettings: {
            showRealName: true,
            showEmail: false,
            showPhone: false,
        },
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Translator test widget
    const [translateInput, setTranslateInput] = useState('');
    const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);

    // Seamless Top-Up & Instant Payout
    const [walletPhone, setWalletPhone] = useState('');
    const [walletAmount, setWalletAmount] = useState('500');
    const [walletProvider, setWalletProvider] = useState<'MPESA' | 'AIRTEL_MONEY'>('AIRTEL_MONEY');
    const [walletFeedback, setWalletFeedback] = useState<string | null>(null);
    const [walletBusy, setWalletBusy] = useState(false);

    useEffect(() => {
        if (user) {
            const fullName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
            setProfile((prev) => ({
                ...prev,
                fullName: fullName || prev.fullName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
            }));
            if (user.phone && !walletPhone) setWalletPhone(user.phone);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : null;
            const res = await fetch('/api/users/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userId: user?.id,
                    fullName: profile.fullName,
                    email: profile.email,
                    phone: profile.phone,
                    preferredLanguage: language,
                    privacySettings: profile.privacySettings,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Save failed');
            setMessage({ text: data.message, type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.message || 'Unable to save settings.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTranslateInput = async () => {
        if (!translateInput.trim()) return;
        const result = await translateUserInput(translateInput, language);
        setTranslationResult(result);
    };

    const handleWalletAction = async (mode: 'topup' | 'payout') => {
        setWalletBusy(true);
        setWalletFeedback(null);
        try {
            const endpoint = mode === 'topup' ? '/api/payments/topup' : '/api/payments/payout';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    phone: walletPhone || profile.phone,
                    amount: Number(walletAmount),
                    provider: walletProvider,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Transaction failed');
            setWalletFeedback(data.message);
        } catch (err: any) {
            setWalletFeedback(err.message || 'Wallet transaction failed.');
        } finally {
            setWalletBusy(false);
        }
    };

    return (
        <MainLayout title="App Settings & Edit Profile | CABI Africa">
            <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-3">
                            <FaUserShield className="text-[#D4AF37]" />
                            App Settings &amp; Edit Profile
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your profile, official passport photo, language translator, Airtel Money &amp; M-Pesa wallet, and privacy controls.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/20 shadow rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        placeholder="Your full name"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="you@example.com"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+254 712 345 678"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Official Passport Photo</label>
                                <PassportPhotoUploader onFileSelect={() => setMessage({ text: 'Passport photo validated and attached.', type: 'success' })} />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-wider"
                            >
                                <FaSave /> {isSaving ? 'Saving...' : 'Save Profile & Settings'}
                            </button>
                            {message && (
                                <p className={`text-xs font-semibold ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {message.text}
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Language Translator */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/20 shadow rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaLanguage className="text-[#D4AF37]" /> App Language &amp; Input Translator
                        </h2>
                        <div className="flex flex-wrap gap-3 items-center">
                            <label className="text-xs font-bold uppercase text-gray-500">Primary Language:</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                            >
                                <option value="en">English (EN)</option>
                                <option value="sw">Kiswahili (SW)</option>
                                <option value="fr">Français (FR)</option>
                                <option value="ar">العربية (AR)</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={translateInput}
                                onChange={(e) => setTranslateInput(e.target.value)}
                                placeholder="Type any message to translate word-by-word & by meaning..."
                                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleTranslateInput}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black"
                            >
                                Translate
                            </button>
                        </div>

                        {translationResult && (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                                <p className="text-slate-900 dark:text-white">
                                    <strong className="text-[#D4AF37]">Contextual Meaning:</strong> {translationResult.contextualTranslation}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {translationResult.wordByWord.map((w, idx) => (
                                        <span key={idx} className="px-2 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                            {w.source} &rarr; <strong className="text-[#D4AF37]">{w.translated}</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seamless Top-Up & Instant Payout */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/20 shadow rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaWallet className="text-[#D4AF37]" /> Seamless Wallet Top-Up &amp; Instant Payout
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <select
                                value={walletProvider}
                                onChange={(e) => setWalletProvider(e.target.value as any)}
                                className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                            >
                                <option value="AIRTEL_MONEY">Airtel Money</option>
                                <option value="MPESA">M-Pesa</option>
                            </select>
                            <input
                                type="tel"
                                value={walletPhone}
                                onChange={(e) => setWalletPhone(e.target.value)}
                                placeholder="+254 7XX XXX XXX"
                                className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                            />
                            <input
                                type="number"
                                value={walletAmount}
                                onChange={(e) => setWalletAmount(e.target.value)}
                                placeholder="Amount (KES)"
                                className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 dark:bg-surface-dark dark:text-white text-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                disabled={walletBusy}
                                onClick={() => handleWalletAction('topup')}
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-50"
                            >
                                Seamless Top-Up
                            </button>
                            <button
                                type="button"
                                disabled={walletBusy}
                                onClick={() => handleWalletAction('payout')}
                                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black text-xs font-black uppercase tracking-wider hover:bg-[#ffe088] disabled:opacity-50"
                            >
                                Instant Payout
                            </button>
                        </div>
                        {walletFeedback && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{walletFeedback}</p>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
