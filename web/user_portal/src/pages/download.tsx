import MainLayout from '../components/layout/MainLayout';
import { FaAndroid, FaApple, FaCheckCircle, FaDownload, FaMobileAlt, FaCarSide, FaShieldAlt } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

export default function DownloadApp() {
    return (
        <MainLayout
            title="Download CABI Africa Official Apps | Direct Device Installer"
            description="Download the full production CABI Go (Passenger) and CABI Drive (Driver) apps directly to your phone's Downloads folder."
            image="/images/hero-fleet.jpg"
            imageAlt="CABI Africa Passenger and Driver Official Mobile Apps"
        >
            <div className="bg-slate-50 dark:bg-surface-dark py-16 sm:py-24 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
                <div className="mx-auto max-w-5xl w-full text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-executive-gold/15 border border-executive-gold/30 mb-5">
                        <FaShieldAlt className="text-executive-gold text-xs" />
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-executive-gold">
                            Official Direct App Market • Full Production Releases
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
                        Download <span className="gold-gradient-text">CABI Africa</span> to Your Phone
                    </h1>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Choose your edition below. Tapping download saves the official full-version package (<code className="font-bold text-executive-gold">.apk</code>) directly into your device&apos;s <strong>Downloads</strong> folder for instant installation and full use.
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Passenger App Card */}
                        <div className="rounded-2xl bg-white dark:bg-card-dark border-2 border-executive-gold/40 p-6 sm:p-8 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-executive-gold">
                                        <FaMobileAlt /> Passenger Edition
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                        <FaCheckCircle /> Full Version • v1.1.0
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    CABI Go (Passenger App)
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Create your personal rider account, book Boda, Standard, XL, and Executive rides with live GPS tracking, and pay seamlessly via M-Pesa STK or Wallet.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <a
                                    href={APP_LINKS.passenger.apkDirect}
                                    download={APP_LINKS.passenger.fileName}
                                    className="w-full bg-executive-gold text-black font-extrabold px-6 py-4 rounded-xl flex items-center justify-between gap-3 hover:brightness-110 transition-all shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaAndroid className="text-2xl" />
                                        <div className="text-left">
                                            <div className="text-[10px] uppercase tracking-wider opacity-80">
                                                Android Direct Download ({APP_LINKS.passenger.fileName})
                                            </div>
                                            <div className="text-base font-black leading-none mt-0.5">
                                                Download CABI Go (Android APK)
                                            </div>
                                        </div>
                                    </div>
                                    <FaDownload className="text-lg" />
                                </a>
                                <a
                                    href={APP_LINKS.passenger.iosWebApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-900 dark:bg-black/70 text-white border border-slate-700 dark:border-white/20 font-extrabold px-6 py-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-executive-gold transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaApple className="text-2xl text-white" />
                                        <div className="text-left">
                                            <div className="text-[10px] uppercase tracking-wider text-executive-gold">
                                                iPhone &amp; iPad (Safari Install)
                                            </div>
                                            <div className="text-sm font-black leading-none mt-0.5">
                                                Install CABI Go for iOS
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider text-executive-gold">Open</span>
                                </a>
                            </div>
                        </div>

                        {/* Driver App Card */}
                        <div className="rounded-2xl bg-white dark:bg-card-dark border-2 border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-executive-gold">
                                        <FaCarSide /> Driver Partner Edition
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                        <FaCheckCircle /> Full Version • v1.1.0
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    CABI Drive (Driver App)
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Sign up or log in as a verified CABI driver partner, go online to receive real-time trip dispatches, track your live earnings, and withdraw instantly to M-Pesa.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <a
                                    href={APP_LINKS.driver.apkDirect}
                                    download={APP_LINKS.driver.fileName}
                                    className="w-full bg-slate-900 dark:bg-black text-white border border-executive-gold/50 font-extrabold px-6 py-4 rounded-xl flex items-center justify-between gap-3 hover:border-executive-gold transition-all shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaAndroid className="text-2xl text-emerald-400" />
                                        <div className="text-left">
                                            <div className="text-[10px] uppercase tracking-wider text-executive-gold">
                                                Android Direct Download ({APP_LINKS.driver.fileName})
                                            </div>
                                            <div className="text-base font-black leading-none mt-0.5">
                                                Download CABI Drive (Android APK)
                                            </div>
                                        </div>
                                    </div>
                                    <FaDownload className="text-lg text-executive-gold" />
                                </a>
                                <a
                                    href={APP_LINKS.driver.iosWebApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 font-extrabold px-6 py-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-executive-gold transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaApple className="text-2xl" />
                                        <div className="text-left">
                                            <div className="text-[10px] uppercase tracking-wider text-executive-gold">
                                                iPhone &amp; iPad (Safari Install)
                                            </div>
                                            <div className="text-sm font-black leading-none mt-0.5">
                                                Install CABI Drive for iOS
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider text-executive-gold">Open</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Installation Guide */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaAndroid className="text-emerald-500 text-lg" /> Android Installation
                            </h3>
                            <ol className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                                <li>Tap <strong>Download CABI Go</strong> or <strong>Download CABI Drive (Android APK)</strong>.</li>
                                <li>Your phone saves <code className="font-bold">Cabi-Go-Official.apk</code> or <code className="font-bold">Cabi-Drive-Official.apk</code> into your <strong>Downloads</strong> folder.</li>
                                <li>Tap the completed download (or open <strong>Files / Downloads</strong>) and tap <strong>Install</strong>.</li>
                            </ol>
                        </div>

                        <div className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaApple className="text-slate-900 dark:text-white text-lg" /> iPhone &amp; iPad (iOS) Installation
                            </h3>
                            <ol className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                                <li>Open this page in <strong>Safari</strong> and tap <strong>Install CABI Go for iOS</strong> or <strong>Install CABI Drive for iOS</strong>.</li>
                                <li>Tap the Safari <strong>Share</strong> icon (square with upward arrow) at the bottom of the screen.</li>
                                <li>Tap <strong>Add to Home Screen</strong> → <strong>Add</strong> to install the full-screen app on your iPhone.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
