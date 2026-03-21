import Slider from 'react-slick';
import Image from 'next/image';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonials = [
    {
        content: "Cabi has completely transformed how I manage my daily commute. The reliability is unmatched and the drivers are professional.",
        author: "Sarah J.",
        role: "Regular Passenger",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        content: "Finally, a platform that respects drivers. The commission rates are fair, and the payouts are instant. I'm my own boss.",
        author: "David K.",
        role: "Partner Driver",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        content: "Our fleet efficiency increased by 40% within the first month of using Cabi's organization dashboard. It's a game changer.",
        author: "Michael T.",
        role: "Fleet Manager",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        content: "Safety is my top concern, and Cabi's tracking features give me peace of mind every time I ride late at night.",
        author: "Emily R.",
        role: "Student",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        content: "The ability to manage my sub-fleet and track income in real-time has made my business scalable.",
        author: "James O.",
        role: "Sacco Owner",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
];

function NextArrow(props: any) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} !bg-white/5 hover:!bg-brand-yellow hover:!text-black !w-14 !h-14 !flex !items-center !justify-center !rounded-2xl !z-20 !right-0 sm:!-right-8 transition-all duration-500 border border-white/10 hover:border-brand-yellow shadow-2xl before:!content-none`}
            onClick={onClick}
        >
            <FaChevronRight className="text-xl" />
        </div>
    );
}

function PrevArrow(props: any) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} !bg-white/5 hover:!bg-brand-yellow hover:!text-black !w-14 !h-14 !flex !items-center !justify-center !rounded-2xl !z-20 !left-0 sm:!-left-8 transition-all duration-500 border border-white/10 hover:border-brand-yellow shadow-2xl before:!content-none`}
            onClick={onClick}
        >
            <FaChevronLeft className="text-xl" />
        </div>
    );
}

export default function TestimonialsWidget() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1280,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 1 }
            }
        ],
        customPaging: (i: number) => (
            <div className="w-2 h-2 bg-white/20 rounded-full mt-12 transition-all duration-500 hover:bg-brand-yellow active-dot:w-6 active-dot:bg-brand-yellow" />
        )
    };

    return (
        <section className="py-32 bg-brand-black relative overflow-hidden">
            {/* Grid & Ambient Glows */}
            <div className="absolute inset-0 grid-futurist opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-brand-yellow/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24 animate-reveal">
                    <div className="mb-4 flex items-center justify-center gap-4">
                        <span className="h-px w-8 bg-brand-yellow opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow">Verified Feedback</span>
                        <span className="h-px w-8 bg-brand-yellow opacity-40" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                        Voice of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-accent">Ecosystem.</span>
                    </h2>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium">
                        Real-time intelligence from the units operating within our decentralized mobility network.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-12">
                    <Slider {...settings} className="testimonial-slider">
                        {testimonials.map((t, i) => (
                            <div key={i} className="px-5 py-10">
                                <div className="glass-premium p-10 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all duration-700 h-full flex flex-col group relative overflow-hidden">
                                    {/* Tech Ornament */}
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-brand-yellow/10 transition-colors duration-700" />
                                    
                                    <FaQuoteLeft className="text-brand-yellow/20 text-4xl mb-8 group-hover:scale-110 transition-transform duration-500" />
                                    
                                    <p className="text-white/60 text-lg leading-relaxed mb-10 font-medium italic relative z-10">
                                        "{t.content}"
                                    </p>
                                    
                                    <div className="flex items-center gap-5 mt-auto pt-8 border-t border-white/5 relative z-10">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-brand-yellow to-brand-accent rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm" />
                                            <Image
                                                src={t.image}
                                                alt={t.author}
                                                width={56}
                                                height={56}
                                                className="rounded-full relative z-10 border-2 border-white/10"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg tracking-tight uppercase">{t.author}</h4>
                                            <p className="text-xs text-brand-yellow font-black uppercase tracking-[0.2em] opacity-80">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}
