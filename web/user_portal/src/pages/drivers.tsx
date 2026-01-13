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
      <div className="bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section
          className="relative bg-gray-900 text-white text-center py-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542282088-fe8416dbe6c5?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl font-bold mb-4">{t('drivers_hero_title')}</h1>
            <p className="text-xl mb-8">{t('drivers_hero_subtitle')}</p>
            <Link
              href="/drivers/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              {t('drivers_hero_cta')}
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">{t('drivers_why_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2 dark:text-white">{t('drivers_flexibility_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('drivers_flexibility_desc')}</p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2 dark:text-white">{t('drivers_earnings_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('drivers_earnings_desc')}</p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2 dark:text-white">{t('drivers_payouts_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('drivers_payouts_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Business Builder Section */}
        <section className="py-16 bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4 dark:text-white">
                  More Than Just Driving: Build Your Business
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Our Business Builder system is what sets CABI apart. It's not just about earning from rides; it's about building a network and creating a sustainable business. Refer other drivers and earn a commission from their trips. The more your network grows, the more you earn.
                </p>
                <Link
                  href="/referral-details" // Updated from /mlm-details
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
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