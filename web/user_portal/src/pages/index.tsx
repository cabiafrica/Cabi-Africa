
import Link from 'next/link';
import Head from 'next/head';
import WebBookingWidget from '../components/marketing/WebBookingWidget';
import DynamicStats from '../components/marketing/DynamicStats';
import PostSummaryCard from '../components/PostSummaryCard';

import { getPostSummaries, BlogPostSummary } from '../../backend/services/cms';
import { FaBuilding, FaCar, FaUser, FaArrowRight, FaShieldAlt, FaRocket, FaGlobe } from 'react-icons/fa';

interface HomePageProps {
  posts: BlogPostSummary[];
}

export default function HomePage({ posts }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-black text-white selection:bg-brand-yellow selection:text-black">
      <Head>
        <title>Cabi - The Future of Ecosystem Mobility</title>
        <meta name="description" content="Join the unified mobility ecosystem. For Passengers, Drivers, and Organizations." />
      </Head>

      <header className="fixed w-full z-50 transition-all duration-300 bg-brand-black/80 backdrop-blur-md border-b border-white/10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold tracking-tighter hover:text-brand-yellow transition-colors">
            Cabi <span className="text-brand-yellow">.</span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-medium uppercase tracking-wide">About</Link>
            <Link href="/organizations" className="text-gray-400 hover:text-brand-purple transition-colors text-sm font-medium uppercase tracking-wide">For Orgs</Link>
            <Link href="/drivers" className="text-gray-400 hover:text-brand-accent transition-colors text-sm font-medium uppercase tracking-wide">For Drivers</Link>
            <Link href="/login" className="text-white hover:text-brand-yellow transition-colors font-medium">Log In</Link>
            <Link href="/register" className="bg-white text-black px-6 py-2.5 rounded-full hover:bg-brand-yellow transition-all transform hover:scale-105 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,215,0,0.6)]">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-20">
        {/* Dynamic Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20">
          {/* Abstract Background */}
          <div className="absolute inset-0 bg-brand-black">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand-gray/50 to-transparent"></div>
            <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10 bg-repeat"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-12">

              {/* Left Column: valueprop + Auth */}
              <div className="xl:w-1/2 flex flex-col items-center xl:items-start text-center xl:text-left">
                <div className="mb-10">
                  <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-none tracking-tight animate-slide-up">
                    Move <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Beyond</span> <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-accent">Expectations.</span>
                  </h1>
                  <p className="text-xl text-gray-400 mb-6 max-w-lg mx-auto xl:mx-0 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    The neural network for distributed ecosystem mobility.
                  </p>
                </div>

                {/* Auth Widget embedded in Hero Left (or Center on mobile) */}
                <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {/* Auth Widget removed as per user request */}
                </div>
              </div>

              {/* Right Column: Booking Widget */}
              <div className="xl:w-1/2 flex justify-center xl:justify-end w-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="relative group w-full max-w-md">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-yellow to-brand-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative">
                    <WebBookingWidget />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Trifecta */}
        <section className="py-32 bg-brand-dark relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">One Platform. <span className="text-gradient">Unknown Possibilities.</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto">We've broken down the walls between fleet management and ride-hailing.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Organization Card */}
              <div className="p-8 rounded-3xl bg-brand-gray/50 border border-white/5 hover:border-brand-purple/50 transition-all hover:-translate-y-2 group">
                <div className="h-14 w-14 bg-brand-purple/20 rounded-2xl flex items-center justify-center mb-6 text-brand-purple text-2xl group-hover:scale-110 transition-transform">
                  <FaBuilding />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Organizations</h3>
                <p className="text-gray-400 leading-relaxed mb-6">Manage entire fleets, track real-time analytics, and handle corporate travel with our recursive dashboard system.</p>
                <Link href="/organizations" className="text-brand-purple font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Manage Fleet <FaArrowRight />
                </Link>
              </div>

              {/* Driver Card */}
              <div className="p-8 rounded-3xl bg-brand-gray/50 border border-white/5 hover:border-brand-accent/50 transition-all hover:-translate-y-2 group">
                <div className="h-14 w-14 bg-brand-accent/20 rounded-2xl flex items-center justify-center mb-6 text-brand-accent text-2xl group-hover:scale-110 transition-transform">
                  <FaCar />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Drivers</h3>
                <p className="text-gray-400 leading-relaxed mb-6">Keep more earnings with transparent commissions. Join a Sacco or drive independently with instant payouts.</p>
                <Link href="/drivers" className="text-brand-accent font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Start Driving <FaArrowRight />
                </Link>
              </div>

              {/* Passenger Card */}
              <div className="p-8 rounded-3xl bg-brand-gray/50 border border-white/5 hover:border-brand-yellow/50 transition-all hover:-translate-y-2 group">
                <div className="h-14 w-14 bg-brand-yellow/20 rounded-2xl flex items-center justify-center mb-6 text-brand-yellow text-2xl group-hover:scale-110 transition-transform">
                  <FaUser />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Passengers</h3>
                <p className="text-gray-400 leading-relaxed mb-6">Experience premium rides at fair prices. Track your trips and rate your drivers in real-time.</p>
                <Link href="/register" className="text-brand-yellow font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Book a Ride <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section with Glassmorphism */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-accent/5"></div>
          <div className="container mx-auto px-6 relative z-10">
            <DynamicStats />
          </div>
        </section>

        {/* Blog Teaser */}
        <section className="py-32 bg-black">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-bold mb-4 text-white">Latest Intel</h2>
                <p className="text-gray-500">Updates from the Cabi network.</p>
              </div>
              <Link href="/blog" className="hidden md:block text-brand-yellow font-bold hover:text-white transition-colors">
                View All Posts &rarr;
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts && posts.slice(0, 3).map((post) => (
                <div key={post.id} className="glass rounded-2xl overflow-hidden hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="h-48 bg-gray-800 relative overflow-hidden">
                    {/* Placeholder for image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="text-xs font-bold bg-brand-yellow text-black px-2 py-1 rounded">NEWS</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-yellow transition-colors">{post.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{post.slug}</p> {/* Using slug as summary as per Type, ideally real summary */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-brand-dark/50 border-t border-white/5 text-white py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-bold mb-6 tracking-tighter">Cabi <span className="text-brand-yellow">.</span></h3>
              <p className="text-gray-500 leading-relaxed">The future of distributed mobility. Powered by Antigravity.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-gray-300">Platform</h4>
              <ul className="space-y-3 text-gray-500">
                <li><Link href="/organizations" className="hover:text-brand-accent transition-colors">Organizations</Link></li>
                <li><Link href="/drivers" className="hover:text-brand-accent transition-colors">Driver Network</Link></li>
                <li><Link href="/api" className="hover:text-brand-accent transition-colors">API Access</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-gray-300">Company</h4>
              <ul className="space-y-3 text-gray-500">
                <li><Link href="/about" className="hover:text-brand-accent transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-brand-accent transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-gray-300">Connect</h4>
              <ul className="space-y-3 text-gray-500">
                <li className="flex items-center gap-2"><FaGlobe /> Global</li>
                <li className="flex items-center gap-2"><FaShieldAlt /> Secure</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Cabi Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
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
