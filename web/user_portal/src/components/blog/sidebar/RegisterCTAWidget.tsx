import Link from 'next/link';

export default function RegisterCTAWidget() {
    return (
        <div className="bg-slate-900 dark:bg-card-dark rounded-2xl p-5 shadow-md text-white border border-slate-200 dark:border-[#D4AF37]/30">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                    CABI Network
                </span>
            </div>
            <h3 className="font-bold text-lg mb-2">Join Cabi Africa Today</h3>
            <p className="text-neutral-400 text-sm mb-4">
                Experience precision urban transit. Earn more as a driver or ride effortlessly as a passenger.
            </p>

            <div className="mt-4">
                <Link
                    href="/register"
                    className="block w-full text-center bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black py-3 rounded-xl text-sm transition-colors shadow-lg"
                >
                    Register Now
                </Link>
            </div>
        </div>
    );
}
