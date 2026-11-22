import Link from 'next/link';
import { FaArrowRight, FaDownload } from 'react-icons/fa';

export default function DownloadAppWidget() {
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Get the App</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                Download the official CABI Go and CABI Drive apps for Android (.apk) and iOS (PWA).
            </p>

            <Link
                href="/download"
                className="w-full flex items-center justify-between p-3 bg-slate-900 dark:bg-black text-white border border-executive-gold/40 rounded-xl hover:border-executive-gold transition-all"
            >
                <span className="inline-flex items-center gap-2 text-xs font-bold">
                    <FaDownload className="text-executive-gold" />
                    Download Official Apps
                </span>
                <FaArrowRight className="text-xs text-executive-gold" />
            </Link>
        </div>
    );
}
