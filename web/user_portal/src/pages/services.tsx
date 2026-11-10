import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function ServicesPage() {
    return (
        <MainLayout
            title="Our Services - Cabi Africa"
            description="Explore the mobility solutions offered by Cabi Africa."
        >
            <div className="bg-slate-50 dark:bg-surface-dark py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">Ecosystem</span>
                        </h2>
                        <p className="mt-3 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                            Comprehensive mobility solutions for every need.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                            {/* Ride Hailing */}
                            <div className="flex flex-col rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 p-8 transition-colors">
                                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-slate-900 dark:text-white">
                                    Ride Hailing
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-300">
                                    <p className="flex-auto">Get a reliable ride in minutes. Choose from affordable to premium options.</p>
                                    <p className="mt-6">
                                        <Link href="/register" className="text-sm font-bold leading-6 text-[#D4AF37] hover:text-[#ffe088] transition-colors">Book now <span aria-hidden="true">→</span></Link>
                                    </p>
                                </dd>
                            </div>

                            {/* Corporate */}
                            <div className="flex flex-col rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 p-8 transition-colors">
                                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-slate-900 dark:text-white">
                                    Corporate Fleet
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-300">
                                    <p className="flex-auto">Manage your organization's transportation with our powerful dashboard.</p>
                                    <p className="mt-6">
                                        <Link href="/organizations/register" className="text-sm font-bold leading-6 text-[#D4AF37] hover:text-[#ffe088] transition-colors">Learn more <span aria-hidden="true">→</span></Link>
                                    </p>
                                </dd>
                            </div>

                            {/* Delivery (Coming Soon) */}
                            <div className="flex flex-col rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 p-8 transition-colors">
                                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-slate-900 dark:text-white">
                                    Logistics & Delivery
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-300">
                                    <p className="flex-auto">Fast and secure package delivery for businesses and individuals. (Coming Soon)</p>
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
