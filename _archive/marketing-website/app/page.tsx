import Link from 'next/link';
import WebBookingWidget from '../components/WebBookingWidget';

import DynamicStats from '../components/marketing/DynamicStats';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Cabi</h1>
          <div className="space-x-4 flex items-center">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/why-drive" className="text-gray-600 hover:text-gray-900">Why Drive?</Link>
            <Link href="/referral-program" className="text-gray-600 hover:text-gray-900 font-medium text-blue-600">Referral Program</Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2">Sign Up</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="container mx-auto px-6 py-24 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                  Your Ride, <br />
                  <span className="text-yellow-400">Reimagined.</span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
                  Experience the most reliable, fair, and comfortable ride-hailing service in town. Book instantly via web or app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transition-transform transform hover:scale-105 shadow-lg">
                    Start Driving
                  </Link>
                  <Link href="/download" className="bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold px-8 py-4 rounded-full text-lg hover:bg-white/20 transition-transform transform hover:scale-105">
                    Get the App
                  </Link>
                </div>
              </div>

              {/* Web Booking Widget */}
              <div className="lg:w-1/2 flex justify-center lg:justify-end w-full">
                <WebBookingWidget />
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Stats */}
        <DynamicStats />

        {/* Features */}
        <section className="py-16 container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Fair Earnings</h3>
              <p className="text-gray-600">Keep more of what you earn with our low commission model.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">Drive whenever you want. No minimum hours required.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Driver Community</h3>
              <p className="text-gray-600">Join a supportive network of drivers and mentors.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 px-6 text-center">
        <p>&copy; 2024 Cabi. All rights reserved.</p>
      </footer>
    </div>
  );
}
