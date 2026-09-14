import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-neutral-50 dark:bg-black border-t border-neutral-200 dark:border-neutral-900 py-14 mt-auto relative transition-colors duration-300">
            {/* Brand Yellow Gradient Top Border */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand & Description */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="CABI Logo" className="h-10 w-auto" />
                            <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                                CABI<span className="text-amber-500">.</span>
                            </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
                            Africa&apos;s unified mobility ecosystem. Decentralized dispatch, fair operator revenues, and reliable passenger transit.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Ecosystem Active
                            </span>
                        </div>
                    </div>

                    {/* Company Navigation */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Company
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    About Us
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
                                <Link href="/blog" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    System Intel
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Policies */}
                    <div>
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Legal & Safety
                        </h4>
                        <ul className="space-y-3">
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
                            <li>
                                <Link href="/safety" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                    Safety Standards
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sub-Footer Copyright */}
                <div className="mt-12 border-t border-neutral-200 dark:border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-500">
                    <p>
                        &copy; {new Date().getFullYear()} CABI Africa Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
