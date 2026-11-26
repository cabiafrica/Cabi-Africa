import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
    ShieldCheck,
    Lock,
    Mail,
    Smartphone,
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2
} from 'lucide-react';

interface ChallengeResponse {
    requiresVerification: boolean;
    requiresOnboarding?: boolean;
    isTemporaryPassword?: boolean;
    challengeToken: string;
    maskedEmail?: string;
    maskedPhone?: string;
    channels?: string[];
    expiresInSeconds?: number;
    devOtpPreview?: string;
}

export const LoginPage = () => {
    const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
    const [email, setEmail] = useState('dispatcher@cabi.africa');
    const [password, setPassword] = useState('Password123!');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);
    const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);

    const { login } = useAuth();

    useEffect(() => {
        try {
            const reason = localStorage.getItem('cabi_logout_reason');
            const searchParams = new URLSearchParams(window.location.search);
            if (reason === 'inactivity' || searchParams.get('reason') === 'inactivity') {
                setInactivityNotice('Your dispatch session was securely closed due to 10 minutes of inactivity. Please re-authenticate to continue.');
                localStorage.removeItem('cabi_logout_reason');
            }
        } catch (e) {
            // Ignore storage errors
        }
    }, []);

    const getBackendUrl = () => {
        return (import.meta as any).env?.VITE_AUTH_API_URL || 'https://api.cabi.africa/api';
    };

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResendSuccess(null);

        try {
            const BACKEND_URL = getBackendUrl();

            // Initiate admin/dispatch challenge with email + password
            const response = await axios.post(`${BACKEND_URL}/auth/admin/initiate-login`, {
                email,
                password
            });

            if (response.data && response.data.challengeToken) {
                setChallenge(response.data);
                setStep('verification');
            } else if (response.data && (response.data.token || response.data.accessToken)) {
                // Direct login fallback if no challenge required
                const token = response.data.token || response.data.accessToken;
                const user = response.data.user;
                login(token, {
                    id: user.id,
                    email: user.email,
                    firstName: user.fullName?.split(' ')[0] || 'User',
                    lastName: user.fullName?.split(' ')[1] || '',
                    role: user.role,
                    profilePictureUrl: user.profilePhotoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName),
                    permissions: user.permissions || []
                });
            } else {
                setError('Unexpected response from server. Please try again.');
            }
        } catch (err: any) {
            console.error('Credentials login error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Invalid operational credentials or unauthorized access.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!challenge?.challengeToken) {
            setError('Verification challenge expired. Please restart sign in.');
            setStep('credentials');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResendSuccess(null);

        try {
            const BACKEND_URL = getBackendUrl();

            const response = await axios.post(`${BACKEND_URL}/auth/admin/verify-identity`, {
                challengeToken: challenge.challengeToken,
                otpCode: otpCode.trim()
            });

            const data = response.data;
            if (data && data.token) {
                const user = data.user;
                login(data.token, {
                    id: user.id,
                    email: user.email || email,
                    firstName: user.fullName?.split(' ')[0] || 'Dispatcher',
                    lastName: user.fullName?.split(' ')[1] || '',
                    role: user.role,
                    profilePictureUrl: user.profilePhotoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || 'Dispatcher'),
                    permissions: user.permissions || []
                });
            } else {
                setError('Verification succeeded but session token was not returned.');
            }
        } catch (err: any) {
            console.error('OTP verification error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Invalid or expired 6-digit verification PIN.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!challenge?.challengeToken) return;
        setResending(true);
        setError(null);
        setResendSuccess(null);

        try {
            const BACKEND_URL = getBackendUrl();
            const response = await axios.post(`${BACKEND_URL}/auth/admin/resend-otp`, {
                challengeToken: challenge.challengeToken
            });
            setChallenge(response.data);
            setResendSuccess('A new 6-digit PIN has been dispatched to your Email & Phone (SMS).');
        } catch (err: any) {
            console.error('Resend OTP error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-black text-white selection:bg-brand-yellow selection:text-black">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-yellow/10 blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-executive-gold/10 blur-[100px]" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <img
                        src="/cabi-logo-dark.png"
                        alt="Cabi Africa"
                        className="h-14 w-auto mx-auto mb-5 object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
                    />
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Dispatch Console</h1>
                    <p className="text-gray-400">
                        {step === 'credentials'
                            ? 'Sign in to access control center'
                            : 'Dual-channel identity verification required'}
                    </p>
                </div>

                <div className="bg-card-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                    {inactivityNotice && (
                        <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3 text-amber-300 text-sm animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                            <span>{inactivityNotice}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3 text-red-400 text-sm animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3 text-emerald-400 text-sm animate-fade-in">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{resendSuccess}</span>
                        </div>
                    )}

                    {step === 'credentials' ? (
                        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                    Operator / Dispatcher Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-brand-black/60 border border-white/15 rounded-xl focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow text-white placeholder-gray-500 transition-all outline-none"
                                    placeholder="operator@cabi.africa"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-brand-black/60 border border-white/15 rounded-xl focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow text-white placeholder-gray-500 transition-all outline-none pr-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors duration-300 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold rounded-xl shadow-lg shadow-brand-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        <span>Sign In & Verify</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifySubmit} className="space-y-5">
                            <div className="flex items-center space-x-3 pb-2 border-b border-white/10">
                                <div className="p-2.5 bg-brand-yellow/15 text-brand-yellow rounded-xl border border-brand-yellow/30">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Two-Factor Authentication</h2>
                                    <p className="text-xs text-gray-400">Security challenge required for operational access</p>
                                </div>
                            </div>

                            <div className="space-y-2 bg-brand-black/50 p-3.5 rounded-xl border border-white/5 text-xs text-gray-300">
                                <p className="font-semibold text-gray-200">A 6-digit PIN has been dispatched to:</p>
                                <div className="flex items-center space-x-2 text-brand-yellow font-medium">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span>{challenge?.maskedEmail || email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-executive-gold font-medium">
                                    <Smartphone className="w-4 h-4 flex-shrink-0" />
                                    <span>{challenge?.maskedPhone || 'Registered Mobile Phone (SMS)'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5 text-center">
                                    Enter 6-Digit PIN
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 px-4 bg-brand-black/80 border border-brand-yellow/40 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow text-white placeholder-gray-600 outline-none transition-all"
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otpCode.length !== 6}
                                className="w-full py-3 px-4 bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold rounded-xl shadow-lg shadow-brand-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Verifying PIN...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        <span>Verify & Launch Console</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-between pt-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('credentials');
                                        setOtpCode('');
                                        setError(null);
                                        setResendSuccess(null);
                                    }}
                                    className="text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Change account</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={resending}
                                    onClick={handleResendOtp}
                                    className="text-brand-yellow hover:underline disabled:opacity-50 flex items-center space-x-1"
                                >
                                    {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Resend Code</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        Institutional Grade Security • Cabi Africa Dispatch Network
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
