import Link from 'next/link';
import {
    Sparkles,
    Landmark,
    ShieldCheck,
    PiggyBank,
    Network,
    Award,
    TrendingUp,
    ArrowRight,
    Car,
    CheckCircle2,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ReferralNetworkVisualizer from '@/components/dashboard/ReferralNetworkVisualizer';
import AppDownloadButtons from '@/components/ui/AppDownloadButtons';

const WEALTH_INCENTIVES = [
    {
        title: 'Driver Wealth Equity Deposits',
        tag: 'Asset & Credit Growth',
        description:
            'Qualifying drivers receive promotional top-up deposits directly into their partnered wealth creation accounts—accelerating share capital, dividend earnings, and access to low-interest vehicle or personal financing.',
        icon: Landmark,
    },
    {
        title: 'Driver & Family Insurance Support',
        tag: 'Health & Protection',
        description:
            'Through targeted loyalty campaigns, high-performing partners unlock subsidized medical, personal accident, and operational cover so an unexpected disruption never derails your household income.',
        icon: ShieldCheck,
    },
    {
        title: 'Long-Term Pension Top-Ups',
        tag: 'Retirement Security',
        description:
            'Milestone-based wealth promotions channel bonus contributions into micro-pension schemes for eligible drivers, converting active road hours today into dependable retirement savings.',
        icon: PiggyBank,
    },
    {
        title: 'Multi-Tier Referral Network',
        tag: 'Passive Income',
        description:
            'Invite fellow drivers and fleet operators with your unique referral code. When they complete verified trips, you earn ongoing referral incentives across direct and extended network tiers.',
        icon: Network,
    },
    {
        title: 'Seasonal Wealth Promotions',
        tag: 'Performance Campaigns',
        description:
            'CABI runs rotating weekly, monthly, and corridor-specific promotions that reward consistent availability, high passenger ratings, and fleet leadership with bonus payouts and savings credits.',
        icon: Award,
    },
    {
        title: 'Transparent Tracking & Fast Payouts',
        tag: 'Live Telemetry',
        description:
            'Monitor referral earnings, promotional qualification progress, wealth creation credits, and mobile money settlements in real time inside your CABI Driver App.',
        icon: TrendingUp,
    },
] as const;

const QUALIFICATION_PILLARS = [
    'Complete consistent weekly trip milestones and maintain strong rider satisfaction ratings.',
    'Remain in good standing on safety, compliance, and digital verification checks.',
    'Expand your active referral network by mentoring new CABI drivers and partner peers.',
    'Receive automated promotional rewards as cash bonuses, wealth creation deposits, insurance credits, or pension top-ups based on each active campaign.',
];

export default function ReferralDetailsPage() {
    return (
        <MainLayout
            title="CABI Wealth Promotions & Business Builder | CABI"
            description="Explore CABI wealth-creation promotions including qualifying driver wealth equity deposits, insurance support, pension top-ups, and multi-tier referral income."
            image="/images/driver-analytics-graph.jpg"
            imageAlt="CABI Africa Business Builder multi-tier driver referral and wealth creation promotions"
        >
            <div className="bg-slate-50 dark:bg-surface-dark transition-colors duration-300">
                {/* Hero Section */}
                <section className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white text-center pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] border border-[#D4AF37]/30 shadow-sm mb-6">
                            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                                Wealth Creation &amp; Partner Promotions
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-4xl mx-auto mb-5">
                            More Than Driving:{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                Build Long-Term Wealth
                            </span>
                        </h1>

                        <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
                            CABI runs ongoing promotional programs designed to help qualifying drivers and fleet partners create lasting wealth—combining 2-level referral incentives with rewards such as{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                additional wealth creation deposits, insurance support, and pension contributions
                            </span>.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/drivers/register"
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm tracking-wide shadow-lg hover:bg-[#ffe088] transition-all duration-300 active:scale-95"
                            >
                                <Car className="w-4 h-4" />
                                <span>Sign Up to Drive</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="#wealth-incentives"
                                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white dark:bg-card-dark text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all duration-300"
                            >
                                View Wealth Incentives
                            </a>
                        </div>
                    </div>
                </section>

                {/* Wealth Promotions & Incentives Grid */}
                <section id="wealth-incentives" className="py-16 sm:py-24 bg-white/70 dark:bg-brand-dark/50 border-b border-slate-200 dark:border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <div className="inline-flex items-center gap-3 mb-3">
                                <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                                    Promotional Wealth Pillars
                                </span>
                                <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Incentives That Grow{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                    Beyond Daily Fares
                                </span>
                            </h2>
                            <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                                Alongside instant trip earnings, CABI schedules different partner promotions throughout the year to strengthen financial stability and asset ownership for qualifying drivers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {WEALTH_INCENTIVES.map(({ title, tag, description, icon: Icon }) => (
                                <div
                                    key={title}
                                    className="group rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 p-7 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform duration-300 shrink-0">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-[#D4AF37]">
                                            {tag}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                                        {title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">
                    {/* Interactive Referral Network Section */}
                    <section className="text-center">
                        <div className="inline-flex items-center gap-3 mb-3">
                            <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                                Interactive Model
                            </span>
                            <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black mb-3 text-slate-900 dark:text-white">
                            Visualizing Your Referral Network
                        </h2>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
                            Hover over network tiers below to preview how direct referrals (Level 1) and extended referrals (Level 2) compound alongside active wealth promotions.
                        </p>
                        <div className="bg-white dark:bg-card-dark p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#D4AF37]/25 shadow-xl overflow-hidden">
                            <ReferralNetworkVisualizer />
                            <p className="mt-6 text-xs sm:text-sm text-center text-neutral-500 italic">
                                Interactive demo of a Level 2 Business Builder referral network
                            </p>
                        </div>
                    </section>

                    {/* How Qualification Works */}
                    <section className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-7 sm:p-10 shadow-sm">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                                Fair &amp; Transparent Criteria
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black mb-4 text-slate-900 dark:text-white">
                            How Drivers Qualify for Promotions &amp; Wealth Incentives
                        </h2>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                            Every CABI promotion announces clear qualification criteria in advance inside the Driver App so every operator knows how to unlock extra wealth creation deposits, insurance subsidies, pension top-ups, and referral bonuses:
                        </p>
                        <ul className="space-y-3.5">
                            {QUALIFICATION_PILLARS.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-neutral-300">
                                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* CTA Section */}
                    <section className="relative text-center bg-slate-900 dark:bg-card-dark border border-[#D4AF37]/30 px-6 py-12 sm:p-14 rounded-3xl text-white shadow-2xl overflow-hidden">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[440px] h-[280px] rounded-full bg-[#D4AF37]/15 blur-[120px] pointer-events-none" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-black mb-4">
                                Ready to Build{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                    Wealth With CABI?
                                </span>
                            </h2>
                            <p className="text-sm sm:text-lg text-neutral-300 mb-8 leading-relaxed">
                                Join CABI as a verified driver or wealth creation partner to qualify for upcoming promotions, wealth deposit matches, insurance &amp; pension incentives, and referral earnings.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/drivers/register"
                                    className="inline-flex items-center justify-center gap-2.5 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-3.5 px-8 rounded-xl text-sm transition-colors shadow-lg active:scale-95"
                                >
                                    <Car className="w-4 h-4" />
                                    <span>Sign Up to Drive</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/drivers/group-register"
                                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white/5 text-white border border-white/15 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#ffe088] transition-colors"
                                >
                                    Register Fleet / Partner Group
                                </Link>
                            </div>

                            <AppDownloadButtons role="driver" tone="dark" className="mt-8 pt-7 border-t border-white/10" />
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
