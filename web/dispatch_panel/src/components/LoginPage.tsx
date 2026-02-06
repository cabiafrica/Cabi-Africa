import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Mock login for Dispatch Panel for now, or connect to real API if available.
            // Since Dispatch might not have a dedicated public API endpoint ready in this context,
            // we will simulate a successful login or use the same endpoint as user_portal if applicable.

            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real scenario: const res = await fetch('/api/auth/login', ...);

            // For now, accept any credentials to allow "preview" but enforce the "Log in" step.
            if (email && password) {
                const mockUser = {
                    id: 'dispatch-admin-01',
                    email: email,
                    firstName: 'Dispatch',
                    lastName: 'Operator',
                    role: 'dispatcher',
                    profilePictureUrl: 'https://ui-avatars.com/api/?name=Dispatch+Operator&background=0D8ABC&color=fff',
                    permissions: ['*']
                };
                login('mock-jwt-token-dispatch', mockUser);
            } else {
                alert('Please enter email and password');
            }

        } catch (error) {
            console.error(error);
            alert('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Dispatch Console</h1>
                    <p className="text-slate-400">Sign in to access control center</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all outline-none"
                                placeholder="operator@cabi.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};
