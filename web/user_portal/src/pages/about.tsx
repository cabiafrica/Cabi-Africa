import { GetStaticProps } from 'next';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MainLayout from '@/components/layout/MainLayout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default function AboutPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout
      title="About Us | CABI"
      description="Learn about CABI's mission, vision, and the team driving the future of ride-hailing."
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            About CABI: Our Journey and Our Promise
          </h1>
          <p className="mt-6 text-2xl text-indigo-100 max-w-4xl mx-auto font-semibold">
            Moving People, Improving Lives
          </p>
          <p className="mt-4 text-lg text-indigo-200 max-w-3xl mx-auto">
            At CABI, our mission is simple: to provide safe, reliable, and accessible transportation for everyone.
            We believe that by connecting people and communities, we can create opportunities and improve lives.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
                The CABI Story
              </h2>
              <div className="prose prose-lg text-gray-500 dark:text-gray-400">
                <p>
                  CABI was founded in 2024 with a simple yet powerful idea: what if getting a ride could be
                  easier, safer, and more enjoyable for everyone involved? Frustrated with the limitations of
                  traditional transportation options, our founders envisioned a platform that would leverage
                  technology to create a seamless experience for both passengers and drivers.
                </p>
                <p className="mt-4">
                  What started as a small operation in Nairobi has grown into a thriving community of riders
                  and drivers across Kenya. Our growth is a testament to the trust our users place in us and
                  the hard work of our dedicated driver-partners.
                </p>
                <p className="mt-4">
                  We are committed to building a platform that not only serves our passengers but also empowers
                  our driver-partners to build sustainable businesses. Through our innovative Business Builder
                  referral system, drivers can earn additional income by growing the CABI community.
                </p>
                <p className="mt-4">
                  Today, we are operating in major cities across Kenya, connecting thousands of people daily.
                  But this is just the beginning of our journey to transform transportation in Africa.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 relative">
              <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                  alt="The CABI team working together"
                  width={800}
                  height={533}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-slate-50 dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Safety First */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Safety First</h3>
              <p className="text-gray-500 dark:text-gray-400">
                The safety of our passengers and drivers is our absolute priority. From rigorous driver screening to in-app safety features, we are relentless in our pursuit of a secure platform.
              </p>
            </div>

            {/* Driver Empowerment */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Driver Empowerment</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Our drivers are the heart of our business. We are committed to providing them with the tools, support, and opportunities they need to succeed and thrive. We believe in fair compensation, flexible work, and a respectful partnership.
              </p>
            </div>

            {/* Customer Obsession */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Obsession</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We are obsessed with providing an exceptional experience for our riders. We continuously listen to feedback and innovate to meet and exceed their expectations.
              </p>
            </div>

            {/* Community Focus */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Community Focus</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We believe in the power of community. We strive to be a positive force in the cities we serve, fostering local connections and contributing to local economies.
              </p>
            </div>

            {/* Integrity */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Integrity</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We operate with transparency and integrity in everything we do. We are honest with our users and accountable for our actions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Join Us on Our Journey
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Whether you're looking to drive with us or ride with us, we'd love to have you as part of the CABI community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/drivers/register"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Sign Up to Drive
            </a>
            <a
              href="/faq"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}