import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaCar, FaMapMarkerAlt } from 'react-icons/fa';

export default function TripRequestWidget() {
    const router = useRouter();
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (pickup.trim()) params.set('pickup', pickup.trim());
        if (destination.trim()) params.set('destination', destination.trim());
        const query = params.toString();
        router.push(query ? `/?${query}#booking-section` : '/#booking-section');
    };

    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-slate-200 dark:border-[#D4AF37]/30 mb-6">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <FaCar className="text-[#D4AF37]" />
                Book a Ride
            </h3>
            <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-400" />
                    <input
                        id="trip-request-pickup"
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Pickup Location (e.g. Westlands)"
                        aria-label="Pickup Location"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                    />
                </div>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-[#D4AF37]" />
                    <input
                        id="trip-request-destination"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Destination (e.g. JKIA)"
                        aria-label="Destination"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                    />
                </div>
                <button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors shadow-sm active:scale-95">
                    Request &amp; Pinpoint on Map &rarr;
                </button>
            </form>
        </div>
    );
}
