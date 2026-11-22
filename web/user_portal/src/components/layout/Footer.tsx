import Link from 'next/link';
import { FaDownload, FaMobileAlt, FaCarSide, FaCheckCircle, FaShieldAlt, FaAndroid, FaApple } from 'react-icons/fa';
import { Globe } from 'lucide-react';
import SocialLinks from '@/components/ui/SocialLinks';
import BrandLogo from '@/components/ui/BrandLogo';
import { ThemeToggle } from '../ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';
import { APP_LINKS } from '@/config/appLinks';

export default function Footer() {
    const { language, setLanguage } = useLanguage();
    return (
        <footer id="footer-download-menu" className="bg-neutral-50 dark:bg-surface-dark border-t border-neutral-200 dark:border-white/10 py-14 mt-auto relative transition-colors duration-300">
            {/* Brand Yellow Gradient Top Border */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Dedicated Footer App Download Menu (Direct Device Installers) */}
                <div className="mb-12 rounded-2xl bg-slate-900 dark:bg-black/80 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-3">
                                <FaShieldAlt className="text-amber-400 text-xs" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                    Official Direct App Market • Full Production Release
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Download CABI Africa to Your Phone
                            </h3>
                            <p className="mt-1.5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                                Select your edition below. Android downloads the full <code className="text-amber-400 font-semibold">.apk</code> directly into your phone&apos;s <strong>Downloads</strong> folder; iPhone/iPad opens the full iOS App (tap <strong>Share → Add to Home Screen</strong> in Safari)—no store redirects, no trial limits.
                            </p>
                        </div>

                        {/* Separate Market Download Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto lg:min-w-[520px]">
                            {/* Option 1: CABI Go (Passenger App) */}
                            <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-amber-400 via-[#D4AF37] to-amber-600 text-black p-4 shadow-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="p-2.5 rounded-lg bg-black/10 text-black">
                                        <FaMobileAlt className="text-xl" />
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/15 text-black">
                                        <FaCheckCircle className="text-[9px]" /> Full Version
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                                        Passenger Edition • v1.1.0
                                    </div>
                                    <div className="text-base font-black leading-snug mt-0.5">
                                        CABI Go App
                                    </div>
                                    <div className="mt-3 flex flex-col gap-2">
                                        <a
                                            href={APP_LINKS.passenger.apkDirect}
                                            download={APP_LINKS.passenger.fileName}
                                            className="flex items-center justify-between gap-2 rounded-lg bg-black text-amber-400 px-3 py-2 text-xs font-extrabold hover:bg-neutral-900 transition-colors"
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                <FaAndroid className="text-sm text-emerald-400" />
                                                Android (.apk)
                                            </span>
                                            <FaDownload className="text-[11px]" />
                                        </a>
                                        <a
                                            href={APP_LINKS.passenger.iosWebApp}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between gap-2 rounded-lg bg-black/15 hover:bg-black/25 text-black px-3 py-2 text-xs font-extrabold transition-colors"
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                <FaApple className="text-sm" />
                                                iOS (iPhone / iPad)
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider opacity-85">Install</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: CABI Drive (Driver App) */}
                            <div className="flex flex-col justify-between rounded-xl bg-white/5 text-white border border-amber-500/40 p-4 shadow-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400">
                                        <FaCarSide className="text-xl" />
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        <FaCheckCircle className="text-[9px]" /> Full Version
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                                        Driver Partner Edition • v1.1.0
                                    </div>
                                    <div className="text-base font-black leading-snug mt-0.5">
                                        CABI Drive App
                                    </div>
                                    <div className="mt-3 flex flex-col gap-2">
                                        <a
                                            href={APP_LINKS.driver.apkDirect}
                                            download={APP_LINKS.driver.fileName}
                                            className="flex items-center justify-between gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 text-xs font-extrabold transition-colors"
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                <FaAndroid className="text-sm" />
                                                Android (.apk)
                                            </span>
                                            <FaDownload className="text-[11px]" />
                                        </a>
                                        <a
                                            href={APP_LINKS.driver.iosWebApp}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between gap-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3 py-2 text-xs font-extrabold transition-colors"
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                <FaApple className="text-sm" />
                                                iOS (iPhone / iPad)
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider text-amber-400">Install</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center focus:outline-none hover:opacity-90 transition-opacity">
                            <BrandLogo size="footer" />
                        </Link>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
                            Executive African Mobility. Decentralized dispatch, fair operator revenues, and reliable diplomatic &amp; executive passenger transit.
                        </p>
                        <SocialLinks variant="footer" />
                    </div>

                    {/* Direct Download Menu Column */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Download Menu
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href={APP_LINKS.passenger.apkDirect}
                                    download={APP_LINKS.passenger.fileName}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    <FaDownload className="text-xs text-amber-500" />
                                    CABI Go (Passenger APK)
                                </a>
                            </li>
                            <li>
                                <a
                                    href={APP_LINKS.driver.apkDirect}
                                    download={APP_LINKS.driver.fileName}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    <FaDownload className="text-xs text-amber-500" />
                                    CABI Drive (Driver APK)
                                </a>
                            </li>
                            <li>
                                <a
                                    href={APP_LINKS.passenger.iosWebApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    <FaApple className="text-xs text-amber-500" />
                                    CABI Go (iOS App)
                                </a>
                            </li>
                            <li>
                                <a
                                    href={APP_LINKS.driver.iosWebApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    <FaApple className="text-xs text-amber-500" />
                                    CABI Drive (iOS App)
                                </a>
                            </li>
                            <li>
                                <Link href="/download" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    All Releases &amp; Install Guide
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Mobility Ecosystem */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-executive-gold" />
                            Mobility Ecosystem
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/#booking-section" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Book a Ride
                                </Link>
                            </li>
                            <li>
                                <Link href="/#fleet" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Our Fleet Tiers
                                </Link>
                            </li>
                            <li>
                                <Link href="/download" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Get the Mobile Apps
                                </Link>
                            </li>
                            <li>
                                <Link href="/drivers/register" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Become a Driver
                                </Link>
                            </li>
                            <li>
                                <Link href="/why-drive" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Why Drive with CABI
                                </Link>
                            </li>
                            <li>
                                <Link href="/referral-details" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Referral Program
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Navigation */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Company &amp; Portals
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Intel
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/passengers" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    For Passengers
                                </Link>
                            </li>
                            <li>
                                <Link href="/drivers" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    For Drivers
                                </Link>
                            </li>
                            <li>
                                <Link href="/fleet/dashboard" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Fleet Portal
                                </Link>
                            </li>
                            <li>
                                <Link href="/corporate/dashboard" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Corporate Travel
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support, Legal & Policies */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Support &amp; Legal
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/safety" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Safety Standards
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sub-Footer Copyright & Executive Preferences */}
                <div className="mt-12 border-t border-neutral-200 dark:border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
                    <p className="text-center sm:text-left">
                        &copy; {new Date().getFullYear()} CABI Africa Technologies Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3 pr-24">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-200/60 dark:bg-white/5 border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 shadow-sm">
                            <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <select
                                aria-label="Select Language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'en' | 'sw' | 'fr' | 'ar')}
                                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-neutral-800 dark:text-neutral-200"
                            >
                                <option value="en" className="text-black bg-white">English (EN)</option>
                                <option value="sw" className="text-black bg-white">Kiswahili (SW)</option>
                                <option value="fr" className="text-black bg-white">Français (FR)</option>
                                <option value="ar" className="text-black bg-white">العربية (AR)</option>
                            </select>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </footer>
    );
}
