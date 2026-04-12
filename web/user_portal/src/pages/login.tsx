import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Perform login via context (handles storage and redirect)
            login(data.token, data.user);

            console.log('Login successful:', data);
        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-black relative overflow-hidden font-sans">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-brand-black to-black"></div>
                {/* Yellow Ambient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] opacity-60"></div>
            </div>

            {/* Glass Card */}
            <div className="relative z-10 w-full max-w-md p-8 m-4">
                {/* Card Background with Golden/Yellow Tint Border */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"></div>

                {/* Glow Border Effect (Golden) */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-yellow/40 to-yellow-600/40 rounded-2xl opacity-30 blur-sm group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative p-8">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative w-28 h-28 rounded-full border border-brand-yellow/30 flex items-center justify-center bg-black/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] mb-4">
                            <div className="w-24 h-24 rounded-full border border-brand-yellow/20 flex items-center justify-center overflow-hidden p-3 bg-black">
                                <img
                                    src="/logo.png"
                                    alt="Cabi Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        // Fallback if image fails
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.innerHTML = '<span class="text-3xl font-black text-brand-yellow tracking-tighter">Cabi</span>';
                                    }}
                                />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h2>
                        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Driver & Passenger Portal</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        {/* Username/Email Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-brand-yellow transition-colors duration-300" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="text"
                                autoComplete="email"
                                required
                                className="block w-full pl-12 pr-4 py-3.5 border border-white/5 rounded-xl bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 transition-all duration-300"
                                placeholder="Email or Phone Number"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-brand-yellow transition-colors duration-300" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="block w-full pl-12 pr-12 py-3.5 border border-white/5 rounded-xl bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 transition-all duration-300 tracking-widest"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-brand-yellow transition-colors duration-300 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-600 text-brand-yellow focus:ring-brand-yellow bg-black/50"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-400 select-none cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <Link href="/forgot-password" className="font-medium text-brand-yellow hover:text-yellow-400 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-yellow/20 text-sm font-bold text-black uppercase tracking-wider bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow focus:ring-offset-black transition-all duration-300 transform hover:-translate-y-0.5 mt-4 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" />
                            ) : null}
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-brand-yellow hover:text-white transition-colors uppercase tracking-wide">
                                Register Here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Copyright */}
            <div className="absolute bottom-6 w-full text-center">
                <p className="text-gray-600 text-xs tracking-wide">© 2024 Cabi Africa. All rights reserved.</p>
            </div>
        </div>
    );
}
