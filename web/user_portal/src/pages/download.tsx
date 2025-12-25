import MainLayout from '../components/layout/MainLayout';
import Link from 'next/link';

export default function DownloadApp() {
    return (
        <MainLayout title="Download Cabi App" description="Get the Cabi app for iOS and Android.">
            <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Get the Cabi App</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Download the Cabi app to book rides, track your driver, and manage your trips on the go.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                            <span className="text-2xl"></span>
                            <div className="text-left">
                                <div className="text-xs">Download on the</div>
                                <div className="text-sm font-bold leading-none">App Store</div>
                            </div>
                        </button>
                        <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                            <span className="text-2xl">🤖</span>
                            <div className="text-left">
                                <div className="text-xs">GET IT ON</div>
                                <div className="text-sm font-bold leading-none">Google Play</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
