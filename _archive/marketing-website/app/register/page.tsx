'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        referralCode: '',
        vehicleType: 'car', // 'car' or 'bike/scooter'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [recaptchaVerified, setRecaptchaVerified] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const verifyRecaptcha = () => {
        // Mock reCAPTCHA verification
        setTimeout(() => {
            setRecaptchaVerified(true);
        }, 500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recaptchaVerified) {
            alert('Please complete the captcha verification.');
            return;
        }

        setIsLoading(true);

        // Simulate API call to POST /driver-leads/register
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setShowPayment(true);
    };

    const handlePayment = async () => {
        setIsLoading(true);
        // Simulate Payment API
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        setShowPayment(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border-t-8 border-green-500">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🎉</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Cabi!</h2>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                        Your application and registration fee have been received. You're just a few steps away from earning!
                    </p>

                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8">
                        <h3 className="font-bold text-lg mb-2 text-yellow-800">Next Steps</h3>
                        <p className="text-sm text-yellow-700">
                            Download the Cabi Driver app to complete your profile, upload documents, and start driving.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 flex justify-center items-center">
                            <span>Download on App Store</span>
                        </button>
                        <button className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 flex justify-center items-center">
                            <span>Get it on Google Play</span>
                        </button>
                        <Link href="/" className="mt-4 text-gray-500 hover:text-gray-800 text-sm">Return Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (showPayment) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border-t-8 border-yellow-400">
                    <h2 className="text-2xl font-bold mb-2 text-center">Registration Fee</h2>
                    <p className="text-gray-500 text-center mb-8">A one-time fee to process your background check and application.</p>

                    <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                        <span className="font-semibold">Application Fee</span>
                        <span className="font-bold text-xl">$49.99</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Card Number</label>
                            <div className="relative">
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-black focus:border-black outline-none" />
                                <span className="absolute left-3 top-3.5 text-gray-400">💳</span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border rounded-lg focus:ring-black focus:border-black outline-none" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-700 mb-1">CVC</label>
                                <input type="text" placeholder="123" className="w-full px-4 py-3 border rounded-lg focus:ring-black focus:border-black outline-none" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Pay $49.99'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Left Column - Hero/Image */}
            <div className="w-full md:w-5/12 bg-black text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1557404763-69708cd8b9ce?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center"></div>

                <div className="relative z-10">
                    <Link href="/" className="text-2xl font-bold text-yellow-400">Cabi</Link>
                </div>

                <div className="relative z-10 my-10 md:my-0">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                        Drive with purpose.<br />
                        <span className="text-yellow-400">Earn with pride.</span>
                    </h1>
                    <ul className="space-y-4 text-lg text-gray-300">
                        <li className="flex items-center">
                            <span className="mr-3 text-green-400">✓</span> Be your own boss
                        </li>
                        <li className="flex items-center">
                            <span className="mr-3 text-green-400">✓</span> Instant payouts
                        </li>
                        <li className="flex items-center">
                            <span className="mr-3 text-green-400">✓</span> 24/7 Support
                        </li>
                    </ul>
                </div>

                <div className="relative z-10 text-sm text-gray-500">
                    Already have an account? <Link href="/login" className="text-white underline hover:text-yellow-400">Sign In</Link>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500 mb-8">Join the fastest-growing driver community today.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="(555) 555-5555"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code (Optional)</label>
                            <input
                                type="text"
                                name="referralCode"
                                placeholder="PROMO123"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                value={formData.referralCode}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Mock reCAPTCHA */}
                        <div className="py-4">
                            <div
                                onClick={verifyRecaptcha}
                                className={`p-4 border rounded-lg flex items-center cursor-pointer transition-colors ${recaptchaVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center ${recaptchaVerified ? 'border-green-500 bg-green-500' : 'border-gray-400 bg-white'}`}>
                                    {recaptchaVerified && <span className="text-white text-sm font-bold">✓</span>}
                                </div>
                                <span className={`text-sm ${recaptchaVerified ? 'text-green-700' : 'text-gray-600'}`}>I'm not a robot</span>
                                <span className="ml-auto text-xs text-gray-400">reCAPTCHA</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !recaptchaVerified}
                            className={`w-full py-4 text-lg font-bold text-white rounded-xl transition-all transform active:scale-95 ${isLoading || !recaptchaVerified
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-black hover:bg-gray-900 shadow-lg'
                                }`}
                        >
                            {isLoading ? 'Processing...' : 'Submit Application'}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By submitting, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
