
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

      <main className="flex-grow pt-20">

        {/* Dynamic Hero Slider */}
        <HeroSlider />

        {/* Booking Section (Across Screen) */}
        <BookingSection />

        {/* Feature Split: Drivers */}
        <FeatureSplit type="driver" />

        {/* Feature Split: Passengers */}
        <FeatureSplit type="passenger" />

        {/* Stats Section with Glassmorphism */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-accent/5"></div>
          <div className="container mx-auto px-6 relative z-10">
            <DynamicStats />
          </div>
        </section>

        {/* Blog Teaser (Intel) */}
        <section className="py-24 bg-white dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Latest Intel</h2>
                <p className="text-slate-500 dark:text-gray-500">Updates from the CABI network.</p>
              </div>
              <Link href="/blog" className="hidden md:block text-brand-yellow font-bold hover:text-white transition-colors">
                View All Intel &rarr;
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts && posts.slice(0, 3).map((post) => (
                <PostSummaryCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* Organizations Slider (Trusted Partners) */}
        {/* <OrganizationsSlider /> */}

        {/* Testimonials (Last) */}
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
