import MainLayout from '../components/layout/MainLayout';
import { FaApple, FaAndroid, FaCheckCircle } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

export default function DownloadApp() {
    return (
        <MainLayout
            title="Download Cabi App | CABI Africa"
            description="Download the official CABI Africa Passenger and Driver apps for Android (Direct APK) and iPhone/iOS (Instant Web App)."
            image="/images/hero-fleet.jpg"
            imageAlt="CABI Africa Passenger and Driver mobile apps for iOS and Android"
        >
            <div className="bg-slate-50 dark:bg-surface-dark py-16 sm:py-24 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
                <div className="mx-auto max-w-5xl w-full text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-executive-gold/15 border border-executive-gold/30 mb-5">
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-executive-gold">
                            Official Mobile Releases • Ready to Use
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
                        Install the <span className="gold-gradient-text">CABI</span> App
                    </h1>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Download the official Android APK directly to your phone or launch the instant iPhone/iOS app experience—pre-configured and connected to live CABI Africa services.
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Driver App Card */}
                        <div className="rounded-2xl bg-white dark:bg-card-dark border-2 border-executive-gold/40 p-6 sm:p-8 shadow-lg relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-executive-gold">For Driver Partners</p>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                    <FaCheckCircle /> Production Ready
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">CABI Drive (Driver App)</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Go online, accept ride requests in real time, track your daily earnings, and manage SACCO savings & instant mobile money payouts.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={APP_LINKS.driver.playStore}
                                    download
                                    className="flex-1 bg-executive-gold text-black font-extrabold px-5 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-md"
                                >
                                    <FaAndroid className="text-2xl" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-wider opacity-80">Direct Download</div>
                                        <div className="text-sm font-black leading-none">Android APK</div>
                                    </div>
                                </a>
                                <a
                                    href={APP_LINKS.driver.appStore}
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-white/15 px-5 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:border-executive-gold/60 transition-all"
                                >
                                    <FaApple className="text-2xl" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-wider opacity-75">Install on</div>
                                        <div className="text-sm font-bold leading-none">iPhone / iOS</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Passenger App Card */}
                        <div className="rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-executive-gold">For Riders</p>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                    <FaCheckCircle /> Production Ready
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">CABI Go (Passenger App)</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Request Boda, Basic, Standard, XL, and Executive rides across Africa with live GPS tracking and instant M-Pesa STK checkout.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={APP_LINKS.passenger.playStore}
                                    download
                                    className="flex-1 bg-emerald-500 text-black font-extrabold px-5 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-md"
                                >
                                    <FaAndroid className="text-2xl" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-wider opacity-80">Direct Download</div>
                                        <div className="text-sm font-black leading-none">Android APK</div>
                                    </div>
                                </a>
                                <a
                                    href={APP_LINKS.passenger.appStore}
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-white/15 px-5 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:border-executive-gold/60 transition-all"
                                >
                                    <FaApple className="text-2xl" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-wider opacity-75">Install on</div>
                                        <div className="text-sm font-bold leading-none">iPhone / iOS</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Installation Guide */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <FaAndroid className="text-emerald-500 text-lg" /> Android APK Installation
                            </h3>
                            <ol className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                                <li>Tap <strong>Direct Download Android APK</strong> above for Driver or Passenger.</li>
                                <li>Open the downloaded <code>.apk</code> file from your phone notification bar or Downloads folder.</li>
                                <li>If prompted, allow <strong>Install from this source</strong>, then tap <strong>Install</strong> and <strong>Open</strong>.</li>
                            </ol>
                        </div>

                        <div className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <FaApple className="text-slate-900 dark:text-white text-lg" /> iPhone / iOS Installation
                            </h3>
                            <ol className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                                <li>Tap <strong>Install on iPhone / iOS</strong> above in Safari to launch the app.</li>
                                <li>Tap the Safari <strong>Share</strong> icon (⬆️) at the bottom of your screen.</li>
                                <li>Select <strong>Add to Home Screen</strong> to install the full-screen CABI icon on your iPhone.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
