import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '../ThemeToggle';
// import { useLogout } from '@/hooks/useLogout'; // handled by useAuth
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'Safety', href: '/safety' },
        { name: 'Intel', href: '/blog' },
        // { name: 'For Passengers', href: '/passengers' }, // Hidden until passenger page is ready
        { name: 'About Us', href: '/about' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Contact Us', href: '/contact' },
    ];

    const registrationLinks = [
        { name: 'Individual Registration', href: '/drivers/register', icon: 'user' },
        { name: 'Group Registration', href: '/drivers/group-register', icon: 'users' },
    ];

    return (
        <header className="fixed top-0 w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <img src="/logo.png" alt="CABI Logo" className="h-10 w-auto" />
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>



                    {/* User Profile / Auth Section */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        <ThemeToggle />
                        {/* Real Auth State */}
                        {isAuthenticated ? (
                            <div className="relative ml-3 flex items-center space-x-3">
                                {/* Avatar Link: Directly to Dashboard as requested */}
                                <Link
                                    href="/dashboard"
                                    className="block flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full transition-transform hover:scale-110 duration-200"
                                    title="Go to Dashboard"
                                >
                                    <img
                                        className="h-10 w-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm cursor-pointer"
                                        src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                        alt="User Avatar"
                                    />
                                </Link>

                                {/* Dropdown Toggle */}
                                <button
                                    type="button"
                                    className="flex items-center text-sm focus:outline-none group"
                                    id="user-menu-button"
                                    aria-expanded={isMenuOpen}
                                    aria-haspopup="true"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    <span className="ml-1 hidden md:block font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Hi {user?.firstName || 'User'}</span>
                                    <svg className={`ml-1 h-4 w-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown */}
                                {isMenuOpen && (
                                    <>
                                        {/* Overlay to close menu on click outside */}
                                        <div
                                            className="fixed inset-0 z-50 cursor-default"
                                            onClick={() => setIsMenuOpen(false)}
                                        ></div>
                                        <div
                                            className="origin-top-right absolute right-0 mt-2 top-full w-48 rounded-xl shadow-xl py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                                            role="menu"
                                            aria-orientation="vertical"
                                            aria-labelledby="user-menu-button"
                                            tabIndex={-1}
                                        >
                                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">User Account</p>
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                role="menuitem"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/settings/profile"
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                role="menuitem"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </Link>
                                            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                            <button
                                                className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                role="menuitem"
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    logout();
                                                }}
                                            >
                                                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Log out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    {/* Mobile Profile Section */}
                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <img
                                    className="h-10 w-10 rounded-full border-2 border-indigo-500"
                                    src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                    alt="User Avatar"
                                />
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800 dark:text-white">{user?.firstName} {user?.lastName}</div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/settings/profile"
                                className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Profile
                            </Link>
                            <button
                                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    logout();
                                }}
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
