import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Award,
  ShieldCheck,
  Users,
  HeartHandshake,
  Globe2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Car,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

const CORE_VALUES = [
  {
    title: 'Safety First',
    description:
      'Passenger and driver safety is non-negotiable. From thorough driver vetting and PSV verification to in-app trip safeguards, security defines every journey.',
    icon: ShieldCheck,
  },
  {
    title: 'Driver Empowerment',
    description:
      'Drivers are true partners. We provide transparent earnings, M-Pesa instant settlements, and sustainable tools so operators can build lasting mobility businesses.',
    icon: Users,
  },
  {
    title: 'Customer Obsession',
    description:
      'From everyday city commutes to diplomatic transfers, we listen continuously and refine every touchpoint to deliver punctual, courteous, reliable service.',
    icon: HeartHandshake,
  },
  {
    title: 'Community Focus',
    description:
      'Built in Nairobi for Africa. We invest in local talent, strengthen urban corridors, and foster respectful connections across every city we serve.',
    icon: Globe2,
  },
  {
    title: 'Integrity & Transparency',
    description:
      'Clear fares, honest policies, and accountable operations ensure passengers and fleet partners always know exactly where they stand.',
    icon: CheckCircle2,
  },
  {
    title: 'Executive Standards',
    description:
      'Clean vehicles, disciplined hospitality, and consistent fleet quality ensure every tier—from agile Boda rides to Diplomatic XL—exceeds expectations.',
    icon: Sparkles,
  },
] as const;

export default function AboutPage() {
  return (
    <MainLayout
      title="About Us | CABI"
      description="Learn about CABI's mission, vision, and commitment to safe, dignified urban mobility across Africa."
    >
      {/* Hero Section (Obsidian-Gold Identity) */}
      <section className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] border border-[#D4AF37]/30 shadow-sm mb-6">
            <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
              Our Mission &amp; Vision
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-4xl mx-auto">
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
              CABI.
            </span>{' '}
            Our Journey &amp; Promise
          </h1>

          <p className="mt-5 text-lg sm:text-2xl text-[#D4AF37] font-bold tracking-tight">
            Moving People, Improving Lives
          </p>

          <p className="mt-4 text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Our mission is clear: to deliver safe, reliable, and dignified urban mobility across Africa—elevating the everyday experience for passengers while creating fair, sustainable livelihoods for driver-partners.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-surface-dark overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                  Our Story
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-6">
                Built in Nairobi for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                  African Cities.
                </span>
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  CABI was founded in 2026 around a simple belief: moving through the city should feel effortless, reliable, and genuinely respectful for everyone sharing the road.
                </p>
                <p>
                  What started right here in Nairobi is steadily growing into a welcoming community of everyday commuters, corporate teams, diplomatic guests, and dedicated driver-partners across Kenya.
                </p>
                <p>
                  Unlike conventional platforms, we focus on helping drivers build lasting, rewarding mobility businesses—backed by fair partner economics, instant earnings settlement, performance incentives, and long-term wealth creation programs.
                </p>
                <p>
                  As our footprint grows across East and Pan-African corridors, our promise stays clear: thoughtful service, vetted partners, and everyday rides you can truly count on.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl bg-white dark:bg-card-dark/90 p-2.5 sm:p-3.5 border border-slate-200 dark:border-[#D4AF37]/30 shadow-2xl">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A0A0B]">
                  <Image
                    src="/images/from-nairobi-to-world.jpg"
                    alt="Graphic map of Africa centered on a radiant Nairobi beacon with global trajectory arcs extending worldwide"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 sm:py-24 bg-white/70 dark:bg-brand-dark/50 border-y border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                Principles
              </span>
              <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Our Core{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                Values.
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Every policy, vehicle inspection, and ride experience is anchored in six non-negotiable standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CORE_VALUES.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 p-7 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-[#D4AF37] group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
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

      {/* Call to Action */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-slate-900 dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 px-6 py-12 sm:px-12 sm:py-16 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[320px] rounded-full bg-[#D4AF37]/15 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Join the Network
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Join Us on{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                  Our Journey
                </span>
              </h2>

              <p className="text-sm sm:text-lg text-neutral-300 mb-8 leading-relaxed">
                Whether you want to partner behind the wheel or ride across the city with confidence, there is a place for you at CABI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/drivers/register"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm tracking-wide shadow-lg hover:bg-[#ffe088] transition-all duration-300 active:scale-95"
                >
                  <Car className="w-4 h-4" />
                  <span>Sign Up to Drive</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/5 text-white border border-white/15 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#ffe088] transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
