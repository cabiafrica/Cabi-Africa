import Link from 'next/link';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

export default function DownloadAppWidget() {
    return (
        <div className="bg-indigo-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Get the App</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Download now for the best experience.</p>

            <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center justify-center p-2 bg-black text-white rounded-lg hover:opacity-80 transition-opacity">
                    <FaApple className="text-xl mb-1" />
                    <span className="text-[10px] leading-tight opacity-70">Download on the</span>
                    <span className="text-xs font-bold leading-tight">App Store</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 bg-black text-white rounded-lg hover:opacity-80 transition-opacity">
                    <FaGooglePlay className="text-xl mb-1" />
                    <span className="text-[10px] leading-tight opacity-70">GET IT ON</span>
                    <span className="text-xs font-bold leading-tight">Google Play</span>
                </button>
            </div>
        </div>
    );
}
