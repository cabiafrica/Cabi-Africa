
import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LiveTelemetryBar from '../components/marketing/LiveTelemetryBar';
import ExecutiveHero from '../components/marketing/ExecutiveHero';
import FleetMatrix from '../components/marketing/FleetMatrix';
import DynamicStats from '../components/marketing/DynamicStats';
import FeatureSplit from '../components/marketing/FeatureSplit';
import BookingSection from '../components/marketing/BookingSection';
import TestimonialsWidget from '../components/marketing/TestimonialsWidget';
import PostSummaryCard from '../components/PostSummaryCard';
import { getPostSummaries, BlogPostSummary } from '@/services/cms';

interface HomePageProps {
  posts: BlogPostSummary[];
}

export default function HomePage({ posts }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white transition-colors duration-300">
      <Head>
        <title>CABI Africa | Sovereign African Mobility &amp; Urban Transit</title>
        <meta
          name="description"
          content="Ultra-premium African mobility ecosystem with real-time telemetry, M-Pesa instant settlement, and executive concierge."
        />
      </Head>

      <Header />

      <main className="flex-grow">
        {/* Live Dispatch Telemetry Context Bar */}
        <div className="pt-16 md:pt-20">
          <LiveTelemetryBar />
        </div>

        {/* Executive Obsidian Gold Hero */}
        <ExecutiveHero />

        {/* Tailored Fleet Tier Selection Matrix */}
        <FleetMatrix />

        {/* Interactive Web Booking & Dispatch Section */}
        <div id="booking-section">
          <BookingSection />
        </div>

        {/* Dynamic Telemetry Network Statistics */}
        <DynamicStats />

        {/* Feature Split: Drivers & Fleet Owners */}
        <FeatureSplit type="driver" />

        {/* Feature Split: Passengers & Corporate VIPs */}
        <FeatureSplit type="passenger" />

        {/* System Intel & Tactical Blog Feed */}
        <section className="py-28 bg-slate-50 dark:bg-brand-black transition-colors duration-500 relative">
          <div className="absolute inset-0 grid-futurist opacity-10 dark:opacity-20 pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 animate-reveal">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                    Data Feed
                  </span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                  System{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                    Intel.
                  </span>
                </h2>
                <p className="text-gray-600 dark:text-white/50 mt-3 font-medium text-sm sm:text-base">
                  Real-time protocol briefings, regulatory clearances, and tactical updates across the CABI corridor.
                </p>
              </div>
              <Link
                href="/blog"
                className="px-6 py-3 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/80 text-xs font-black uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] dark:hover:border-[#D4AF37] dark:hover:text-[#D4AF37] transition-all"
              >
                Access Archives &rarr;
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {posts &&
                posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="group cursor-pointer">
                    <PostSummaryCard post={post} />
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialsWidget />
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
