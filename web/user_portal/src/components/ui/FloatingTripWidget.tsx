import React, { useState, useEffect } from 'react';
import { FaCar, FaTimes, FaChevronRight } from 'react-icons/fa';

export default function FloatingTripWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100); // Reduce threshold for easier testing
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isMounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickup || !destination) return;
        
        // Dispatch custom event to update BookingSection
        const event = new CustomEvent('tactical-booking', {
            detail: { pickup, destination }
        });
        window.dispatchEvent(event);

        // Scroll to the booking section
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        } else {
            // Fallback if not on home page
            window.location.href = `/?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`pointer-events-auto w-14 h-14 lg:w-16 lg:h-16 bg-[#F59E0B] rounded-full shadow-lg flex items-center justify-center text-black transition-all duration-700 transform hover:scale-110 active:scale-95 group relative ${isOpen || !isScrolled ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <FaCar className="text-xl lg:text-2xl" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-black border border-[#F59E0B] text-[8px] font-black items-center justify-center text-[#F59E0B]">!</span>
                </span>
            </button>

            {/* Floating Widget Card */}
            <div 
                className={`pointer-events-auto w-[320px] lg:w-[380px] bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] shadow-2xl transition-all duration-700 transform origin-bottom-right backdrop-blur-3xl overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20'}`}
            >
                <div className="relative z-10">
                    <div className="p-6 pb-2 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center border border-[#F59E0B]/20">
                                <FaCar className="text-[#F59E0B]" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-tighter">Tactical Booking</h3>
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">Neural Deployment Unit</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white">
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Pickup Location"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-[#F59E0B]/50"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Destination"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-[#F59E0B]/50"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-[#F59E0B] rounded-2xl font-black text-xs uppercase tracking-widest text-black flex items-center justify-center gap-2">
                            Compute Trajectory
                            <FaChevronRight />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
