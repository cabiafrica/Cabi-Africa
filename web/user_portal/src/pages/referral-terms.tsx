import Head from 'next/head';
import Link from 'next/link';
import {
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  PhoneCall,
  Scale,
  Users,
  Wallet,
  Sparkles,
  Calendar,
  Lock,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function ReferralTermsPage() {
  return (
    <MainLayout
      title="Referral Program Policy & Terms | CABI Africa"
      description="Official Terms, Eligibility Rules, and Fair Use Guidelines for the Cabi Africa Two-Level Referral Incentive Program."
    >
      <div className="bg-slate-50 dark:bg-surface-dark transition-colors duration-300 min-h-screen py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Knowledge Base &amp; FAQ</span>
            </Link>
          </div>

          {/* Header Banner */}
          <div className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Official Policy • Terms &amp; Conditions
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Two-Level Referral Incentive{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                Program Policy
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              This document governs participation in the Cabi Referral Incentive Program operated by <strong>CABI FAST AFRICA LIMITED</strong> (Reg No: PVT-OD169L8L). By subscribing to the program, sharing your referral link, or registering with a Cabi referral code, you acknowledge and agree to comply with all terms herein.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span><strong>Operating Entity:</strong> CABI FAST AFRICA LIMITED</span>
              <span>•</span>
              <span><strong>Effective Date:</strong> January 2026</span>
              <span>•</span>
              <span><strong>Governing Law:</strong> Republic of Kenya</span>
              <span>•</span>
              <span><strong>Program Scope:</strong> Driver &amp; Commuter Registration Growth</span>
            </div>
          </div>

          {/* Policy Clauses Container */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">

            {/* Clause 1 */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">1</span>
                Program Purpose &amp; Appreciation Nature
              </h2>
              <p className="mb-3">
                The Cabi Referral Incentive Program is an optional, discretionary promotional program established solely as a <strong>gesture of appreciation</strong> for community members who advocate for the platform and introduce new drivers and riders.
              </p>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <strong>Important Legal Notice:</strong> Participation in the referral program does not constitute an employment agreement, franchise, joint venture, investment product, multi-level marketing (MLM) enterprise, or guarantee of recurring income. The primary business of Cabi is digital transport hailing and mobility facilitation.
              </p>
            </section>

            {/* Clause 2 */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">2</span>
                Eligibility, Badges &amp; 100% Value-Back Deposit
              </h2>
              
              <div className="space-y-4 mb-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Role-Based Referral Authorization &amp; Cross-Referrals
                  </h3>
                  <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-neutral-600 dark:text-neutral-300">
                    <li><strong>Drivers:</strong> Can refer <strong>Both Fellow Drivers and Passengers / Commuters</strong>. Drivers must hold an active account, valid NTSA PSV badge, and maintain a qualifying driver rating.</li>
                    <li><strong>Passengers:</strong> Can refer <strong>Both Passengers and Drivers</strong>. Must hold an active user account, verified profile avatar, and maintain a positive user rating.</li>
                  </ul>

                  {/* Driver-to-Passenger Referral & Fair Competition Guidelines */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Driver-to-Passenger Referral &amp; Fair Competition Guidelines:
                    </p>
                    <p>
                      Pursuant to the Competition Act (Cap 504) and NTSA multi-homing rules, independent driver-partners have the lawful right to introduce Cabi Africa to commuters they encounter during their transportation activities (including passengers requesting rides on other platforms) by sharing their personal referral QR code, discount voucher, or download link.
                    </p>
                    <p className="bg-amber-500/10 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg border border-amber-500/20 font-medium">
                      <strong>Important Boundary (No Tortious Interference):</strong> Driver-partners are strictly prohibited from soliciting, coercing, or encouraging passengers to cancel an in-progress trip dispatched on another platform. Referrals must strictly target the passenger's <strong>future journeys</strong> on Cabi Africa. Drivers earn published referral rewards once the referred passenger registers and completes their first qualifying trip.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#D4AF37]" />
                    100% Value-Back Activation Deposit (Ksh 1,000)
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    To activate enrollment in the Referral Incentive Program, participants commit a one-time activation deposit of <strong>Ksh 1,000</strong>. This deposit guarantees genuine participation while ensuring <strong>zero financial loss</strong> for the user:
                  </p>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-neutral-600 dark:text-neutral-300">
                    <li><strong>For Passengers:</strong> The entire Ksh 1,000 is credited immediately into your Cabi Passenger Wallet and is 100% redeemable as trip payments for your rides.</li>
                    <li><strong>For Drivers:</strong> The entire Ksh 1,000 is credited immediately into your Cabi Driver Wallet to be utilized for future platform trip commissions.</li>
                    <li><strong>Non-Refundable as Direct Cash:</strong> The activation deposit is non-refundable as direct cash or Mobile Money withdrawal, but remains permanently protected and fully spendable toward in-app rides or commission payments.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Clause 3 */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">3</span>
                Two-Level Incentive Structure &amp; 7-Day Dispute Clearance
              </h2>
              <p className="mb-3">
                Referral incentives operate across two distinct tiers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">Tier 1: Direct Referrals</div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Earn an ongoing percentage share from direct referrals who register with your code and complete genuine trips during their active campaign window.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">Tier 2: Secondary Downstream</div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Earn a secondary incentive when your direct Tier 1 referrals successfully introduce new qualifying participants who complete active rides.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Mandatory 7-Day Dispute Clearance Period
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Referral rewards do <strong>not</strong> settle immediately. All earned incentives enter a mandatory <strong>7-day dispute clearance period</strong> before reflecting in your active wallet balance. This window allows the platform to verify trip authenticity, process any route or detour disputes, and ensure verified fare settlement.
                </p>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-xs">
                  <strong>Attribution Window:</strong> Rewards apply to qualifying trips completed by the newly registered user during their initial 90 days from registration or the active promotional campaign lifecycle (whichever is reached first).
                </p>
              </div>
            </section>

            {/* Clause 4 */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">4</span>
                Anti-Fraud, Prohibited Conduct &amp; Statutory Recourse
              </h2>
              <p className="mb-3">
                Cabi enforces zero tolerance for deceptive practices, device manipulation, or artificial trip generation. The following activities are strictly prohibited:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Self-Referral &amp; Duplicate Profiles:</strong> Registering alternate accounts or secondary SIM cards belonging to oneself using your own referral code.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Device Manipulation &amp; GPS Spoofing:</strong> Utilizing app cloners, running multiple accounts on a single physical handset, or employing mock-location tools to fake trip telemetry.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Ghost &amp; Artificial Rides:</strong> Colluding between drivers and passengers to generate false trips for the purpose of triggering referral bonuses.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Spam &amp; Misrepresentation:</strong> Distributing referral codes via unconsented automated SMS blasts, search engine brand hijacking, or misleading advertising claiming guaranteed employment.</span>
                </div>
              </div>
              <p className="mt-4 text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/20 p-3.5 rounded-xl border border-red-200 dark:border-red-900/30">
                Any violation results in immediate disqualification, permanent account deactivation, full forfeiture of all pending and accrued balances, and potential statutory prosecution under the Kenya Computer Misuse and Cybercrimes Act.
              </p>
            </section>

            {/* Clause 5 */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">5</span>
                Disbursements, Minimum Thresholds &amp; Settlement
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Active Balance Crediting:</strong> Once earnings pass the 7-day dispute clearance period, funds reflect in your active wallet.</li>
                <li><strong>Settlement Channels:</strong> Payouts are remitted directly to the user's designated <strong>Mobile Money</strong> wallet or local bank account as determined and chosen by the user.</li>
                <li><strong>Minimum Withdrawal Threshold:</strong> The minimum balance required to request a payout is <strong>Ksh 500</strong>. Balances below Ksh 500 roll over automatically until the threshold is met.</li>
                <li><strong>Payout Frequency:</strong> Referral disbursements are processed on a <strong>weekly</strong> schedule for all eligible accounts meeting the minimum withdrawal threshold.</li>
                <li><strong>Provider Network Tariffs:</strong> Standard Mobile Money or banking transaction tariffs apply at the point of disbursement.</li>
              </ul>
            </section>

            {/* Clause 6 */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">6</span>
                New User Registration Focus &amp; Campaign Lifecycle
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>New User Registration Focus:</strong> This incentive program is designed specifically to reward the introduction and onboarding of <strong>brand-new, first-time drivers and passengers</strong> to the Cabi community.
                </p>
                <p>
                  <strong>Campaign-Based &amp; Non-Permanent:</strong> Participants explicitly acknowledge that this program is a growth campaign and <strong>is not a permanent or continuous affair</strong>. Cabi may adjust, pause, or conclude the program or specific regional rate cards as market growth milestones are achieved.
                </p>
                <p className="text-xs text-neutral-500">
                  Any verified rewards earned and cleared prior to the formal conclusion of a campaign will be honored in full under the standard weekly settlement rules.
                </p>
              </div>
            </section>

            {/* Clause 7 */}
            <section className="pt-6 border-t border-slate-100 dark:border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs font-black">7</span>
                Official Contact &amp; Dispute Resolution
              </h2>
              <p className="mb-4">
                In case of any inquiry or dispute regarding referral attribution, code eligibility, or badge standing, please contact our support desk:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <a
                  href="tel:+254758777222"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#D4AF37] transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
                  <span>Helpline: 0758 777 222</span>
                </a>
                <a
                  href="mailto:cabifastafrica@gmail.com"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#D4AF37] transition-colors"
                >
                  <span>Email: cabifastafrica@gmail.com</span>
                </a>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                These terms are governed by and construed in accordance with the laws of the Republic of Kenya. Cabi's digital audit logs and trip telemetry serve as conclusive records in all attribution reviews.
              </p>
            </section>

          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-xs text-neutral-500">
            Cabi Africa &copy; {new Date().getFullYear()}. All Rights Reserved. Unlisted Policy Document.
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
