import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

interface FeatureSplitProps {
    type: 'driver' | 'passenger';
}

export default function FeatureSplit({ type }: FeatureSplitProps) {
    const isDriver = type === 'driver';

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
        <section className="py-24 bg-brand-black overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${isDriver ? '' : 'lg:flex-row-reverse'}`}>

                    {/* Image Side */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className={`absolute -inset-4 bg-gradient-to-r ${isDriver ? 'from-brand-accent to-purple-600' : 'from-brand-yellow to-orange-500'} rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition duration-500`}></div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
                            <Image
                                src={content.image}
                                alt={content.imageAlt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Badge */}
                            <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
                                <span className={`text-sm font-bold ${isDriver ? 'text-brand-accent' : 'text-brand-yellow'} uppercase tracking-wide`}>
                                    {isDriver ? 'For Drivers' : 'For Passengers'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Text Side */}
                    <div className="w-full lg:w-1/2 text-left">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {content.title}
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            {content.message}
                        </p>
                        <Link
                            href={content.buttonLink}
                            className={`inline-flex items-center gap-3 text-lg font-bold border-b-2 border-transparent hover:border-current transition-all pb-1 ${isDriver ? 'text-brand-accent hover:text-white' : 'text-brand-yellow hover:text-white'
                                }`}
                        >
                            {content.buttonText} <FaArrowRight />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
