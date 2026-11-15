import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Smartphone, FileText, Clock, Zap, PartyPopper, Gift, Share2, Coins, CheckCircle } from 'lucide-react';
import { APP_LINKS } from '@/config/appLinks';

export default function SuccessPage() {
    const router = useRouter();
    const [paymentDetails, setPaymentDetails] = useState<any>(null);
    const [referralCode, setReferralCode] = useState('');

    useEffect(() => {
        // Get payment confirmation from session storage
        const confirmation = sessionStorage.getItem('paymentConfirmation');
        if (confirmation) {
            setPaymentDetails(JSON.parse(confirmation));
        }

        // Generate a unique referral code for the new driver
        const code = `DRIVER${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        setReferralCode(code);

        // Clear session storage
        sessionStorage.removeItem('paymentDetails');
        sessionStorage.removeItem('paymentConfirmation');
    }, []);

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        alert('Referral code copied to clipboard!');
    };

    const shareReferralLink = () => {
        const link = `${window.location.origin}/drivers/register?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        alert('Referral link copied to clipboard!');
    };

    return (
        <MainLayout
            title="Registration Successful | CABI"
            description="Your driver registration is complete"
        >
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 relative overflow-hidden">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Success Animation */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full mb-6 animate-bounce">
                            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
                            <PartyPopper className="w-9 h-9 text-brand-yellow" /> Registration Successful!
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Welcome to the CABI driver community!
                        </p>
                    </div>

                    {/* Payment Confirmation */}
                    {paymentDetails && (
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl p-8 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Payment Confirmed
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        KES {paymentDetails.amount?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                        {paymentDetails.method}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                                        {paymentDetails.paymentId}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            What's Next?
                        </h2>

                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/30 rounded-full flex items-center justify-center">
                                    <Smartphone className="w-5 h-5 text-brand-yellow" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        Download the CABI Driver App
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                        Get started by downloading our mobile app to complete your profile and upload required documents.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href="#footer-download-menu"
                                            className="inline-flex items-center px-5 py-2.5 bg-primary-container text-black font-semibold rounded-lg hover:bg-primary-highlight transition-colors"
                                        >
                                            Download CABI Drive in Footer Menu ↓
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/30 rounded-full flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-brand-yellow" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        Upload Your Documents
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Upload your driver's license, vehicle registration, and insurance documents through the app.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/30 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-brand-yellow" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        Wait for Approval
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Our team will review your application within 2-3 business days. You'll receive an email notification once approved.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/30 rounded-full flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-brand-yellow" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        Start Earning!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Once approved, you can go online and start accepting ride requests immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div className="bg-gradient-to-r from-black to-neutral-900 rounded-2xl shadow-xl p-8 mb-6 text-white border border-brand-yellow/20">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Gift className="w-6 h-6 text-brand-yellow" /> Your Referral Code
                        </h2>
                        <p className="mb-4 text-neutral-300">
                            Earn recurring income by referring fellow drivers and passengers! Share your unique code to unlock 2 levels of ongoing incentives in Ksh.
                        </p>

                        <div className="bg-white/10 backdrop-blur rounded-xl border border-white/10 p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold tracking-wider">{referralCode}</span>
                                <button
                                    onClick={copyReferralCode}
                                    className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#ffe088] transition-colors font-bold"
                                >
                                    Copy Code
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={shareReferralLink}
                            className="w-full px-6 py-3 bg-brand-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-4 h-4" /> Share Referral Link
                        </button>

                        <p className="mt-4 text-sm text-neutral-400 flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-brand-yellow" /> Earn 2-level recurring rewards in Ksh from driver earnings and rider usage!
                        </p>
                    </div>

                    {/* Support */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl p-8 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Need Help?
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            Our support team is available 24/7 to assist you
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:cabifastafrica@gmail.com"
                                className="inline-flex items-center justify-center px-6 py-3 bg-[#D4AF37] text-black font-extrabold rounded-xl hover:bg-[#ffe088] transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Support
                            </a>
                            <Link
                                href="/faq"
                                className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-white/15 text-neutral-700 dark:text-neutral-300 rounded-xl hover:border-[#D4AF37]/50 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                View FAQ
                            </Link>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="text-[#D4AF37] hover:text-[#ffe088] hover:underline font-semibold"
                        >
                            ← Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
