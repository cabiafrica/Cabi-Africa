import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

interface FeatureSplitProps {
    type: 'driver' | 'passenger';
}

export default function FeatureSplit({ type }: FeatureSplitProps) {
    const isDriver = type === 'driver';
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const content = isDriver ? {
        title: "Drive & Earn on Your Terms",
        message: "Join the fastest-growing network of drivers. Enjoy improved earnings, transparent tracking, and a community that supports your growth.",
        buttonText: "Learn More",
        buttonLink: "/blog", // User requested blog link
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070", // Happy Driver / Car
        imageAlt: "Happy Cabi Driver"
    } : {
        title: "Ride in Comfort & Style",
        message: "Experience seamless urban mobility. Whether it's a quick trip to town or a luxury ride for a special occasion, Cabi gets you there safely.",
        buttonText: "Learn More",
        buttonLink: "/blog", // User requested blog link
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070", // Happy Passenger
        imageAlt: "Happy Cabi Passenger"
    };

    return (
        <section className="py-32 bg-slate-50 dark:bg-brand-black overflow-hidden relative group/section">
            <div className="container mx-auto px-6">
                <div className={`flex flex-col lg:flex-row items-center gap-20 lg:gap-32 ${isDriver ? '' : 'lg:flex-row-reverse'}`}>

                    {/* Image Side */}
                    <div className="w-full lg:w-1/2 relative group">
                        {/* Futuristic Frame */}
                        <div className={`absolute -inset-1 bg-gradient-to-tr ${isDriver ? 'from-brand-accent to-brand-indigo' : 'from-brand-yellow to-orange-500'} rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-60 transition-all duration-1000 rotate-1 ease-in-out`}></div>
                        
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all duration-700 shadow-2xl">
                            <Image
                                src={content.image}
                                alt={content.imageAlt}
                                fill
                                className="object-cover transition-transform duration-[2s] group-hover:scale-110 group-hover:rotate-1"
                            />
                            {/* Scanning Effect Overlay */}
                            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent top-0 animate-[scan_4s_linear_infinite]" />
                            
                            {/* Glass Badge */}
                            <div className="absolute bottom-8 left-8 glass px-8 py-4 rounded-2xl animate-reveal border-brand-yellow/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${isDriver ? 'bg-brand-accent shadow-[0_0_15px_rgba(34,211,238,1)]' : 'bg-brand-yellow shadow-[0_0_15px_rgba(250,204,21,1)]'}`} />
                                    <span className={`text-xs font-black uppercase tracking-[0.3em] ${isDriver ? 'text-brand-accent' : 'text-brand-yellow'}`}>
                                        {isDriver ? 'Operation: Carrier' : 'Operation: Voyager'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tech Accents */}
                        <div className="absolute -top-6 -right-6 w-12 h-12 border-t-2 border-r-2 border-gray-300 dark:border-white/20 rounded-tr-3xl" />
                        <div className="absolute -bottom-6 -left-6 w-12 h-12 border-b-2 border-l-2 border-gray-300 dark:border-white/20 rounded-bl-3xl" />
                    </div>

                    {/* Text Side */}
                    <div className="w-full lg:w-1/2 text-left animate-reveal">
                        <div className="mb-8 flex items-center gap-4">
                            <span className={`h-px w-12 ${isDriver ? 'bg-brand-accent' : 'bg-brand-yellow'} opacity-40`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-white/40">Unit Classification</span>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-[1] tracking-tighter">
                            {content.title.split(' ').slice(0, -1).join(' ')} <br/>
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDriver ? 'from-brand-accent to-brand-indigo' : 'from-brand-yellow to-amber-600'}`}>
                                {content.title.split(' ').slice(-1)}
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-white/40 mb-12 leading-relaxed max-w-xl font-medium">
                            {content.message}
                        </p>
                        <Link
                            href={content.buttonLink}
                            className={`group inline-flex items-center gap-6 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-500 hover:scale-105 active:scale-95 ${
                                isDriver 
                                ? 'bg-brand-accent text-black shadow-[0_20px_40px_-15px_rgba(34,211,238,0.3)]' 
                                : 'bg-brand-yellow text-black shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)]'
                            }`}
                        >
                            {content.buttonText} 
                            {mounted && <FaArrowRight className="transition-transform duration-500 group-hover:translate-x-2" />}
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
