import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Share2,
  Users,
  TrendingUp,
  Wallet,
  Car,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileText,
  PhoneCall,
  CheckCircle2,
  Percent,
  Sparkles,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import AppDownloadButtons from '@/components/ui/AppDownloadButtons';

export default function ReferralProgramPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'drivers' | 'passengers'>('all');
  const [calcDrivers, setCalcDrivers] = useState<number>(3);
  const [calcRiders, setCalcRiders] = useState<number>(10);

  // Approximate illustrative monthly rewards calculation in Ksh
  // Drivers: share from trip earnings (avg ~Ksh 45,000/mo * 2.5% L1, 1% L2)
  // Passengers: share from ride usage/spend (avg ~Ksh 6,000/mo * 3% L1, 1.5% L2)
  const estDriverShare = calcDrivers * 1125 + (calcDrivers * 2) * 450;
  const estRiderShare = calcRiders * 180 + (calcRiders * 3) * 90;
  const totalMonthlyEstKsh = estDriverShare + estRiderShare;

  return (
    <MainLayout
      title="2-Level Referral Program | Drivers & Passengers Earn in Ksh | CABI"
      description="Invite drivers and passengers to Cabi. Earn up to 2 levels of incentives: share from driver earnings and passenger usage. Paid in Ksh with zero driver registration fees."
    >
      <div className="bg-slate-50 dark:bg-surface-dark transition-colors duration-300 min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[450px] rounded-full bg-[#D4AF37]/10 blur-[150px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              2-Tier Network Incentive • Drivers &amp; Passengers
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Share Cabi,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                Earn Up to 2 Levels
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Open to both <strong className="text-slate-900 dark:text-white">drivers and passengers</strong>. Earn ongoing rewards in <strong className="text-slate-900 dark:text-white">Ksh</strong>: share from <span className="text-[#D4AF37] font-semibold">driver earnings</span> when you refer drivers, and share from <span className="text-[#D4AF37] font-semibold">ride usage</span> when you refer passengers.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Zero Driver Registration Fees
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Payouts in Ksh via Mobile Money
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Level 1 &amp; Level 2 Recurring Shares
              </span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/drivers/register"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold text-sm shadow-xl transition-all duration-300 active:scale-95"
              >
                <Car className="w-4 h-4" />
                <span>Join as Driver (Zero Fee)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faq#referral-program"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-card-dark text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all duration-300"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Read Referral FAQ</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2-Tier Architecture Explanation */}
        <section className="py-16 sm:py-24 bg-white/60 dark:bg-brand-dark/40 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                  How the 2 Tiers Work
                </span>
                <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                Earn From Both Direct and Secondary Networks
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                You receive recurring incentives across two full network levels as long as your referred members remain active on Cabi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Level 1 Card */}
              <div className="rounded-3xl bg-white dark:bg-card-dark border-2 border-[#D4AF37]/40 p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[11px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                  Level 1 • Direct Tier
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-6">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Direct Referrals (Level 1)
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    People who sign up using your personal referral link or code.
                  </p>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10">
                      <Car className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block text-sm">When you refer a Driver:</strong>
                        <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          Earn an ongoing share of their net trip <strong className="text-slate-900 dark:text-white">earnings</strong> every time they complete trips.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10">
                      <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block text-sm">When you refer a Passenger:</strong>
                        <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          Earn an ongoing share of their total ride <strong className="text-slate-900 dark:text-white">usage/spend</strong> on every completed trip.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500">
                  <span>Fast payout directly in Ksh</span>
                  <span className="font-bold text-[#D4AF37]">Primary Incentive</span>
                </div>
              </div>

              {/* Level 2 Card */}
              <div className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/15 p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-slate-800 text-neutral-200 text-[11px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                  Level 2 • Extended Tier
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D4AF37] mb-6">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Secondary Referrals (Level 2)
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    When your direct referrals invite their own friends, family, or fellow drivers.
                  </p>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10">
                      <Car className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block text-sm">Secondary Driver Network:</strong>
                        <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          Earn a secondary tiered share from the trip <strong className="text-slate-900 dark:text-white">earnings</strong> generated by drivers referred by your Level 1 contacts.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10">
                      <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block text-sm">Secondary Passenger Network:</strong>
                        <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          Earn a secondary tiered share from the ride <strong className="text-slate-900 dark:text-white">usage/spend</strong> generated by riders referred by your Level 1 contacts.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500">
                  <span>Compounding passive income</span>
                  <span className="font-bold text-slate-400">Secondary Incentive</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Driver vs Passenger Reward Logic Grid */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Two Streams of Referral Income
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Cabi customizes the incentive source based on whether you bring drivers or passengers into the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-7 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Referring Drivers</h3>
                  <span className="text-xs text-[#D4AF37] font-semibold">Share from Driver Earnings</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                Drivers you invite keep 100% of their base fares without paying any registration fee. As they complete trips, a dedicated referral incentive fund pays you a direct share of their fare earnings in Ksh.
              </p>
              <div className="bg-slate-50 dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Driver Registration Fee:</span>
                  <span className="font-bold text-emerald-500">Ksh 0 (Free Onboarding)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Incentive Base:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Trip Fare Earnings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Settlement Currency:</span>
                  <span className="font-semibold text-[#D4AF37]">Kenyan Shillings (Ksh)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-7 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Referring Passengers</h3>
                  <span className="text-xs text-emerald-500 font-semibold">Share from Ride Usage</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                When you share Cabi with colleagues, friends, or family for commuting, you earn every time they hail and complete a ride. Your share scales directly with their monthly ride usage and spend.
              </p>
              <div className="bg-slate-50 dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Passenger Signup Fee:</span>
                  <span className="font-bold text-emerald-500">Ksh 0 (Free App Download)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Incentive Base:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Ride Spend / Usage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Settlement Currency:</span>
                  <span className="font-semibold text-[#D4AF37]">Kenyan Shillings (Ksh)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Ksh Estimation Widget */}
        <section className="py-16 bg-white/70 dark:bg-brand-dark/50 border-y border-slate-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              Estimate Your 2-Level Monthly Rewards
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
              Simulate potential monthly referral earnings in Ksh based on your combined Level 1 and Level 2 driver and passenger network.
            </p>

            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-2">
                    <span>Referred Drivers (Level 1)</span>
                    <span className="text-[#D4AF37] font-black">{calcDrivers} Drivers</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={calcDrivers}
                    onChange={(e) => setCalcDrivers(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Assuming each driver completes trips yielding recurring earnings share across 2 levels.
                  </p>
                </div>

                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-2">
                    <span>Referred Passengers (Level 1)</span>
                    <span className="text-emerald-500 font-black">{calcRiders} Riders</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcRiders}
                    onChange={(e) => setCalcRiders(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Assuming regular monthly commuting usage across your direct and secondary network.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-neutral-500 block mb-1">
                    Illustrative Monthly Payout
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                    ~ Ksh {totalMonthlyEstKsh.toLocaleString()}
                  </div>
                  <span className="text-xs text-neutral-400">
                    Paid via Mobile Money or local bank account in Ksh
                  </span>
                </div>

                <Link
                  href="/terms-of-service#referral-terms"
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
                >
                  View Terms &amp; Rates
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* IMPORTANT T&C & CONTACT US CALLOUT BOX */}
        <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-amber-500/10 border-2 border-[#D4AF37]/50 p-8 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Important Program Guidelines &amp; Qualification
                </h3>
                <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                  Referral shares, percentages, campaign periods, and eligibility criteria are subject to our active operational policies. <strong className="text-slate-900 dark:text-white">Always check out our Terms &amp; Conditions or contact us directly</strong> for the current rate cards, payout cycles, and qualifying trip thresholds.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <Link
                    href="/referral-terms"
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-[#ffe088] hover:underline"
                  >
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    Review Official Referral Terms &amp; Conditions &rarr;
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-[#ffe088] hover:underline"
                  >
                    <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
                    Contact Support Team &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative text-center bg-slate-900 dark:bg-card-dark border-t border-[#D4AF37]/30 px-6 py-16 sm:py-20 text-white overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#D4AF37]/15 blur-[130px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
              Start Earning with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                Cabi Referrals
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Sign up today with zero driver registration fees, get your referral code in the app, and start compounding rewards in Ksh across two tiers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/drivers/register"
                className="inline-flex items-center justify-center gap-2.5 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-4 px-8 rounded-xl text-sm transition-all shadow-xl active:scale-95"
              >
                <Car className="w-4 h-4" />
                <span>Drive for Free (Zero Fee)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 text-white border border-white/20 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#ffe088] transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Us for Inquiries</span>
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <AppDownloadButtons role="driver" tone="dark" caption="Cabi Driver App (Zero Fee Onboarding)" />
              <AppDownloadButtons role="passenger" tone="dark" caption="Cabi Passenger App (Instant Rides)" />
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
