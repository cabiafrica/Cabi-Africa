import Link from 'next/link';
import { FaCar, FaUserPlus, FaMapMarkerAlt } from 'react-icons/fa';

export default function TripRequestWidget() {
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-slate-200 dark:border-[#D4AF37]/30 mb-6">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <FaCar className="text-[#D4AF37]" />
                Book a Ride
            </h3>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Pickup Location"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                </div>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-[#D4AF37]" />
                    <input
                        type="text"
                        placeholder="Destination"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                </div>
                <button className="w-full bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors">
                    Request Now
                </button>
            </form>
        </div>
    );
}
