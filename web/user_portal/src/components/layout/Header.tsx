import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '../ThemeToggle';
// import { useLogout } from '@/hooks/useLogout'; // handled by useAuth
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout, hasPermission } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const baseNavLinks = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'Safety', href: '/safety' },
        { name: 'Intel', href: '/blog' },
        { name: 'About Us', href: '/about' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Contact Us', href: '/contact' },
    ];

    const navLinks = [
        ...baseNavLinks,
        ...(hasPermission('DRIVER_PROFILE_EDIT') ? [{ name: 'For Drivers', href: '/drivers/dashboard' }] : []),
        ...(hasPermission('ORGANIZATION_VIEW') ? [{ name: 'Organization', href: '/organizations/dashboard' }] : []),
    ];

    const registrationLinks = [
        { name: 'Individual Registration', href: '/drivers/register', icon: 'user' },
        { name: 'Group Registration', href: '/drivers/group-register', icon: 'users' },
    ];

    return (
        <header className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl glass-premium z-[100] transition-all duration-700 animate-reveal ${isMenuOpen ? 'rounded-[2rem]' : 'rounded-full'}`}>
            <nav className="mx-auto px-6 sm:px-8">
                <div className="flex justify-between h-16 md:h-18 items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0 flex items-center group">
                            <Link href="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="CABI Logo" className="h-7 md:h-9 w-auto brightness-0 invert group-hover:scale-110 transition-transform duration-500" />
                                <span className="text-lg md:text-xl font-extrabold tracking-tighter text-white group-hover:text-brand-yellow transition-colors duration-500">CABI</span>
                            </Link>
                        </div>
                        <div className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300 relative group"
                                >
                                    {link.name}
                                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <ThemeToggle />
                        
                        {isAuthenticated ? (
                            <div className="relative flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="block flex-shrink-0 focus:outline-none rounded-full transition-all hover:scale-110 active:scale-95 duration-500 relative group"
                                    title="Go to Dashboard"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-brand-yellow to-brand-accent rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                                    <img
                                        className="relative h-9 w-9 rounded-full object-cover border-2 border-white/20 group-hover:border-brand-yellow cursor-pointer shadow-lg"
                                        src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                        alt="User Avatar"
                                    />
                                </Link>

                                <button
                                    type="button"
                                    className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-all duration-500"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    <span className="max-w-[80px] truncate">Hi {user?.firstName || 'User'}</span>
                                    <svg className={`h-4 w-4 text-brand-yellow/70 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="relative py-2.5 px-8 rounded-full font-black text-sm uppercase tracking-wider text-white overflow-hidden group transition-all duration-500 active:scale-95"
                            >
                                <span className="absolute inset-0 bg-brand-yellow transition-transform duration-500 group-hover:scale-110" />
                                <span className="absolute inset-0 bg-gradient-to-tr from-brand-yellow to-brand-accent mix-blend-overlay" />
                                <span className="relative text-black z-10">Login</span>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </Link>
                        )}
                    </div>

                    <div className="flex lg:hidden items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="lg:hidden animate-reveal p-6 space-y-8 bg-brand-black/95 backdrop-blur-2xl rounded-[2.5rem] mt-4 border border-white/10 shadow-2xl overflow-hidden relative" id="mobile-menu">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 blur-3xl rounded-full" />
                    
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 px-4">Navigation Network</p>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-4 py-3 text-lg font-black text-white/60 hover:text-brand-yellow hover:bg-white/5 rounded-2xl transition-all duration-300 tracking-tighter"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="pt-8 border-t border-white/5">
                        {isAuthenticated ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-4">
                                    <img
                                        className="h-12 w-12 rounded-2xl border-2 border-brand-yellow shadow-lg object-cover"
                                        src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                        alt="User Avatar"
                                    />
                                    <div>
                                        <div className="text-lg font-black text-white tracking-tight">{user?.firstName} {user?.lastName}</div>
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Link
                                        href="/dashboard"
                                        className="block px-6 py-4 rounded-2xl bg-white/5 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Control Center
                                    </Link>
                                    <button
                                        className="block w-full px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-500/20 transition-all"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            logout();
                                        }}
                                    >
                                        Terminate Session
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4">
                                <Link
                                    href="/login"
                                    className="block w-full py-5 rounded-2xl bg-brand-yellow text-black font-black text-sm uppercase tracking-[0.2em] text-center shadow-[0_20px_40px_-10px_rgba(250,204,21,0.3)] hover:scale-[1.02] transition-all"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login to Network
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
