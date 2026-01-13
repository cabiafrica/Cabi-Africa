import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function ServicesPage() {
    return (
        <MainLayout
            title="Our Services - Cabi Africa"
            description="Explore the mobility solutions offered by Cabi Africa."
        >
            <div className="bg-white dark:bg-slate-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Our Ecosystem</h2>
                        <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Comprehensive mobility solutions for every need.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {/* Ride Hailing */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    Ride Hailing
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">Get a reliable ride in minutes. Choose from affordable to premium options.</p>
                                    <p className="mt-6">
                                        <Link href="/register" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Book now <span aria-hidden="true">→</span></Link>
                                    </p>
                                </dd>
                            </div>

                            {/* Corporate */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    Corporate Fleet
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">Manage your organization's transportation with our powerful dashboard.</p>
                                    <p className="mt-6">
                                        <Link href="/organizations" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Learn more <span aria-hidden="true">→</span></Link>
                                    </p>
                                </dd>
                            </div>

                            {/* Delivery (Coming Soon) */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    Logistics & Delivery
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
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
