import MainLayout from '../components/layout/MainLayout';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

export default function DownloadApp() {
    return (
        <MainLayout
            title="Download Cabi App | CABI Africa"
            description="Get the Cabi app for iOS and Android. Request rides or drive and earn with instant mobile money payouts."
            image="/images/hero-fleet.jpg"
            imageAlt="CABI Africa Passenger and Driver mobile apps for iOS and Android"
        >
            <div className="bg-slate-50 dark:bg-surface-dark py-16 sm:py-24 px-4 sm:px-6 lg:px-8 min-h-[75vh] flex items-center">
                <div className="mx-auto max-w-4xl w-full text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-executive-gold/15 border border-executive-gold/30 mb-5">
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-executive-gold">
                            Mobile Apps
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
                        Get the <span className="gold-gradient-text">Cabi</span> App
                    </h1>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Download the Cabi app to book rides, track your driver, and manage your trips on the go.
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Passenger App Card */}
                        <div className="rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-executive-gold mb-2">For Riders</p>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Cabi Passenger App</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Request Boda, CabiGo, Executive, and Diplomatic rides with instant mobile money STK checkout.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={APP_LINKS.passenger.appStore}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-white/15 px-5 py-3 rounded-xl flex items-center justify-center gap-3 hover:border-executive-gold/60 transition-all"
                                >
                                    <FaApple className="text-2xl" />
                                    <div className="text-left">
                                        <div className="text-[10px] opacity-75">Download on the</div>
                                        <div className="text-sm font-bold leading-none">App Store</div>
                                    </div>
                                </a>
                                <a
                                    href={APP_LINKS.passenger.playStore}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-white/15 px-5 py-3 rounded-xl flex items-center justify-center gap-3 hover:border-executive-gold/60 transition-all"
                                >
                                    <FaGooglePlay className="text-xl text-emerald-400" />
                                    <div className="text-left">
                                        <div className="text-[10px] opacity-75">GET IT ON</div>
                                        <div className="text-sm font-bold leading-none">Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Driver App Card */}
                        <div className="rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-executive-gold mb-2">For Partners</p>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Cabi Driver App</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Accept trip requests, track earnings in real time, and withdraw straight to mobile money.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={APP_LINKS.driver.appStore}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-white/15 px-5 py-3 rounded-xl flex items-center justify-center gap-3 hover:border-executive-gold/60 transition-all"
                                >
                                    <FaApple className="text-2xl" />
                                    <div className="text-left">
                                        <div className="text-[10px] opacity-75">Download on the</div>
                                        <div className="text-sm font-bold leading-none">App Store</div>
                                    </div>
                                </a>
                                <a
                                    href={APP_LINKS.driver.playStore}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-white/15 px-5 py-3 rounded-xl flex items-center justify-center gap-3 hover:border-executive-gold/60 transition-all"
                                >
                                    <FaGooglePlay className="text-xl text-emerald-400" />
                                    <div className="text-left">
                                        <div className="text-[10px] opacity-75">GET IT ON</div>
                                        <div className="text-sm font-bold leading-none">Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
