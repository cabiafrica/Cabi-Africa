
import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ExecutiveHero from '../components/marketing/ExecutiveHero';
import FleetMatrix from '../components/marketing/FleetMatrix';
import FeatureSplit from '../components/marketing/FeatureSplit';
import BookingSection from '../components/marketing/BookingSection';
import TestimonialsWidget from '../components/marketing/TestimonialsWidget';
import ContactSection from '../components/marketing/ContactSection';
import SocialLinks from '@/components/ui/SocialLinks';
import PostSummaryCard from '../components/PostSummaryCard';
import { getPostSummaries, BlogPostSummary } from '@/services/cms';

interface HomePageProps {
  posts: BlogPostSummary[];
}

export default function HomePage({ posts }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white transition-colors duration-300">
      <Head>
        <title>CABI Africa | Precision Captain &amp; Urban Transit</title>
        <meta
          name="description"
          content="Ultra-premium African mobility ecosystem with seamless ride booking, mobile money instant settlement, and executive concierge."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* OpenGraph Image SEO */}
        <meta property="og:title" content="CABI Africa | Precision Captain &amp; Urban Transit" />
        <meta property="og:description" content="Ultra-premium African mobility ecosystem with seamless ride booking, mobile money instant settlement, and executive concierge." />
        <meta property="og:image" content="https://cabi.africa/images/hero-fleet.jpg" />
        <meta property="og:image:alt" content="CABI Africa multi-tier mobility fleet including electric Boda, CabiGo compact, Executive Sedan, and Diplomatic XL Van across Nairobi" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Image SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CABI Africa | Precision Captain &amp; Urban Transit" />
        <meta name="twitter:description" content="Ultra-premium African mobility ecosystem with seamless ride booking, mobile money instant settlement, and executive concierge." />
        <meta name="twitter:image" content="https://cabi.africa/images/hero-fleet.jpg" />
        <meta name="twitter:image:alt" content="CABI Africa multi-tier mobility fleet including electric Boda, CabiGo compact, Executive Sedan, and Diplomatic XL Van across Nairobi" />
      </Head>

      {/* Accessible Skip Link (Reveals on Tab focus) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2.5 focus:bg-brand-yellow focus:text-black focus:font-black focus:text-xs focus:uppercase focus:tracking-wider focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-black"
      >
        Skip to main content &darr;
      </a>
      <Header />

      <main id="main-content" className="flex-grow pt-16 md:pt-20">
        {/* 1. Hero Section */}
        <ExecutiveHero />

        {/* 2. Quick Booking */}
        <div id="booking-section">
          <BookingSection />
        </div>

        {/* 3. Our Fleet */}
        <FleetMatrix />

        {/* 4. For Driver */}
        <FeatureSplit type="driver" />

        {/* 5. For Passengers */}
        <FeatureSplit type="passenger" />

        {/* 6. Blog (Latest Intel) */}
        <section className="py-20 sm:py-28 bg-slate-50 dark:bg-surface-dark transition-colors duration-500 relative">
          <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-6">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                    Editorial
                  </span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                  Latest{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                    Intel.
                  </span>
                </h2>
                <p className="text-gray-600 dark:text-white/60 mt-3 font-medium text-sm sm:text-base">
                  Stories, product updates, and city mobility highlights across the CABI network.
                </p>
              </div>
              <Link
                href="/blog"
                className="px-6 py-3 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/80 text-xs font-black uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] dark:hover:border-[#D4AF37] dark:hover:text-[#D4AF37] transition-all"
              >
                View All Articles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts &&
                posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="group cursor-pointer">
                    <PostSummaryCard post={post} />
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* 7. Feedback (Testimonials) */}
        <TestimonialsWidget />

        {/* 8. Social Media */}
        <section
          id="social-media"
          aria-label="Social Media"
          className="py-12 sm:py-16 bg-slate-50 dark:bg-surface-dark transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SocialLinks variant="contact" />
          </div>
        </section>

        {/* 9. Contact Us */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const posts = await getPostSummaries();
  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
}
