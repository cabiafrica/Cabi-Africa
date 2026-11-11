import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandLogo from '@/components/ui/BrandLogo';

export default function CorporateLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Check for demo account
            if (email.toLowerCase().includes('nexus') || email.toLowerCase().includes('demo') || email.toLowerCase() === 'corporate@nexusafrica.io') {
                localStorage.setItem('cabi_corp_org_id', 'corp-nexus-tech-01');
                localStorage.setItem('cabi_corp_company', 'Nexus Innovations Africa Ltd');
                localStorage.setItem('cabi_corp_admin', 'David Kiprono');
                router.push('/corporate/dashboard?orgId=corp-nexus-tech-01');
                return;
            }

            // Normal login lookup
            const res = await fetch(`/api/corporate/overview?orgId=corp-nexus-tech-01`);
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('cabi_corp_org_id', 'corp-nexus-tech-01');
                localStorage.setItem('cabi_corp_company', data.data.account?.companyName || 'Corporate Account');
                router.push('/corporate/dashboard?orgId=corp-nexus-tech-01');
            } else {
                throw new Error('Corporate account not found');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to sign in. Please verify your corporate email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = () => {
        localStorage.setItem('cabi_corp_org_id', 'corp-nexus-tech-01');
        localStorage.setItem('cabi_corp_company', 'Nexus Innovations Africa Ltd');
        localStorage.setItem('cabi_corp_admin', 'David Kiprono');
        router.push('/corporate/dashboard?orgId=corp-nexus-tech-01');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white selection:bg-brand-yellow selection:text-black transition-colors duration-300">
            <Head>
                <title>Corporate Login | Cabi for Business</title>
                <meta name="description" content="Sign in to your Cabi for Business Corporate Admin Portal to manage company rides, employee allowances, and travel policies." />
            </Head>

            <Header />

            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-white dark:bg-surface-dark/95 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Glow Accents */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-8">
                        <BrandLogo size="md" className="mx-auto mb-4" />
                        <h1 className="text-2xl font-black tracking-tight">Corporate Portal Sign In</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Access your team travel management and corporate billing dashboard
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                Work Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="corporate@yourcompany.com"
                                    required
                                    className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded text-brand-yellow focus:ring-brand-yellow bg-brand-black" />
                                <span>Remember device</span>
                            </label>
                            <Link href="/reset-password" className="hover:text-brand-yellow transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-sm tracking-wide transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.25)] disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Quick Demo Access Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-surface-dark px-2 text-slate-500 dark:text-gray-500 font-semibold tracking-wider">
                                Instant Demo Preview
                            </span>
                        </div>
                    </div>

                    {/* 1-Click Demo Button */}
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-brand-yellow/30 hover:border-brand-yellow text-xs font-semibold text-slate-800 dark:text-gray-200 transition-all group"
                    >
                        <Sparkles className="w-4 h-4 text-brand-yellow group-hover:rotate-12 transition-transform" />
                        <span>Launch Demo Enterprise (Nexus Innovations Africa)</span>
                    </button>

                    <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-gray-400">
                        Don't have a corporate account yet?{' '}
                        <Link href="/corporate/register" className="text-brand-yellow font-bold hover:underline">
                            Register your business
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
