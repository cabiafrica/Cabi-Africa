import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-4">
                            <img src="/logo.png" alt="CABI Logo" className="h-12 w-auto" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                            Transforming the ride-hailing experience with a community-first approach.
                            Join us in building a sustainable and profitable future for drivers and passengers.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/drivers" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                    For Drivers
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                    Intel
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/privacy-policy" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 text-center">
                    <p className="text-base text-slate-500">
                        &copy; {new Date().getFullYear()} CABI AFRICA Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
