import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Menu, X, Rocket, ShieldCheck, Info, MessageSquare, HelpCircle, Phone, Home, Layers, Settings, LogOut } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { isAuthenticated, user, logout, hasPermission } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

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

    const navLinks = mounted ? [
        ...baseNavLinks,
        ...(hasPermission('DRIVER_PROFILE_EDIT') ? [{ name: 'For Drivers', href: '/drivers/dashboard' }] : []),
        ...(hasPermission('ORGANIZATION_VIEW') ? [{ name: 'Organization', href: '/organizations/dashboard' }] : []),
    ] : baseNavLinks;

    const registrationLinks = [
        { name: 'Individual Registration', href: '/drivers/register', icon: 'user' },
        { name: 'Group Registration', href: '/drivers/group-register', icon: 'users' },
    ];

    return (
        <header className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl glass-premium z-[100] transition-all duration-700 animate-reveal ${isMenuOpen ? 'rounded-[2rem]' : 'rounded-full'}`}>
            <nav className="mx-auto px-6 sm:px-8">
                <div className="flex justify-between h-16 md:h-20 items-center gap-2">
                    <div className="flex items-center gap-2 md:gap-8">
                        <div className="flex-shrink-0 flex items-center group">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="p-1.5 bg-brand-yellow rounded-xl group-hover:rotate-12 transition-transform duration-500">
                                    <img src="/logo.png" alt="CABI Logo" className="h-5 md:h-7 w-auto brightness-0" />
                                </div>
                                <span className="text-lg md:text-2xl font-black tracking-tighter text-white group-hover:text-brand-yellow transition-colors duration-500">CABI</span>
                            </Link>
                        </div>
                        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 relative group"
                                >
                                    {link.name}
                                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">
                        <div className="hidden md:flex items-center space-x-6">
                            {mounted ? <ThemeToggle /> : <div className="w-9 h-9" />}
                            
                            {mounted ? (isAuthenticated ? (
                                <div className="relative flex items-center gap-4">
                                    <Link
                                        href="/dashboard"
                                        className="block flex-shrink-0 focus:outline-none rounded-full transition-all hover:scale-110 active:scale-95 duration-500 relative group"
                                        title="Go to Dashboard"
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-brand-yellow to-brand-accent rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                                        <img
                                            className="relative h-9 w-9 rounded-full object-cover border-2 border-white/20 group-hover:border-brand-yellow cursor-pointer shadow-lg"
                                            src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                            alt="User Avatar"
                                        />
                                    </Link>

                                    <button
                                        type="button"
                                        className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-all duration-500"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    >
                                        <span className="max-w-[80px] truncate">Hi {user?.firstName}</span>
                                        {mounted && <ChevronDown className={`h-4 w-4 text-brand-yellow/70 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />}
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
                                </Link>
                            )) : <div className="w-[105px] h-[44px]"></div>}
                        </div>

                        <div className="flex lg:hidden items-center gap-2">
                            {mounted ? <ThemeToggle /> : <div className="w-9 h-9" />}
                            <button
                                onClick={toggleMenu}
                                type="button"
                                className={`inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-500 ${isMenuOpen ? 'bg-brand-yellow text-black rotate-90' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'}`}
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {mounted && (isMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                ))}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="lg:hidden animate-reveal p-6 space-y-8 bg-brand-black/98 backdrop-blur-3xl rounded-[2.5rem] mt-4 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative z-[101]" id="mobile-menu">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-center justify-between px-4 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow">Menu</p>
                            <div className="h-px flex-1 bg-white/10 ml-4" />
                        </div>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="flex items-center justify-between px-4 py-4 text-xl font-black text-white hover:text-brand-yellow hover:bg-white/5 rounded-2xl transition-all duration-300 tracking-tighter group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span>{link.name}</span>
                                {mounted && <ChevronDown className="h-5 w-5 -rotate-90 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0" />}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="pt-8 border-t border-white/10 relative z-10">
                        {isAuthenticated ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-4">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-brand-yellow to-brand-accent rounded-2xl opacity-50 blur-sm group-hover:opacity-100 transition-opacity" />
                                        <img
                                            className="relative h-14 w-14 rounded-2xl border-2 border-white/20 shadow-xl object-cover"
                                            src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                            alt="User Avatar"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-white tracking-tight">{user?.firstName} {user?.lastName}</div>
                                        <div className="text-xs font-bold text-brand-yellow uppercase tracking-widest">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {mounted && <Layers className="h-4 w-4" />}
                                        Control Center
                                    </Link>
                                    <button
                                        className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/10"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            logout();
                                        }}
                                    >
                                        {mounted && <LogOut className="h-4 w-4" />}
                                        Terminate Session
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="px-2">
                                <Link
                                    href="/login"
                                    className="relative flex items-center justify-center w-full py-5 rounded-2xl bg-brand-yellow text-black font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(250,204,21,0.4)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Login to Network
                                        {mounted && <Rocket className="h-4 w-4" />}
                                    </span>
                                </Link>
                                <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-6">Secure Access Required</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
