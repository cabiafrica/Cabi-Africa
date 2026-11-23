'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Accordion from '../components/ui/Accordion';
import MainLayout from '@/components/layout/MainLayout';
import { HelpCircle, ShieldCheck, DollarSign, Users, Award, FileText, PhoneCall } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
  rawText?: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Driver Onboarding & Registration
  {
    category: 'Driver Onboarding',
    q: 'How do I become a Cabi driver partner?',
    a: 'To become a Cabi driver partner, fill out our quick registration form with your personal details and referral code (if someone invited you). Download the Cabi Driver app and upload your credentials. Once digitally verified, your account will be activated and ready to go online.',
  },
  {
    category: 'Driver Onboarding',
    q: 'Is there a registration fee to become a driver?',
    a: 'Cabi driver registration is completely free. There are no fees to join or activate your account, unless you voluntarily choose to enroll in a specialized program.',
  },
  {
    category: 'Driver Onboarding',
    q: 'What are the vehicle and document requirements to drive with Cabi?',
    a: 'To drive with Cabi, you must be at least 21 years old, hold a valid driver\'s license with an official NTSA badge, and comply with statutory NTSA guidelines. Your vehicle must be clean, well-maintained, and roadworthy with valid PSV insurance cover. Drivers must upload their credentials and successfully pass our digital qualifications.',
  },
  {
    category: 'Driver Onboarding',
    q: 'How will I know when my account is verified and approved?',
    a: 'Once you submit your credentials, our verification team reviews your profile. You will receive notifications via SMS, in-app, or email alerts confirming your approval and activating your account to start driving.',
  },

  // Earnings & Daily Payouts
  {
    category: 'Earnings & Daily Payouts',
    q: 'How much can I earn as a Cabi driver partner?',
    a: 'How much you earn depends on your personal effort and resilience. Cabi provides different earning programs that a driver can voluntarily join to make their commissions reusable and significantly more valuable, building long-term financial growth and equity.',
  },
  {
    category: 'Earnings & Daily Payouts',
    q: 'When and how do I receive my payouts?',
    a: 'Cabi provides instant payouts directly to your Mobile Money wallet or local Kenyan bank account with zero settlement delay. Cash fares are collected immediately by you during the ride, while cashless digital trips and corporate rides are settled directly into your wallet without holding periods.',
  },
  {
    category: 'Earnings & Daily Payouts',
    q: 'How do I track my earnings?',
    a: 'The Cabi Driver app features a comprehensive earnings dashboard where you can view your real-time earnings per trip, daily and weekly totals, and tips. You can also monitor your active program balances and export your statements at any time.',
  },

  // Referral Incentive Program
  {
    category: 'Referral Incentive Program',
    q: 'Does Cabi have a referral incentive?',
    rawText: 'Yes. As a gesture of appreciation for helping spread the word about Cabi, we offer a referral incentive for community members who introduce new drivers and passengers. Drivers can refer fellow drivers only, while passengers can refer both passengers and drivers. For qualification criteria, incentive structures, and operational guidelines, please review our official Referral Program Policy.',
    a: (
      <span>
        Yes. As a gesture of appreciation for helping spread the word about Cabi, we offer a referral incentive for community members who introduce new drivers and passengers. Drivers can refer fellow drivers only, while passengers can refer both passengers and drivers. For qualification criteria, incentive structures, and operational guidelines, please review our official{' '}
        <Link
          href="/referral-terms"
          className="text-[#D4AF37] underline font-bold hover:text-[#ffe088] transition-colors"
        >
          Referral Program Policy
        </Link>.
      </span>
    ),
  },
  {
    category: 'Referral Incentive Program',
    q: 'Where do I find my referral code?',
    rawText: 'You can find your unique referral link directly in the Cabi app under your profile or menu. Please review our Referral Terms & Conditions to see the full details on how rewards are earned and credited.',
    a: (
      <span>
        You can find your unique referral link directly in the Cabi app under your profile or menu. Please review our{' '}
        <Link
          href="/referral-terms"
          className="text-[#D4AF37] underline font-bold hover:text-[#ffe088] transition-colors"
        >
          Referral Terms &amp; Conditions
        </Link>{' '}
        to see the full details on how rewards are earned and credited.
      </span>
    ),
  },

  // Driving & Operations
  {
    category: 'Driving & Operations',
    q: 'Can I choose when and where to drive?',
    a: 'Yes. Cabi offers complete schedule flexibility—you can drive full-time, part-time, or whenever convenient, with no mandatory shifts. You can operate in any active Cabi coverage area, provided your vehicle complies with the local county transport bylaws and parking permits of that operational zone.',
  },
  {
    category: 'Driving & Operations',
    q: 'How do I accept ride requests?',
    a: 'When you are online in the Cabi Driver app, you will receive nearby ride requests with transparent upfront details: pickup location, destination, estimated fare, and passenger rating. You have ample time to accept or pass.',
  },

  // Passenger Booking & Pricing
  {
    category: 'Passenger Booking & Pricing',
    q: 'How do I book a ride with Cabi?',
    a: 'You can book a trip either through the Cabi Passenger app or directly via our web-based booking portal. Simply choose from our available service options, enter your destination, and confirm your pickup to receive an upfront fare estimate and connect with your driver.',
  },
  {
    category: 'Passenger Booking & Pricing',
    q: 'What payment methods are accepted?',
    a: 'We accept Mobile Money, major debit and credit cards, cash, and corporate travel billing. All fares are calculated and presented upfront with transparent pricing.',
  },
  {
    category: 'Passenger Booking & Pricing',
    q: 'How is the fare calculated?',
    a: 'Fares are calculated based on a base rate, distance, and trip duration, presented upfront before confirming your ride. If you need to alter your destination or take an alternate route during the trip, changing the route must be a mutual agreement between you and your driver. The final fare will adjust transparently to reflect the updated distance and travel time.',
  },
  {
    category: 'Passenger Booking & Pricing',
    q: 'What should I do if I leave an item in a vehicle?',
    a: 'If you leave an item behind, go to your Trip History in the Cabi app and select the relevant ride to contact your driver directly. You can also reach out to Cabi Customer Support, and our team will help coordinate the safe recovery and return of your property.',
  },

  // Safety & Support
  {
    category: 'Safety & Support',
    q: 'How does Cabi ensure safety for both drivers and passengers?',
    a: 'Safety is mutual and vital for everyone. To keep our shared community safe and accountable, both drivers and passengers undergo user verification. Every trip is further protected by real-time GPS tracking, an in-app emergency alert button, and mutual two-way ratings.',
  },
  {
    category: 'Safety & Support',
    q: 'How do I contact Cabi Customer Support?',
    a: 'You can contact Cabi support 24/7 through in-app live chat, email at cabifastafrica@gmail.com, or our customer hotline at 0758 777 222 (+254 758 777 222).',
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(item => {
    const answerSearchText = item.rawText || (typeof item.a === 'string' ? item.a : '');
    const matchesSearch = searchQuery === '' ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answerSearchText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category for display
  const groupedFAQs = filteredFAQs.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <MainLayout
      title="Frequently Asked Questions | Cabi Africa"
      description="Authoritative answers about Cabi Africa: driver onboarding, schedule flexibility, earnings, referral incentives, passenger booking, and mutual safety."
    >
      <div className="bg-slate-50 dark:bg-surface-dark min-h-screen transition-colors duration-300">
        {/* Hero Section */}
        <section className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white py-16 sm:py-20 border-b border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[380px] rounded-full bg-[#D4AF37]/10 blur-[130px] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] border border-[#D4AF37]/30 shadow-sm mb-4">
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
                Knowledge Base &amp; FAQ
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                Questions
              </span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
              Clear answers to your questions on driver onboarding, schedule flexibility, earnings, referral incentives, and mutual safety.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search questions (e.g. registration, referral, payouts, booking)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-lg text-sm sm:text-base"
              />
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="bg-white/70 dark:bg-surface-dark/80 py-5 border-b border-slate-200 dark:border-white/10 sticky top-16 z-20 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === category
                      ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
                      : 'bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Highlight Banner: Key Policies */}
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-start gap-3 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Free Driver Registration</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">Registration is completely free unless voluntarily enrolling in specialized programs.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-start gap-3 shadow-sm">
              <DollarSign className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Upfront Transparent Fares</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">Clear upfront pricing with mutual agreement required for route changes.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-start gap-3 shadow-sm">
              <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Mutual Safety &amp; Verification</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">Accountable user verification for both drivers and passengers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-10 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                  No questions found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              Object.entries(groupedFAQs).map(([category, items]) => (
                <section key={category} className="mb-10">
                  <h2 className="text-xl sm:text-2xl font-black mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    {category}
                  </h2>
                  <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-white/5">
                    {items.map((item, index) => (
                      <Accordion key={index} title={item.q}>
                        <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
                          {item.a}
                        </div>
                      </Accordion>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>

        {/* CTA & T&C Guidance Section */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 dark:bg-card-dark border border-[#D4AF37]/30 text-white py-12 px-6 sm:px-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Still have questions?</h2>
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto mb-6 leading-relaxed">
              Always check out our official <strong className="text-white">Terms &amp; Conditions</strong> or <strong className="text-white">Contact Us</strong> directly for detailed referral tier qualification and support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider"
              >
                <PhoneCall className="w-4 h-4" />
                Contact Us
              </Link>
              <Link
                href="/terms-of-service"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider"
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                Terms &amp; Conditions
              </Link>
              <Link
                href="/drivers/register"
                className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold py-3 px-6 rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider"
              >
                Drive for Free (Zero Fee)
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
