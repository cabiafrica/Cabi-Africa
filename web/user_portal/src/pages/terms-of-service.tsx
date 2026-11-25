import Link from 'next/link';
import { ShieldCheck, Award, PhoneCall, HelpCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function TermsOfServicePage() {
  return (
    <MainLayout
      title="Terms of Service & Referral Program Policy | CABI"
      description="Read the CABI Terms of Service, Zero Driver Registration Fee Policy, and 2-Level Referral Program Guidelines."
    >
      <div className="bg-slate-50 dark:bg-surface-dark py-12 px-4 transition-colors">
        <div className="max-w-4xl mx-auto bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-3xl shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" /> Platform Governance &amp; Program Rules
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-2 text-slate-900 dark:text-white">
            Terms of <span className="text-[#D4AF37]">Service</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
            Official operational guidelines. For questions or program rate inquiries, please{' '}
            <Link href="/contact" className="text-[#D4AF37] hover:underline font-semibold">
              contact us directly
            </Link>
            .
          </p>

          <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                1. User Accounts &amp; Eligibility
              </h2>
              <p>
                To access the CABI platform as a driver partner or passenger, you must register and maintain an active account. You must be at least 18 years of age to book rides, and at least 24 years of age (in accordance with Traffic Act Cap 403 and NTSA commercial PSV licensing requirements) with a valid commercial driver's license (Class D1) to register as a driver. Account information must be accurate, current, and verified against government identification.
              </p>
            </section>

            <section id="driver-zero-fee-policy">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                2. Driver Onboarding &amp; Zero Registration Fee Guarantee
              </h2>
              <p className="mb-3">
                <strong className="text-slate-900 dark:text-white">Zero Registration Fees:</strong> CABI guarantees that there are <strong className="text-emerald-500">no registration, application, or activation fees</strong> charged to driver partners or fleet groups. Driver onboarding, document verification, and app access are 100% free.
              </p>
              <p>
                CABI will never ask you to wire upfront registration money to any individual. If anyone requests an upfront onboarding fee claiming to represent Cabi, please report this immediately via our official <Link href="/contact" className="text-[#D4AF37] font-semibold underline">Contact Us</Link> channels.
              </p>
            </section>

            <section id="referral-terms">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                3. Two-Level Referral Incentive Program Terms
              </h2>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 space-y-3 mb-4">
                <p className="font-semibold text-slate-900 dark:text-white">
                  The Cabi Referral Incentive Program is open to both registered drivers and passengers across Kenya:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  <li>
                    <strong className="text-slate-900 dark:text-white">Two-Level Structure:</strong> Incentives are calculated across up to two tiers — Level 1 (your direct referrals who register with your code) and Level 2 (secondary referrals introduced by your Level 1 members).
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Referring Drivers (Earnings Share):</strong> When you refer a driver partner, your recurring incentive is derived from a designated share of their net completed trip earnings in Kenyan Shillings (Ksh).
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Referring Passengers (Usage Share):</strong> When you refer a passenger, your recurring incentive is calculated from a designated percentage of their completed ride spend/usage in Kenyan Shillings (Ksh).
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Currency &amp; Payouts:</strong> All referral rewards accumulate and settle in Kenyan Shillings (Ksh) to your linked Mobile Money wallet or local Kenyan bank account.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Ongoing Verification &amp; Good Standing:</strong> To qualify for ongoing referral payouts, accounts must maintain good standing without fraud, artificial ride collusion, or terms violations.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Always Check Out T&amp;C or Contact Us:</strong> Referral percentages, qualification tiers, and campaign periods may be updated periodically to reflect seasonal promotions. Users are advised to review these Terms or <Link href="/contact" className="text-[#D4AF37] underline font-semibold">contact us</Link> for current program rate cards.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                4. Currency, Fares &amp; Local Mobile Money Settlement
              </h2>
              <p>
                All platform pricing, passenger fares, driver disbursements, tips, and referral incentives are denominated and processed in <strong className="text-slate-900 dark:text-white">Kenyan Shillings (Ksh)</strong>. In strict compliance with the NTSA (Operation of Transport Network Companies) Regulations, Legal Notice No. 120 of 2022, Cabi's platform service fee is capped at a maximum of <strong className="text-slate-900 dark:text-white">18% of the agreed trip fare</strong>, ensuring driver partners retain at least 82% of all earned trip fares plus 100% of customer tips. Settlement is conducted seamlessly via Mobile Money networks and authorized local payment partners with full digital receipts.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                5. Community Mutual Respect &amp; Safety Standards
              </h2>
              <p>
                CABI is built on mutual dignity and courtesy between passengers and drivers. In-app safety features, including the mutual 4-digit PIN verification, real-time GPS tracking, and two-way feedback, must be respected at all times. Discriminatory, aggressive, or unsafe behavior is strictly prohibited.
              </p>
            </section>

            <section id="contact-and-inquiries">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                6. Contact &amp; Program Inquiries
              </h2>
              <p className="mb-4">
                For questions regarding these Terms, Driver Onboarding, or the Two-Level Referral Program, please reach out to our team:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm shadow hover:bg-[#ffe088] transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Contact Us
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm hover:border-[#D4AF37]/50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Visit Frequently Asked Questions
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
