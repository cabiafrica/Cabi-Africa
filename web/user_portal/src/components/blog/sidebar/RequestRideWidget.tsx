import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Car, MapPin, Navigation, ArrowRight } from 'lucide-react';

export default function RequestRideWidget() {
    const router = useRouter();
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (pickup.trim()) params.set('pickup', pickup.trim());
        if (destination.trim()) params.set('destination', destination.trim());
        const query = params.toString();
        router.push(query ? `/?${query}#booking-section` : '/#booking-section');
    };

    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#D4AF37]/30">
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Car className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] leading-none">
                        Instant Dispatch
                    </p>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight mt-0.5">
                        Request a Ride
                    </h3>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="relative">
                    <Navigation className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Pickup location"
                        aria-label="Pickup location"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                </div>
                <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Drop-off destination"
                        aria-label="Drop-off destination"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 group active:scale-95"
                >
                    <span>Request a Ride</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
            </form>
        </div>
    );
}

