'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Accordion from '../components/ui/Accordion';
import MainLayout from '@/components/layout/MainLayout';
import { HelpCircle, ShieldCheck, DollarSign, Users, Award, FileText, PhoneCall } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Driver Onboarding & Registration
  {
    category: 'Driver Onboarding',
    q: 'How do I become a Cabi driver partner?',
    a: 'To become a Cabi driver partner, fill out our quick online registration form with your personal details and referral code (if someone invited you). Download the Cabi Driver app, upload your valid driver\'s license, vehicle logbook/inspection certificate, and national ID. Once digitally verified, your account is activated within 24 to 48 hours.',
  },
  {
    category: 'Driver Onboarding',
    q: 'Is there a registration fee to become a driver?',
    a: 'No! There are absolutely NO registration fees to become a Cabi driver partner. Registration, onboarding, and profile activation are 100% free. Cabi does not charge any upfront or hidden fees to join our driver network.',
  },
  {
    category: 'Driver Onboarding',
    q: 'What are the vehicle and document requirements to drive with Cabi?',
    a: 'You must be at least 21 years old, hold a valid driver\'s license, have access to a clean and registered vehicle (4-door sedan, hatchback, SUV, motorcycle, or tuk-tuk), valid PSV/commercial vehicle insurance, and pass our digital verification. Vehicles must be roadworthy and well-maintained.',
  },
  {
    category: 'Driver Onboarding',
    q: 'How long does the verification and approval process take?',
    a: 'Most driver partner applications are reviewed and digitally verified within 24 hours. You will receive real-time notifications via SMS and email when your documents are approved and your account is ready to go online.',
  },

  // Earnings & Daily Payouts
  {
    category: 'Earnings & Payouts',
    q: 'How much can I earn as a Cabi driver partner?',
    a: 'Cabi operates on an ethical reusable commission model. In as much as a commission is charged, it is a reusable commission designed purely for driver wealth creation, vehicle equity, and community welfare—never for corporate extraction or personal enrichment. Active drivers in Nairobi and major Kenyan urban corridors take home between Ksh 3,000 to Ksh 7,000+ per day after expenses. Because drivers are not subjected to the oppressive commissions of legacy apps, your take-home pay and asset growth are significantly higher. You can also earn passive rewards through our 2-level referral program.',
  },
  {
    category: 'Earnings & Payouts',
    q: 'When and how do I receive my payouts?',
    a: 'Cabi provides instant payouts directly in Ksh to your Mobile Money wallet or local Kenyan bank account with zero settlement delay. Cash fares are collected immediately by you during the ride, while cashless digital trips and corporate rides are settled directly in Ksh into your wallet without holding periods.',
  },
  {
    category: 'Earnings & Payouts',
    q: 'How do I track my earnings and vehicle upkeep reserves?',
    a: 'The Cabi Driver app features a comprehensive earnings telemetry dashboard showing real-time earnings per trip, daily totals, tip bonuses, and your automated wealth creation and vehicle maintenance reserves in Ksh. Statements can be exported anytime.',
  },

  // Referral Program (2-Level Incentive)
  {
    category: 'Referral Program',
    q: 'What is the Cabi Referral Incentive Program?',
    a: 'The Cabi Referral Incentive Program is open to BOTH drivers and passengers! It is an ongoing incentive program spanning up to 2 levels:\n\n• Level 1 (Direct Referrals): When you refer a driver, you earn an ongoing incentive share from their trip earnings. When you refer a passenger, you earn an ongoing incentive share from their ride usage and spend.\n• Level 2 (Downstream Referrals): When your direct referrals invite new drivers or passengers, you earn an additional secondary share from those Level 2 partners\' earnings and passenger ride usage!\n\nAll referral rewards are calculated and credited in Ksh. Always check out our Terms & Conditions or contact us for full program rules, qualification thresholds, and operational guidelines.',
  },
  {
    category: 'Referral Program',
    q: 'Who can participate in the referral program?',
    a: 'Both drivers and passengers can participate! Whether you drive full-time, part-time, or simply commute as a passenger, everyone receives a unique referral code inside their app to invite fellow drivers and passengers and build an ongoing 2-level incentive stream in Ksh. Always check out our Terms & Conditions or contact us to learn more.',
  },
  {
    category: 'Referral Program',
    q: 'How does the 2-level referral incentive structure work?',
    a: 'The incentive operates on two tiers:\n\n1. Level 1 (Direct Referrals): You earn directly when someone signs up with your code — receiving a percentage share from referred drivers\' ongoing trip earnings and referred passengers\' ride usage.\n2. Level 2 (Secondary Referrals): When your Level 1 referrals invite others, you also receive an ongoing downstream incentive from those Level 2 drivers\' earnings and passengers\' ride usage as well!\n\nAll earnings accumulate in Ksh. Always check out our Terms & Conditions or contact us for current incentive rates and payout schedules.',
  },
  {
    category: 'Referral Program',
    q: 'Where do I find my referral code or link?',
    a: 'Your unique referral code is automatically generated upon account registration. In either the Cabi Passenger app or Cabi Driver app, navigate to "Refer & Earn" or "My Network". You can share your link via WhatsApp, SMS, email, or QR code. Please check out our Terms & Conditions or contact us if you need help sharing your code.',
  },
  {
    category: 'Referral Program',
    q: 'Is there a limit to how many drivers or passengers I can refer?',
    a: 'No! There is zero limit to how many drivers or passengers you can refer. The larger your Level 1 and Level 2 community grows, the more ongoing Ksh you accumulate every week. Terms and conditions apply — always check out our Terms & Conditions or contact us for fleet-scale referral partnerships.',
  },
  {
    category: 'Referral Program',
    q: 'How are referral earnings paid out?',
    a: 'Referral bonuses accumulate in real-time in your Cabi wallet and are payable in Ksh directly via Mobile Money or bank transfer. Always check out our Terms & Conditions or contact us for settlement timelines and balance withdrawal minimums.',
  },

  // Driving & Operations
  {
    category: 'Driving & Operations',
    q: 'Can I choose when and where to drive?',
    a: 'Yes, absolutely! Cabi offers complete flexibility. You can drive whenever you want—full-time, part-time, or just during peak commute hours. There are no mandatory shift requirements or penalties for going offline. You can operate across Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and all active service regions in Kenya.',
  },
  {
    category: 'Driving & Operations',
    q: 'How do I accept ride requests?',
    a: 'When you are online in the Cabi Driver app, you will receive nearby ride requests with transparent upfront details: pickup location, destination, estimated fare in Ksh, and passenger rating. You have ample time to accept or pass.',
  },
  {
    category: 'Driving & Operations',
    q: 'How does Cabi support vehicle repair and routine maintenance?',
    a: 'Through Cabi\'s reusable commission model, funds collected are channeled directly into driver wealth creation and vehicle maintenance pools rather than company profit extraction. Vehicle repair and servicing become effortless, allowing drivers to routinely acquire genuine spare parts, fresh oil, and brake checks without stress, ensuring cars remain safe, smooth, and well-maintained.',
  },

  // Passengers & Booking
  {
    category: 'For Passengers',
    q: 'How do I book a ride with Cabi?',
    a: 'Download the Cabi Passenger app, enter your destination, and confirm your pickup location. You will see an upfront transparent fare estimate in Ksh, driver details, and an instant 4-digit safety PIN for mutual verification before boarding.',
  },
  {
    category: 'For Passengers',
    q: 'What payment methods are accepted?',
    a: 'We accept Mobile Money, major debit/credit cards (Visa/Mastercard), cash, and corporate travel billing. All fares are calculated and charged transparently in Ksh with zero surge manipulation.',
  },
  {
    category: 'For Passengers',
    q: 'Can passengers participate in the referral program too?',
    a: 'Yes! Passengers can invite friends, family, and drivers using their unique referral link. You earn 2-level referral incentives in Ksh based on your referred passengers\' ride usage and referred drivers\' trip earnings. Check out our Terms & Conditions or contact us for program terms.',
  },

  // Safety & Support
  {
    category: 'Safety & Support',
    q: 'How does Cabi ensure safety for both drivers and passengers?',
    a: 'Safety is built into every trip: verified 4-digit safety PINs, real-time GPS telemetry, an in-app emergency SOS alert button with 24/7 security dispatch, strictly vetted chauffeurs, and mutual two-way ratings.',
  },
  {
    category: 'Safety & Support',
    q: 'How do I contact Cabi Customer Support?',
    a: 'You can contact Cabi support 24/7 through in-app live chat, email at ke.africabi@gmail.com, or our customer hotline at +254 756 777 222. For any inquiries regarding referral incentives or accounts, always check out our Terms & Conditions or contact us.',
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
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
      description="Answers to common questions about Cabi: zero driver registration fees, Ksh pricing, 2-level referral incentives for drivers & passengers, vehicle maintenance, and safety."
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
              Everything you need to know about Cabi: zero registration fees for drivers, Ksh pricing, and our 2-level referral incentives.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search questions (e.g. registration fee, referral program, payouts in Ksh)..."
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Zero Driver Fees</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">Registration is 100% free with zero activation costs.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-start gap-3 shadow-sm">
              <DollarSign className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">All Fares in Ksh</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">Transparent Kenyan Shilling pricing with zero USD fees.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-start gap-3 shadow-sm">
              <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">2-Level Referrals</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">Earn from driver earnings &amp; passenger usage up to 2 tiers.</p>
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
