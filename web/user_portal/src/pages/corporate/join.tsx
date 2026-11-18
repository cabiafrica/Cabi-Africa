import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Briefcase, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Car, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CorporateJoinPage() {
    const router = useRouter();
    const { token } = router.query;

    const [isLoading, setIsLoading] = useState(true);
    const [inviteData, setInviteData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchInvite = async () => {
            try {
                const res = await fetch(`/api/corporate/invite/${token}`);
                const json = await res.json();
                if (json.success) {
                    setInviteData(json.data);
                } else {
                    setErrorMessage(json.message || 'Invitation not found or already accepted.');
                }
            } catch (err: any) {
                setErrorMessage('Failed to resolve invitation token.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvite();
    }, [token]);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const res = await fetch(`/api/corporate/invite/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'demo-passenger-user-01' })
            });
            const json = await res.json();
            if (json.success) {
                setIsAccepted(true);
            } else {
                setErrorMessage(json.message || 'Failed to accept invitation.');
            }
        } catch (err) {
            setErrorMessage('Network error while accepting invitation.');
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white selection:bg-brand-yellow selection:text-black transition-colors duration-300">
            <Head>
                <title>Join Corporate Travel | Cabi for Business</title>
                <meta name="description" content="Accept your corporate travel invitation and link your Cabi Go passenger account to your company billing." />
                <meta property="og:title" content="Join Corporate Travel | Cabi for Business" />
            </Head>

            <Header />

            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center">
                <div className="w-full max-w-lg bg-white dark:bg-surface-dark/95 border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                            <span className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-gray-400">Verifying your invitation...</span>
                        </div>
                    ) : errorMessage ? (
                        <div className="py-8 space-y-4 animate-fade-in">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid or Expired Invitation</h2>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">{errorMessage}</p>
                            <div className="pt-4">
                                <Link 
                                    href="/corporate/login" 
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
                                >
                                    Go to Corporate Login
                                </Link>
                            </div>
                        </div>
                    ) : isAccepted ? (
                        <div className="py-8 space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black">Invitation Accepted!</h2>
                            <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                                You are now connected to <strong className="text-white">{inviteData?.companyName}</strong>'s corporate travel program. When booking rides on the Cabi Go mobile app, you can now toggle to your <strong>Corporate Profile</strong> to charge rides directly to your company.
                            </p>
                            <div className="pt-4">
                                <Link 
                                    href="/download" 
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    Open Cabi Go App <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                                <Briefcase className="w-8 h-8" />
                            </div>

                            <div>
                                <span className="text-xs font-bold text-brand-yellow tracking-wider uppercase">
                                    Official Company Invitation
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                                    {inviteData?.companyName}
                                </h2>
                                <p className="text-xs text-gray-400 mt-2">
                                    Invited you to join their business travel account on Cabi Africa
                                </p>
                            </div>

                            {/* Invitation Details Card */}
                            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-700 dark:text-gray-300">
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-500">Recipient Email:</span>
                                    <strong className="text-slate-900 dark:text-white font-mono">{inviteData?.email}</strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-500">Department:</span>
                                    <strong className="text-slate-900 dark:text-white">{inviteData?.department}</strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-500">Assigned Role:</span>
                                    <span className="px-2 py-0.5 rounded bg-brand-yellow/20 text-brand-yellow font-bold text-[10px]">
                                        {inviteData?.role}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-500">Expires:</span>
                                    <span className="text-gray-400">{new Date(inviteData?.expiresAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* What you get */}
                            <div className="text-left space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span>Hail business rides with zero out-of-pocket expense</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span>Automated digital ride receipts sent to your company</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span>Out-of-policy trips supported via Grace Business Justification</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAccept}
                                disabled={isAccepting}
                                className="w-full py-3.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isAccepting ? 'Accepting & Linking Account...' : 'Accept Invitation & Link Account'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
