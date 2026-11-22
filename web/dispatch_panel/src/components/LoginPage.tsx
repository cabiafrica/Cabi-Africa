import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';

export const LoginPage = () => {
    const [email, setEmail] = useState('dispatcher@cabi.africa');
    const [password, setPassword] = useState('Password123!');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const BACKEND_URL = (import.meta as any).env.VITE_AUTH_API_URL 
                || (import.meta as any).env.VITE_API_URL 
                || (import.meta as any).env.VITE_API_BASE_URL 
                || 'https://api.cabi.africa/api';
            
            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                email,
                password
            });

            if (response.data && (response.data.token || response.data.accessToken)) {
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
                if (typeof window !== 'undefined' && window.location.pathname === '/login') {
                    window.history.replaceState(null, '', '/');
                }
            } else {
                alert('Invalid response from server');
            }

        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
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
                    <p className="text-gray-400">Sign in to access control center</p>
                </div>

                <div className="bg-card-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-brand-black/60 border border-white/15 rounded-xl focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow text-white placeholder-gray-500 transition-all outline-none"
                                placeholder="operator@cabi.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-brand-black/60 border border-white/15 rounded-xl focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow text-white placeholder-gray-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors duration-300 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold rounded-xl shadow-lg shadow-brand-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
