import Link from 'next/link';
import { FaDownload } from 'react-icons/fa';
import { Globe, Smartphone } from 'lucide-react';
import SocialLinks from '@/components/ui/SocialLinks';
import BrandLogo from '@/components/ui/BrandLogo';
import { ThemeToggle } from '../ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
    const { language, setLanguage } = useLanguage();
    return (
        <footer className="bg-neutral-50 dark:bg-surface-dark border-t border-neutral-200 dark:border-white/10 py-14 mt-auto relative transition-colors duration-300">
            {/* Brand Yellow Gradient Top Border */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                    {/* Official Apps Column (All Directs to /download) */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                            Official Apps
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/download"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
                                >
                                    <FaDownload className="text-xs" />
                                    Download App Page &rarr;
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/download#passenger"
                                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    CABI Go (Passenger Edition)
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/download#driver"
                                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    CABI Drive (Driver Edition)
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/download#guide"
                                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    Android &amp; iOS Setup Guide
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
