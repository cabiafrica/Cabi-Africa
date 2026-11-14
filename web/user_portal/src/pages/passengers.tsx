import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Smartphone, ShieldCheck, Clock, ArrowRight, Navigation } from 'lucide-react';
import Testimonials from '@/components/Testimonials';
import AppDownloadButtons from '@/components/ui/AppDownloadButtons';
import MainLayout from '@/components/layout/MainLayout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default function ForPassengersPage(
  _props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { t } = useTranslation('common');

  const benefits = [
    {
      title: t('passengers_booking_title'),
      description: t('passengers_booking_desc'),
      icon: Smartphone,
    },
    {
      title: t('passengers_safety_title'),
      description: t('passengers_safety_desc'),
      icon: ShieldCheck,
    },
    {
      title: t('passengers_reliability_title'),
      description: t('passengers_reliability_desc'),
      icon: Clock,
    },
  ];

  return (
    <MainLayout
      title={`${t('passengers_hero_title')} | CABI`}
      description={t('passengers_hero_subtitle')}
      image="/images/passenger-executive-comfort.jpg"
      imageAlt="CABI Africa executive passenger sanctuary with luxury seating, verified PIN safety, and digital ride concierge"
    >
      {/* Hero Section (Obsidian-Gold Identity) */}
      <section className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] border border-[#D4AF37]/30 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
              For Passengers
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-4xl mx-auto">
            {t('passengers_hero_title').includes('Safe and Reliable') ? (
              <>
                Your Journey, Your Way.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                  Safe and Reliable.
                </span>
              </>
            ) : (
              t('passengers_hero_title')
            )}
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {t('passengers_hero_subtitle')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#booking-section"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm tracking-wide shadow-lg hover:bg-[#ffe088] transition-all duration-300 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Book a Ride Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#passenger-app-download"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-card-dark text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all duration-300"
            >
              <Smartphone className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('passengers_hero_cta')}</span>
            </a>
          </div>

          <AppDownloadButtons role="passenger" className="mt-7" />
        </div>
      </section>

      {/* Executive Comfort Showcase */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-surface-dark overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl bg-white dark:bg-card-dark/90 p-2.5 sm:p-3.5 border border-slate-200 dark:border-[#D4AF37]/30 shadow-2xl">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900">
                  <Image
                    src="/images/passenger-executive-comfort.jpg"
                    alt="CABI Africa executive vehicle passenger sanctuary featuring luxury leather seating, ambient gold lighting, and digital ride concierge in Nairobi"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#D4AF37]/35">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ffe088]">
                        Executive Comfort &amp; Care
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                  Every Trip Counts
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-6">
                Ride in Calm &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                  Confidence.
                </span>
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  Whether you are heading across Westlands for an early board meeting, catching a flight at JKIA, or commuting home in the evening, CABI delivers quiet consistency on every corridor.
                </p>
                <p>
                  Choose from agile Boda rides, Economy sedans, or Diplomatic-grade SUVs—backed by transparent fare estimates, mobile money instant checkout, and vetted professional chauffeurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-white/70 dark:bg-brand-dark/50 border-y border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                Passenger Promise
              </span>
              <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('passengers_why_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map(({ title, description, icon: Icon }) => (
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

      {/* Testimonials Section */}
      <Testimonials
        title="What Our Passengers Are Saying"
        testimonials={[
          {
            quote:
              'CABI is my go-to app for getting around the city. The drivers are professional and the rides are always safe and reliable.',
            name: 'Grace M.',
            role: 'Passenger in Nairobi',
            avatarUrl: '/avatars/passenger1.png',
          },
          {
            quote:
              'Booking a ride is so easy, and I love the real-time tracking feature. It gives me great peace of mind.',
            name: 'David O.',
            role: 'Passenger in Nairobi',
            avatarUrl: '/avatars/passenger2.png',
          },
        ]}
      />

      {/* Bottom CTA */}
      <section id="passenger-app-download" className="py-16 sm:py-24 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-slate-900 dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 px-6 py-12 sm:px-12 sm:py-16 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[320px] rounded-full bg-[#D4AF37]/15 blur-[120px] pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Ready for Dispatch
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Request Your Next{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                  CABI Ride
                </span>
              </h2>

              <p className="text-sm sm:text-lg text-neutral-300 mb-8 leading-relaxed">
                Pin your pickup and destination online in seconds or download the passenger app directly for iOS and Android.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#booking-section"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm tracking-wide shadow-lg hover:bg-[#ffe088] transition-all duration-300 active:scale-95"
                >
                  <span>Compute Trajectory</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/5 text-white border border-white/15 font-bold text-sm hover:border-[#D4AF37]/60 hover:text-[#ffe088] transition-all duration-300"
                >
                  Create Account
                </Link>
              </div>

              <AppDownloadButtons role="passenger" tone="dark" className="mt-8 pt-7 border-t border-white/10" />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}