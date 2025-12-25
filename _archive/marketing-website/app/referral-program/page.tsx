import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
    title: "CABI Referral Program | Build Your Business",
    description: "Learn how CABI's unique Multi-Level Marketing (MLM) system empowers drivers to earn more by building a network.",
};

export default function ReferralProgramPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-800">Cabi</Link>
                    <div className="space-x-4">
                        <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
                        <Link href="/why-drive" className="text-gray-600 hover:text-gray-900">Why Drive?</Link>
                        <Link href="/referral-program" className="text-black font-bold border-b-2 border-yellow-400">Referral Program</Link>
                        <Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
                        <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up</Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow bg-white text-gray-800">
                {/* Hero Section */}
                <section className="bg-gray-900 text-white text-center py-20">
                    <div className="container mx-auto px-4">
                        <h1 className="text-5xl font-bold mb-4">
                            More Than a Ride: Build Your Business with CABI
                        </h1>
                        <p className="text-xl mb-8 text-gray-300">
                            Discover how our unique Referral Program helps you earn beyond the driver's seat.
                        </p>
                        <Link
                            href="/register"
                            className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-300"
                        >
                            Join Now
                        </Link>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* How It Works Section */}
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                How It Works: Simple and Transparent
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                Our Referral System is designed to be straightforward. When you join as a CABI driver, you have the opportunity to refer other drivers to the platform. When they sign up using your unique referral code and start driving, you earn a commission on every ride they complete.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                This creates a downline network. The more active drivers in your network, the more passive income you can generate. It's a powerful way to build a sustainable business on top of your regular driving earnings.
                            </p>
                        </section>

                        {/* Visual Aid Placeholder */}
                        <section className="mb-12 text-center">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                Visualizing Your Network
                            </h2>
                            <div className="bg-gray-100 p-8 rounded-lg border border-dashed border-gray-400">
                                <div className="text-6xl mb-4">👥 ➡️ 🚗 ➡️ 💰</div>
                                <p className="text-gray-600 font-medium">You refer Driver A. Driver A drives. You Earn.</p>
                                <p className="mt-4 text-sm text-gray-500">
                                    This simple model scales as you refer more drivers, creating a powerful income stream along with your own rides.
                                </p>
                            </div>
                        </section>

                        {/* Earning Potential Section */}
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                Earning Potential
                            </h2>
                            <ul className="list-disc list-inside space-y-3 text-lg text-gray-700">
                                <li><span className="font-bold">Passive Commissions:</span> Earn a percentage from every trip your direct referrals complete.</li>
                                <li><span className="font-bold">Milestone Bonuses:</span> Unlock additional cash bonuses as your network reaches certain active driver counts.</li>
                                <li><span className="font-bold">Real-time Tracking:</span> Track your network's performance and your earnings directly in the Cabi Driver app.</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section className="text-center bg-blue-50 p-10 rounded-2xl border border-blue-100">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                Ready to Start Building?
                            </h2>
                            <p className="text-lg text-gray-700 mb-8">
                                Join the community of drivers who are earning more with CABI.
                            </p>
                            <Link
                                href="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg"
                            >
                                Sign Up to Drive
                            </Link>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 text-white py-8 px-6 text-center mt-auto">
                <p>&copy; {new Date().getFullYear()} Cabi. All rights reserved.</p>
            </footer>
        </div>
    );
}
