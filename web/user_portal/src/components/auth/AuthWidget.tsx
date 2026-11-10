'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaUser, FaCar, FaGoogle, FaApple } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

type AuthMode = 'login' | 'register';
type UserRole = 'passenger' | 'driver';

export default function AuthWidget() {
    const [mode, setMode] = useState<AuthMode>('register');
    const [role, setRole] = useState<UserRole>('passenger');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Form submitted:', { mode, role, email, referralCode });
        setLoading(false);

        // In a real app, handle redirect or auth state update here
    };

    return (
        <div className="glass p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-brand-purple to-brand-accent"></div>

            {/* Header / Tabs */}
            <div className="flex justify-center mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setMode('login')}
                    className={`px-6 py-2 text-lg font-bold transition-colors ${mode === 'login' ? 'text-white border-b-2 border-brand-yellow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Log In
                </button>
                <button
                    onClick={() => setMode('register')}
                    className={`px-6 py-2 text-lg font-bold transition-colors ${mode === 'register' ? 'text-white border-b-2 border-brand-yellow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Role Selection (Register Only) */}
                {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('passenger')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'passenger'
                                ? 'bg-brand-yellow text-black border-brand-yellow shadow-lg'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <FaUser className="text-2xl" />
                            <span className="font-bold text-sm">Passenger</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('driver')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'driver'
                                ? 'bg-brand-accent text-black border-brand-accent shadow-lg'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <FaCar className="text-2xl" />
                            <span className="font-bold text-sm">Driver</span>
                        </button>
                    </div>
                )}

                {/* Common Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-brand-dark/50 border border-gray-700 focus:border-white rounded-xl outline-none text-white transition-all focus:ring-1 focus:ring-white/20"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-brand-dark/50 border border-gray-700 focus:border-white rounded-xl outline-none text-white transition-all focus:ring-1 focus:ring-white/20"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Driver Specifics */}
                    {mode === 'register' && role === 'driver' && (
                        <div className="animate-fade-in">
                            <label className="block text-brand-accent text-xs uppercase font-bold tracking-wider mb-2">Referral Code (Optional)</label>
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-accent/30 focus:border-brand-accent rounded-xl outline-none text-white transition-all focus:ring-1 focus:ring-brand-accent/20 placeholder-gray-600"
                                placeholder="Enter code or leave blank"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {referralCode ? 'Registration linked to referrer.' : 'No code? You will register under the System.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${role === 'driver' && mode === 'register'
                        ? 'bg-brand-accent text-black hover:bg-cyan-300 shadow-cyan-500/20'
                        : 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                        }`}
                >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : (role === 'driver' ? 'Apply to Drive' : 'Create Account'))}
                </button>

                {/* Social / App Links */}
                {mode === 'register' && role === 'passenger' && (
                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-500 mb-3">Or sign up faster with the app</p>
                        <div className="flex gap-2 justify-center">
                            <a
                                href={APP_LINKS.passenger.appStore}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-white/10"
                            >
                                <FaApple /> App Store
                            </a>
                            <a
                                href={APP_LINKS.passenger.playStore}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-white/10"
                            >
                                <FaGoogle /> Play Store
                            </a>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
