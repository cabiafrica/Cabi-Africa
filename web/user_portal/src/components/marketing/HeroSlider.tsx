import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaArrowRight, FaCar, FaWallet, FaRoute, FaBuilding, FaChartLine, FaUsers, FaGlobeAfrica } from 'react-icons/fa';
import Link from 'next/link';

export default function HeroSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        fade: true,
        arrows: false,
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="relative min-h-[750px] lg:h-screen bg-slate-50 dark:bg-brand-black" />;

    const slides = [
        {
            id: 1,
            title: "The Future of Mobility.",
            subtitle: "Experience Africa's' first unified neural mobility ecosystem. Seamless, distributed, and strictly decentralized for the modern traveler.",
            buttonText: "Launch Journey",
            buttonLink: "/register",
            gradient: "from-brand-yellow via-amber-400 to-brand-accent",
            layout: "center",
            Graphic: () => (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-30">
                    <div className="absolute inset-0 rounded-full border border-brand-yellow/20 animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute inset-20 rounded-full border border-brand-accent/20 animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-40 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]"></div>
                    {/* Glowing Orbs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-yellow rounded-full shadow-[0_0_30px_rgba(250,204,21,1)] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-0 w-2 h-2 bg-brand-accent rounded-full shadow-[0_0_20px_rgba(34,211,238,1)] animate-bounce-slow"></div>
                </div>
            )
        },
        {
            id: 2,
            title: "Drive Your Destiny.",
            subtitle: "Empowering next-gen drivers with institutional-grade payouts, real-time analytics, and hyper-local support.",
            buttonText: "Start Driving",
            buttonLink: "/drivers",
            gradient: "from-cyan-400 via-brand-accent to-brand-indigo",
            layout: "left-graphic",
            Graphic: () => (
                <div className="relative w-full h-[500px] flex items-center justify-center">
                    {/* Futuristic Glass Card */}
                    <div className="relative z-10 glass p-10 rounded-[2.5rem] w-85 -rotate-6 shadow-2xl animate-float group bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
                        <div className="absolute -top-4 -right-4 bg-brand-yellow text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Verified</div>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-yellow to-amber-600 flex items-center justify-center text-black text-2xl shadow-lg shadow-brand-yellow/20">
                                <FaCar />
                            </div>
                            <div>
                                <h4 className="text-gray-900 dark:text-white font-black text-lg tracking-tight">Driver Elite</h4>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest">Neural Link Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="h-3 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-gray-300 dark:border-white/10">
                                <div className="h-full w-4/5 bg-gradient-to-r from-brand-yellow to-brand-accent animate-pulse"></div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-white/40 uppercase font-black tracking-widest mb-1">Weekly Yield</p>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">KSh 32,850</span>
                                </div>
                                <div className="text-brand-accent font-black text-sm flex items-center gap-1">
                                    <FaChartLine /> +12%
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Tech Modules */}
                    <div className="absolute top-10 right-0 glass p-5 rounded-2xl animate-float animation-delay-400 shadow-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
                        <FaWallet className="text-4xl text-brand-yellow shadow-glow" />
                    </div>
                    <div className="absolute bottom-20 left-10 glass px-6 py-4 rounded-2xl border-brand-accent/30 animate-float animation-delay-600 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <FaRoute className="text-brand-accent" />
                            <span className="text-gray-900 dark:text-white font-black text-sm">4.98 Rating</span>
                        </div>
                    </div>
                </div>
            )
        },
    ];

    return (
        <div className="relative min-h-[750px] lg:h-screen overflow-hidden bg-slate-50 dark:bg-brand-black transition-colors duration-500">
            {/* Global Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-brand-indigo/20 blur-[180px] pointer-events-none" />

            <Slider {...settings} className="h-full hero-slider">
                {slides.map((slide) => {
                    const isCenter = slide.layout === 'center';
                    const isLeftGraphic = slide.layout === 'left-graphic';

                    return (
                        <div key={slide.id} className="relative min-h-[750px] lg:h-screen outline-none">
                            {/* Background Layers */}
                            <div className="absolute inset-0 bg-slate-50 dark:bg-brand-black overflow-hidden transition-colors duration-500">
                                <div className={`absolute -top-[20%] -right-[10%] w-[1200px] h-[1200px] bg-gradient-to-br ${slide.gradient} opacity-20 dark:opacity-10 rounded-full blur-[200px] animate-glow`}></div>
                                <div className="absolute inset-0 grid-futurist opacity-20 dark:opacity-10"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 dark:from-brand-black via-transparent to-slate-50 dark:to-brand-black opacity-90 dark:opacity-80"></div>
                            </div>

                            {/* Center Graphic */}
                            {isCenter && <slide.Graphic />}

                            <div className="container mx-auto px-6 h-full relative z-20">
                                <div className={`flex flex-col lg:flex-row h-full items-center gap-12 lg:gap-24 ${isLeftGraphic ? 'lg:flex-row-reverse' : ''} pt-32 lg:pt-0`}>

                                    {/* Text Content */}
                                    <div className={`flex-1 flex flex-col justify-center ${isCenter ? 'items-center text-center w-full max-w-5xl mx-auto' : 'items-start text-left'}`}>
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full mb-6 lg:mb-8 animate-reveal">
                                            <span className="w-2 h-2 bg-brand-yellow rounded-full animate-ping"></span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white/60">System Version 4.0.2</span>
                                        </div>
                                        <h1 className="text-4xl md:text-8xl lg:text-9xl font-black mb-6 lg:mb-8 leading-[0.95] lg:leading-[0.9] tracking-tighter animate-reveal text-gray-900 dark:text-white">
                                            {slide.title.split(' ').slice(0, -1).join(' ')} <br />
                                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.gradient} drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]`}>
                                                {slide.title.split(' ').slice(-1)}
                                            </span>
                                        </h1>
                                        <p className="text-base lg:text-xl text-gray-600 dark:text-white/50 mb-10 lg:mb-12 max-w-2xl leading-relaxed animate-reveal animation-delay-200">
                                            {slide.subtitle}
                                        </p>
                                        <div className="animate-reveal animation-delay-400">
                                            <Link
                                                href={slide.buttonLink}
                                                className="group relative inline-flex items-center gap-4 bg-gray-900 dark:bg-white px-8 lg:px-10 py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-white dark:text-black text-lg lg:text-xl overflow-hidden transition-all duration-500 hover:pr-14 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] active:scale-95"
                                            >
                                                <span className="relative z-10">{slide.buttonText}</span>
                                                <FaArrowRight className="relative z-10 transition-all duration-500 group-hover:translate-x-2" />
                                                <div className="absolute inset-0 bg-brand-yellow translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Sidebar Graphic */}
                                    {!isCenter && (
                                        <div className="flex-1 w-full flex justify-center items-center animate-reveal animation-delay-400 pb-12 lg:pb-0 scale-75 lg:scale-100 origin-center">
                                            <slide.Graphic />
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
}
