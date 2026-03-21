
import Link from 'next/link';
import Head from 'next/head';
import WebBookingWidget from '../components/marketing/WebBookingWidget';
import DynamicStats from '../components/marketing/DynamicStats';
import OrganizationsSlider from '../components/marketing/OrganizationsSlider';
import TestimonialsWidget from '../components/marketing/TestimonialsWidget';
import PostSummaryCard from '../components/PostSummaryCard';
import HeroSlider from '../components/marketing/HeroSlider';
import FeatureSplit from '../components/marketing/FeatureSplit';
import BookingSection from '../components/marketing/BookingSection';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// ... (in HomePage component return)

import { getPostSummaries, BlogPostSummary } from '@/services/cms';
import { FaBuilding, FaCar, FaUser, FaArrowRight, FaShieldAlt, FaRocket, FaGlobe } from 'react-icons/fa';

interface HomePageProps {
  posts: BlogPostSummary[];
}

export default function HomePage({ posts }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white transition-colors duration-300">
      <Head>
        <title>CABI - The Future of Ecosystem Mobility</title>
        <meta name="description" content="Join the unified mobility ecosystem. For Passengers, Drivers, and Organizations." />
      </Head>

      <Header />

      <main className="flex-grow">

        {/* Dynamic Hero Slider */}
        <HeroSlider />

        {/* Booking Section (Across Screen) */}
        <BookingSection />

        {/* Feature Split: Drivers */}
        <FeatureSplit type="driver" />

        {/* Stats Section with Neural Theme */}
        <DynamicStats />

        {/* Feature Split: Passengers */}
        <FeatureSplit type="passenger" />

        {/* Blog Teaser (System Intel) */}
        <section className="py-32 bg-brand-black relative">
          <div className="absolute inset-0 grid-futurist opacity-10" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 animate-reveal">
              <div>
                <div className="mb-4 flex items-center gap-4">
                    <span className="h-px w-8 bg-brand-yellow opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow">Data Feed</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter">System <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-accent">Intel.</span></h2>
                <p className="text-white/40 mt-4 font-medium">Real-time protocols and tactical updates from the CABI network.</p>
              </div>
              <Link href="/blog" className="px-8 py-3 rounded-xl border border-white/10 text-white/60 text-xs font-black uppercase tracking-widest hover:border-brand-yellow hover:text-brand-yellow transition-all">
                Access Archives &rarr;
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {posts && posts.slice(0, 3).map((post) => (
                <div key={post.id} className="group cursor-pointer">
                  <PostSummaryCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials (Final Phase) */}
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
