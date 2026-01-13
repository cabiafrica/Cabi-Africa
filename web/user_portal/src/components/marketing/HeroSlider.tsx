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

    const slides = [
        {
            id: 1,
            title: "Move Beyond Expectations.",
            subtitle: "The neural network for distributed ecosystem mobility across Africa.",
            buttonText: "Join the Revolution",
            buttonLink: "/register",
            gradient: "from-brand-yellow to-brand-accent",
            layout: "center",
            Graphic: () => (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 animate-spin-slow">
                    <div className="absolute inset-0 rounded-full border-2 border-brand-yellow/30 border-dashed"></div>
                    <div className="absolute inset-8 rounded-full border border-brand-accent/30"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-yellow rounded-full shadow-[0_0_20px_rgba(255,215,0,0.8)]"></div>
                </div>
            )
        },
        {
            id: 2,
            title: "Drive Your Own Destiny.",
            subtitle: "Empowering drivers with fair rates, instant payouts, and unparalleled support.",
            buttonText: "Start Driving",
            buttonLink: "/drivers",
            gradient: "from-[#F59E0B] to-[#EF4444]", // Amber to Red
            layout: "left-graphic", // Graphic Left, Text Right
            Graphic: () => (
                <div className="relative w-full h-[400px] flex items-center justify-center">
                    {/* Glass Card */}
                    <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-80 rotate-[-6deg] shadow-2xl animate-float">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl">
                                <FaCar />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Driver Pro</h4>
                                <p className="text-gray-400 text-xs">Online Now</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-orange-400"></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-300">
                                <span>Daily Earnings</span>
                                <span className="text-green-400 font-bold">KSh 4,500</span>
                            </div>
                        </div>
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute top-10 right-10 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 animate-float animation-delay-500 shadow-xl">
                        <FaWallet className="text-3xl text-green-400" />
                    </div>
                </div>
            )
        },
    ];

    return (
        <div className="relative h-[90vh] overflow-hidden bg-brand-black">
            <Slider {...settings} className="h-full hero-slider">
                {slides.map((slide) => {
                    const isCenter = slide.layout === 'center';
                    const isLeftGraphic = slide.layout === 'left-graphic';
                    const isRightGraphic = slide.layout === 'right-graphic';

                    return (
                        <div key={slide.id} className="relative h-[90vh] outline-none">
                            {/* Background Elements */}
                            <div className="absolute inset-0 bg-brand-black">
                                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gray-900/50 to-transparent"></div>
                                <div className={`absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br ${slide.gradient} opacity-20 rounded-full blur-[150px]`}></div>
                                {isLeftGraphic && (
                                    <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr ${slide.gradient} opacity-10 rounded-full blur-[120px]`}></div>
                                )}
                                <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10 bg-repeat"></div>
                            </div>

                            {/* Central Graphic for slide 1 */}
                            {isCenter && <slide.Graphic />}

                            <div className="container mx-auto px-6 h-full relative z-10">
                                <div className={`flex flex-col md:flex-row h-full items-center gap-12 ${isLeftGraphic ? 'md:flex-row-reverse' : ''}`}>

                                    {/* Text Content */}
                                    <div className={`flex-1 flex flex-col justify-center ${isCenter ? 'items-center text-center w-full max-w-4xl mx-auto' : 'items-start text-left'}`}>
                                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight animate-slide-up text-white">
                                            {slide.title.split(' ').slice(0, -1).join(' ')} <br />
                                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.gradient}`}>
                                                {slide.title.split(' ').slice(-1)}
                                            </span>
                                        </h1>
                                        <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed animate-slide-up animation-delay-200">
                                            {slide.subtitle}
                                        </p>
                                        <div className="animate-slide-up animation-delay-400">
                                            <Link
                                                href={slide.buttonLink}
                                                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-yellow transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                                            >
                                                {slide.buttonText} <FaArrowRight />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Sidebar Graphic (for Left/Right layouts) */}
                                    {!isCenter && (
                                        <div className="flex-1 w-full flex justify-center items-center">
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
