import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ReferralNetworkVisualizer from '@/components/dashboard/ReferralNetworkVisualizer';

export default function ReferralDetailsPage() {
    return (
        <MainLayout
            title="CABI Business Builder | Build Your Business"
            description="Learn how CABI's unique referral system empowers drivers to earn more by building a network."
        >
            <div className="bg-slate-50 dark:bg-surface-dark">
                {/* Hero Section */}
                <section className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white text-center py-20 border-b border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[380px] rounded-full bg-[#D4AF37]/10 blur-[130px] pointer-events-none" />
                    <div className="container mx-auto px-4 relative z-10">
                        <h1 className="text-4xl sm:text-5xl font-black mb-4">
                            More Than a Ride: Build Your Business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">CABI</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                            Discover how our unique referral system helps you earn beyond the driver's seat.
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* How It Works Section */}
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                                How It Works: Simple and Transparent
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                Our referral system is designed to be straightforward. When you join as a CABI driver, you have the opportunity to refer other drivers to the platform. When they sign up using your unique referral code and start driving, you earn a commission on every ride they complete.
                            </p>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                This creates a growing network. The more active drivers in your network, the more passive income you can generate. It's a powerful way to build a sustainable business on top of your regular driving earnings.
                            </p>
                        </section>

                        {/* Visual Aid Placeholder */}
                        <section className="mb-12 text-center">
                            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                                Visualizing Your Network
                            </h2>
                            <div className="bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                                <ReferralNetworkVisualizer />
                                <p className="mt-6 text-sm text-center text-neutral-500 italic">Interactive demo of a Level 2 referral network</p>
                            </div>
                        </section>

                        {/* Earning Potential Section */}
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                                Earning Potential
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-lg text-neutral-600 dark:text-neutral-400">
                                <li>Earn a percentage from every trip your direct referrals complete.</li>
                                <li>Unlock additional bonuses as your network reaches certain milestones.</li>
                                <li>Track your network's performance and your earnings directly in the driver app.</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section className="text-center bg-slate-900 dark:bg-card-dark border border-[#D4AF37]/30 p-10 rounded-3xl text-white shadow-2xl">
                            <h2 className="text-3xl font-black mb-4">
                                Ready to Start Building?
                            </h2>
                            <p className="text-lg text-neutral-300 mb-8">
                                Join the community of drivers who are earning more with CABI.
                            </p>
                            <Link
                                href="/download"
                                className="inline-block bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-3.5 px-8 rounded-xl text-base transition-colors shadow-lg"
                            >
                                Sign Up to Drive
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
