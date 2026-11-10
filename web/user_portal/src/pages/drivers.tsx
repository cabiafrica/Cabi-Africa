import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Testimonials from '@/components/Testimonials';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/layout/MainLayout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default function ForDriversPage(
  _props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { t } = useTranslation('common');
  return (
    <MainLayout
      title={`${t('drivers_hero_title')} | CABI`}
      description={t('drivers_hero_subtitle')}
    >
      <div className="bg-slate-50 dark:bg-surface-dark">
        {/* Hero Section */}
        <section
          className="relative bg-surface-dark text-white text-center py-16 sm:py-24 bg-cover bg-center border-b border-white/10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542282088-fe8416dbe6c5?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-black/75"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black mb-4">{t('drivers_hero_title')}</h1>
            <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto text-neutral-300">{t('drivers_hero_subtitle')}</p>
            <Link
              href="/drivers/register"
              className="inline-block bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-3.5 px-8 rounded-xl text-base sm:text-lg shadow-lg transition-colors"
            >
              {t('drivers_hero_cta')}
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-slate-50 dark:bg-surface-dark">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-3xl font-black text-center mb-12 text-slate-900 dark:text-white">{t('drivers_why_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mx-auto">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('drivers_flexibility_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{t('drivers_flexibility_desc')}</p>
              </div>

              <div className="p-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mx-auto">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('drivers_earnings_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{t('drivers_earnings_desc')}</p>
              </div>

              <div className="p-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mx-auto">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('drivers_payouts_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{t('drivers_payouts_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Business Builder Section */}
        <section className="py-16 bg-white/70 dark:bg-brand-dark/50 border-y border-slate-200 dark:border-white/10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">
                  More Than Just Driving: Build Your Business
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                  Our Business Builder system is what sets CABI apart. It's not just about earning from rides; it's about building a network and creating a sustainable business. Refer other drivers and earn a commission from their trips. The more your network grows, the more you earn.
                </p>
                <Link
                  href="/referral-details"
                  className="text-[#D4AF37] hover:text-[#ffe088] font-bold hover:underline"
                >
                  Learn More About the Referral System &rarr;
                </Link>
              </div>
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"
                  alt="Community of drivers working together"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials
          title="Hear from Our Drivers"
          testimonials={[
            {
              quote: "Driving with CABI has changed my life. The Business Builder program provides a second income stream I never thought possible.",
              name: 'James K.',
              role: 'Driver in Nairobi',
              avatarUrl: '/avatars/driver1.png', // Placeholder path
            },
            {
              quote: "The flexibility is amazing. I can set my own hours and be there for my family, all while earning a great income.",
              name: 'Amina S.',
              role: 'Driver in Nairobi',
              avatarUrl: '/avatars/driver2.png', // Placeholder path
            },
          ]}
        />
      </div>
    </MainLayout>
  );
}