import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { APP_LINKS } from '@/config/appLinks';

export default function DownloadAppWidget() {
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Get the App</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Download now for the best experience.</p>

            <div className="grid grid-cols-2 gap-2">
                <a
                    href={APP_LINKS.passenger.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 bg-slate-900 dark:bg-black text-white border border-white/10 rounded-xl hover:border-executive-gold/50 transition-all"
                >
                    <FaApple className="text-xl mb-1" />
                    <span className="text-[10px] leading-tight opacity-70">Download on the</span>
                    <span className="text-xs font-bold leading-tight">App Store</span>
                </a>
                <a
                    href={APP_LINKS.passenger.playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 bg-slate-900 dark:bg-black text-white border border-white/10 rounded-xl hover:border-executive-gold/50 transition-all"
                >
                    <FaGooglePlay className="text-xl mb-1 text-emerald-400" />
                    <span className="text-[10px] leading-tight opacity-70">GET IT ON</span>
                    <span className="text-xs font-bold leading-tight">Google Play</span>
                </a>
            </div>
        </div>
    );
}
