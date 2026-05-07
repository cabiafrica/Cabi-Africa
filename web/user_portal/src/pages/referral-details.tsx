import Head from 'next/head';
import Link from 'next/link';
import ReferralNetworkVisualizer from '@/components/dashboard/ReferralNetworkVisualizer';

export default function ReferralDetailsPage() {
    return (
        <>
            <Head>
                <title>CABI Business Builder | Build Your Business</title>
                <meta
                    name="description"
                    content="Learn how CABI's unique referral system empowers drivers to earn more by building a network."
                />
            </Head>
            <main className="bg-white dark:bg-gray-900">
                {/* Hero Section */}
                <section className="bg-gray-800 text-white text-center py-20">
                    <div className="container mx-auto px-4">
                        <h1 className="text-5xl font-bold mb-4">
                            More Than a Ride: Build Your Business with CABI
                        </h1>
                        <p className="text-xl mb-8">
                            Discover how our unique referral system helps you earn beyond the driver's seat.
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* How It Works Section */}
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                                How It Works: Simple and Transparent
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
                                Our referral system is designed to be straightforward. When you join as a CABI driver, you have the opportunity to refer other drivers to the platform. When they sign up using your unique referral code and start driving, you earn a commission on every ride they complete.
                            </p>
                            <p className="text-lg text-gray-700 dark:text-gray-400 leading-relaxed">
                                This creates a growing network. The more active drivers in your network, the more passive income you can generate. It's a powerful way to build a sustainable business on top of your regular driving earnings.
                            </p>
                        </section>

                        {/* Visual Aid Placeholder */}
                        <section className="mb-12 text-center">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                                Visualizing Your Network
                            </h2>
                            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 overflow-hidden">
                                <ReferralNetworkVisualizer />
                                <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-500 italic">Interactive demo of a Level 2 referral network</p>
                            </div>
                        </section>

                        {/* Earning Potential Section */}
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                                Earning Potential
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-400">
                                <li>Earn a percentage from every trip your direct referrals complete.</li>
                                <li>Unlock additional bonuses as your network reaches certain milestones.</li>
                                <li>Track your network's performance and your earnings directly in the driver app.</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section className="text-center bg-blue-50 dark:bg-blue-900/20 p-10 rounded-lg">
                            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                                Ready to Start Building?
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-400 mb-8">
                                Join the community of drivers who are earning more with CABI.
                            </p>
                            <Link
                                href="/download"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                            >
                                Sign Up to Drive
                            </Link>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
