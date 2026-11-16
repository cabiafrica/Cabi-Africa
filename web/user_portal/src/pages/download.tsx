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
                                        <FaCheckCircle /> Full Version • v1.2.1
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    CABI Go (Passenger App)
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Create your personal rider account, book Boda, Standard, XL, and Executive rides with live GPS tracking, and pay seamlessly via M-Pesa STK or Wallet.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={APP_LINKS.passenger.apkDirect}
                                    download={APP_LINKS.passenger.fileName}
                                    className="flex-1 bg-executive-gold text-black font-extrabold px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md active:scale-95"
                                >
                                    <FaAndroid className="text-lg text-emerald-950" />
                                    <span>Download .apk</span>
                                    <FaDownload className="text-xs opacity-75" />
                                </a>
                                <a
                                    href={APP_LINKS.passenger.iosWebApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-slate-900 dark:bg-black text-white border border-slate-300 dark:border-white/20 font-bold px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:border-executive-gold transition-all shadow-md"
                                >
                                    <FaApple className="text-base" />
                                    <span>iOS App (PWA)</span>
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
                                        <FaCheckCircle /> Full Version • v1.2.1
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    CABI Drive (Driver App)
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Sign up or log in as a verified CABI driver partner, go online to receive real-time trip dispatches, track your live earnings, and withdraw instantly to M-Pesa.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={APP_LINKS.driver.apkDirect}
                                    download={APP_LINKS.driver.fileName}
                                    className="flex-1 bg-neutral-900 dark:bg-black text-white border border-executive-gold/60 font-extrabold px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:border-executive-gold transition-all shadow-md active:scale-95"
                                >
                                    <FaAndroid className="text-lg text-emerald-400" />
                                    <span>Download .apk</span>
                                    <FaDownload className="text-xs text-executive-gold" />
                                </a>
                                <a
                                    href={APP_LINKS.driver.iosWebApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-white dark:bg-card-dark text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 font-bold px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:border-executive-gold transition-all shadow-md"
                                >
                                    <FaApple className="text-base" />
                                    <span>iOS App (PWA)</span>
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
                                <li>Tap <strong>Download .apk</strong> above for CABI Go or CABI Drive.</li>
                                <li>Your phone saves <code className="font-bold">Cabi-Go-Official.apk</code> or <code className="font-bold">Cabi-Drive-Official.apk</code> into your <strong>Downloads</strong> folder.</li>
                                <li>Tap the completed download (or open <strong>Files / Downloads</strong>) and tap <strong>Install</strong>.</li>
                                <li>If prompted with <em>&quot;Install unknown apps&quot;</em>, allow your browser or Files app to complete installation.</li>
                            </ol>
                        </div>

                        <div className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaApple className="text-slate-900 dark:text-white text-lg" /> iPhone / iPad (iOS Installation)
                            </h3>
                            <ol className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                                <li>Tap <strong>iOS App (PWA)</strong> above to launch the web edition in Safari.</li>
                                <li>Tap Safari&apos;s <strong>Share button (⬆️)</strong> at the bottom of the screen.</li>
                                <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                                <li>Tap <strong>Add</strong> in the top-right corner. The official app icon appears on your home screen and runs in full-screen standalone mode.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
