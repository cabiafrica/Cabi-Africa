import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';

export default function SafetyPage() {
    return (
        <MainLayout
            title="Safety - Cabi Africa"
            description="Your safety is our priority. Learn about the features and standards that keep you secure."
        >
            <div className="bg-white dark:bg-slate-900">
                {/* Hero */}
                <div className="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-32">
                    <div className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl" aria-hidden="true">
                        <div className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                    </div>

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:mx-0">
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Safety at Every Turn</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-300">
                                Whether you’re in the back seat or behind the wheel, your safety drives everything we do.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Real-time Monitoring</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Every trip is GPS-tracked. You can share your trip status with loved ones in real-time.
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verified Drivers</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                All, drivers undergo rigorous background checks and vehicle inspections before they can drive with Cabi.
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">24/7 Support</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Our safety response team is available around the clock to assist you in any emergency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
