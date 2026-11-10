import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Testimonials from '@/components/Testimonials';
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
  return (
    <MainLayout
      title={`${t('passengers_hero_title')} | CABI`}
      description={t('passengers_hero_subtitle')}
    >
      <div className="bg-slate-50 dark:bg-surface-dark">
        {/* Hero Section */}
        <section
          className="relative bg-surface-dark text-white text-center py-16 sm:py-24 bg-cover bg-center border-b border-white/10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579577909921-429654b11b39?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-black/75"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black mb-4">{t('passengers_hero_title')}</h1>
            <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto text-neutral-300">{t('passengers_hero_subtitle')}</p>
            <Link
              href="/download"
              className="inline-block bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-3.5 px-8 rounded-xl text-base sm:text-lg shadow-lg transition-colors"
            >
              {t('passengers_hero_cta')}
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-slate-50 dark:bg-surface-dark">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-3xl font-black text-center mb-12 text-slate-900 dark:text-white">{t('passengers_why_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mx-auto">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('passengers_booking_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{t('passengers_booking_desc')}</p>
              </div>
              <div className="p-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mx-auto">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('passengers_safety_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{t('passengers_safety_desc')}</p>
              </div>
              <div className="p-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mx-auto">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18H3a2 2 0 01-2-2v-6a2 2 0 012-2h4l1.6-3.2A1 1 0 019.6 3H14a2 2 0 012 2v5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('passengers_reliability_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{t('passengers_reliability_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials
          title="What Our Passengers Are Saying"
          testimonials={[
            {
              quote: "CABI is my go-to app for getting around the city. The drivers are professional and the rides are always safe and reliable.",
              name: 'Grace M.',
              role: 'Passenger in Nairobi',
              avatarUrl: '/avatars/passenger1.png', // Placeholder path
            },
            {
              quote: "Booking a ride is so easy, and I love the real-time tracking feature. It gives me great peace of mind.",
              name: 'David O.',
              role: 'Passenger in Nairobi',
              avatarUrl: '/avatars/passenger2.png', // Placeholder path
            },
          ]}
        />
      </div>
    </MainLayout>
  );
}