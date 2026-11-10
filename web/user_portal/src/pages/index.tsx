
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
import PostSummaryCard from '../components/PostSummaryCard';
import { getPostSummaries, BlogPostSummary } from '@/services/cms';

interface HomePageProps {
  posts: BlogPostSummary[];
}

export default function HomePage({ posts }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white transition-colors duration-300">
      <Head>
        <title>CABI Africa | Precision Chauffeur &amp; Urban Transit</title>
        <meta
          name="description"
          content="Ultra-premium African mobility ecosystem with seamless ride booking, M-Pesa instant settlement, and executive concierge."
        />
      </Head>

      <Header />

      <main className="flex-grow pt-16 md:pt-20">
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

        {/* 8. Contact Us */}
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
