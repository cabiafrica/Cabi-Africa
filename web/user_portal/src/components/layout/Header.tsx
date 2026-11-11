import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import BrandLogo from '../ui/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import {
    ChevronDown,
    Menu,
    X,
    Info,
    MessageSquare,
    Home,
    Layers,
    LogOut,
    UserPlus,
    LogIn,
    UserCircle2,
    Settings,
    Car,
    Users,
    Building2,
} from 'lucide-react';

export const GlobalHeaderContext = createContext<boolean>(false);

interface HeaderProps {
    isGlobalRoot?: boolean;
}

export default function Header({ isGlobalRoot = false }: HeaderProps) {
    const isAlreadyRenderedGlobally = useContext(GlobalHeaderContext);
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close mobile menu and profile menu automatically on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [router.asPath]);

    // Close profile dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsProfileOpen(false);
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (!isMenuOpen) {
            document.body.style.overflow = '';
            return;
        }
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Prevent duplicate headers if rendered both globally in _app.tsx and locally in MainLayout/pages
    if (isAlreadyRenderedGlobally && !isGlobalRoot) {
        return null;
    }

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Intel', href: '/blog', icon: MessageSquare },
        { name: 'About Us', href: '/about', icon: Info },
    ];

    const isActiveRoute = (href: string) => {
        if (href === '/') return router.pathname === '/';
        return router.pathname === href || router.pathname.startsWith(`${href}/`);
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full bg-white/90 dark:bg-brand-black/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 z-[100] transition-colors duration-300">
                <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl" aria-label="Global Navigation">
                    <div className="flex justify-between h-16 md:h-20 items-center gap-4">
                        {/* Left: Brand Logo */}
                        <div className="flex-shrink-0 flex items-center group">
                            <Link href="/" className="flex items-center focus:outline-none transition-transform duration-300 group-hover:scale-[1.03]">
                                <BrandLogo size="header" />
                            </Link>
                        </div>

                        {/* Center: 3 Main Menu Items (Home, Intel, About Us) */}
                        <div className="hidden md:flex flex-1 justify-center items-center gap-10">
                            {navLinks.map((link) => {
                                const active = isActiveRoute(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`text-xs font-extrabold transition-colors duration-200 relative group uppercase tracking-widest py-2 whitespace-nowrap ${
                                            active
                                                ? 'text-amber-600 dark:text-brand-yellow'
                                                : 'text-slate-700 hover:text-slate-950 dark:text-white/80 dark:hover:text-white'
                                        }`}
                                    >
                                        {link.name}
                                        <span
                                            className={`absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow transition-transform duration-300 origin-left ${
                                                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right: Theme Toggle, Avatar Profile Menu & Mobile Hamburger */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <ThemeToggle />

                            {/* Top-Right Avatar & Profile Dropdown Menu (Visible on both Desktop & Mobile) */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsProfileOpen(!isProfileOpen);
                                        if (!isProfileOpen) setIsMenuOpen(false);
                                    }}
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="true"
                                    aria-label="Open profile menu"
                                    suppressHydrationWarning
                                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border transition-all duration-200 ${
                                        isProfileOpen
                                            ? 'border-brand-yellow bg-brand-yellow/15 text-slate-900 dark:text-white shadow-md'
                                            : 'border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-white/5 hover:border-brand-yellow/60 text-slate-800 dark:text-white'
                                    }`}
                                >
                                    {mounted && isAuthenticated ? (
                                        <>
                                            <img
                                                className="h-8 w-8 rounded-full object-cover border border-brand-yellow"
                                                src={
                                                    user?.profilePictureUrl ||
                                                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                                                }
                                                alt="User Avatar"
                                            />
                                            <span className="hidden sm:block text-xs font-bold max-w-[90px] truncate">
                                                {user?.firstName || 'Account'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-8 w-8 rounded-full bg-brand-yellow/20 dark:bg-brand-yellow/15 border border-brand-yellow/50 flex items-center justify-center text-amber-600 dark:text-brand-yellow">
                                                <UserCircle2 className="h-5 w-5" />
                                            </div>
                                            <span className="hidden sm:block text-xs font-bold">Account</span>
                                        </>
                                    )}
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 text-slate-500 dark:text-white/60 transition-transform duration-200 ${
                                            isProfileOpen ? 'rotate-180 text-amber-600 dark:text-brand-yellow' : ''
                                        }`}
                                    />
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/15 shadow-2xl py-2 z-[120] backdrop-blur-xl">
                                        {mounted && isAuthenticated ? (
                                            <>
                                                {/* Signed-in User Header */}
                                                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                        {user?.firstName} {user?.lastName}
                                                    </p>
                                                    <p className="text-xs font-medium text-amber-600 dark:text-brand-yellow truncate">
                                                        {user?.email}
                                                    </p>
                                                </div>

                                                <div className="p-1.5 space-y-1">
                                                    <Link
                                                        href="/dashboard"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-white/85 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <Layers className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/drivers/dashboard"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-white/85 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <Car className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                        Driver Portal
                                                    </Link>
                                                    <Link
                                                        href="/settings/profile"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-white/85 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <Settings className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                        Profile Settings
                                                    </Link>
                                                </div>

                                                <div className="p-1.5 border-t border-slate-100 dark:border-white/10">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                            logout();
                                                        }}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Guest Header */}
                                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-brand-yellow">
                                                        Profile &amp; Access
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                                                        Sign in or create your CABI account
                                                    </p>
                                                </div>

                                                {/* Primary Auth Actions */}
                                                <div className="p-2 space-y-1.5">
                                                    <Link
                                                        href="/login"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-brand-yellow text-black text-xs font-black uppercase tracking-wider shadow-sm hover:bg-primary-highlight transition-colors"
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <LogIn className="h-4 w-4" />
                                                            Login
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded bg-black/15 text-[10px] font-mono">VIP</span>
                                                    </Link>
                                                    <Link
                                                        href="/register"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <UserPlus className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                            Sign Up
                                                        </span>
                                                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Instant</span>
                                                    </Link>
                                                </div>

                                                {/* Quick Portal & Registration Links */}
                                                <div className="p-1.5 border-t border-slate-100 dark:border-white/10 space-y-0.5">
                                                    <Link
                                                        href="/drivers/register"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <Car className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                        Driver Registration
                                                    </Link>
                                                    <Link
                                                        href="/drivers/group-register"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <Users className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                        Group Registration
                                                    </Link>
                                                    <Link
                                                        href="/corporate/login"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <Building2 className="h-4 w-4 text-amber-500 dark:text-brand-yellow" />
                                                        Corporate Login
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Hamburger Button (Visible below md) */}
                            <button
                                onClick={() => {
                                    setIsMenuOpen(!isMenuOpen);
                                    if (!isMenuOpen) setIsProfileOpen(false);
                                }}
                                type="button"
                                className={`md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-all duration-200 ${
                                    isMenuOpen
                                        ? 'bg-brand-yellow text-black border-brand-yellow shadow-md'
                                        : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:border-white/15 dark:hover:bg-white/20'
                                }`}
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                                aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
                                suppressHydrationWarning
                            >
                                {isMenuOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile Drawer Overlay & Menu */}
                {isMenuOpen && (
                    <>
                        {/* Tap-outside Backdrop */}
                        <div
                            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm md:hidden z-[100]"
                            onClick={() => setIsMenuOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Scrollable Mobile Drawer */}
                        <div
                            id="mobile-menu"
                            className="md:hidden relative z-[101] mx-3 sm:mx-6 mt-2 mb-4 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/15 shadow-2xl p-5 sm:p-6 space-y-5"
                        >
                            {/* 3 Main Menu Items */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-brand-yellow">
                                        Main Menu
                                    </p>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10 ml-3" />
                                </div>
                                <div className="space-y-1.5">
                                    {navLinks.map((link) => {
                                        const Icon = link.icon;
                                        const active = isActiveRoute(link.href);
                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-black transition-all ${
                                                    active
                                                        ? 'bg-brand-yellow text-black shadow-sm'
                                                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Icon
                                                        className={`h-5 w-5 ${
                                                            active
                                                                ? 'text-black'
                                                                : 'text-amber-500 dark:text-brand-yellow'
                                                        }`}
                                                    />
                                                    {link.name}
                                                </span>
                                                <ChevronDown className="h-4 w-4 -rotate-90 opacity-60" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </header>
        </>
    );
}
