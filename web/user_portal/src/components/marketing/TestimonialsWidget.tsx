import Slider from 'react-slick';
import Image from 'next/image';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonials = [
    {
        content: "Cabi has completely transformed how I manage my daily commute. The reliability is unmatched and the chauffeurs are always courteous.",
        author: "Sarah J.",
        role: "Regular Passenger",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        content: "Finally, a platform that respects drivers. The commission rates are fair, and payouts settle fast. I'm building my own business.",
        author: "David K.",
        role: "Partner Driver",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        content: "Managing our team's vehicles and driver schedules is effortless through the Cabi fleet dashboard. It's a huge step forward.",
        author: "Michael T.",
        role: "Fleet Manager",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        content: "Safety is my top priority, and Cabi's live ride sharing and trip PIN features give me peace of mind every time I ride at night.",
        author: "Emily R.",
        role: "Passenger",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        content: "The ability to onboard our vehicles and track operations transparently has helped our SACCO grow with confidence.",
        author: "James O.",
        role: "Sacco Owner",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
];

function NextArrow(props: any) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} !hidden sm:!flex !bg-white dark:!bg-card-dark !text-slate-700 dark:!text-[#D4AF37] hover:!bg-[#D4AF37] hover:!text-black !w-12 !h-12 !items-center !justify-center !rounded-2xl !z-20 !right-0 sm:!-right-6 transition-all duration-300 border border-slate-200 dark:border-[#D4AF37]/30 hover:!border-[#D4AF37] shadow-xl before:!content-none`}
            onClick={onClick}
        >
            <FaChevronRight className="text-lg" />
        </div>
    );
}

function PrevArrow(props: any) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} !hidden sm:!flex !bg-white dark:!bg-card-dark !text-slate-700 dark:!text-[#D4AF37] hover:!bg-[#D4AF37] hover:!text-black !w-12 !h-12 !items-center !justify-center !rounded-2xl !z-20 !left-0 sm:!-left-6 transition-all duration-300 border border-slate-200 dark:border-[#D4AF37]/30 hover:!border-[#D4AF37] shadow-xl before:!content-none`}
            onClick={onClick}
        >
            <FaChevronLeft className="text-lg" />
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
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 1, arrows: false },
            },
        ],
        customPaging: () => (
            <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-white/20 rounded-full mt-6 sm:mt-10 transition-all duration-300 hover:bg-[#D4AF37]" />
        ),
    };

    return (
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 transition-colors duration-300 relative overflow-hidden">
            {/* Ambient Obsidian-Gold Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[380px] bg-[#D4AF37]/10 blur-[140px] rounded-full pointer-events-none animate-gold-aura" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
                <div className="text-center mb-12 sm:mb-16">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                            Community Feedback
                        </span>
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Voice of the{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                            Ecosystem.
                        </span>
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Stories and feedback from passengers, driver-partners, and fleet operators riding with CABI.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl px-0 sm:px-10">
                    <Slider {...settings} className="testimonial-slider">
                        {testimonials.map((t, i) => (
                            <div key={i} className="px-2 sm:px-3 py-4 sm:py-6">
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col group relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <FaQuoteLeft className="text-[#D4AF37]/25 group-hover:text-[#D4AF37]/50 text-3xl mb-6 transition-colors duration-300" />

                                    <p className="text-neutral-700 dark:text-neutral-300 text-base sm:text-lg leading-relaxed mb-8 font-normal italic relative z-10">
                                        &ldquo;{t.content}&rdquo;
                                    </p>

                                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-200 dark:border-white/10 relative z-10">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-[#ffe088] via-[#FACC15] to-[#D4AF37] rounded-full opacity-35 group-hover:opacity-80 transition-opacity duration-500 blur-sm" />
                                            <Image
                                                src={t.image}
                                                alt={t.author}
                                                width={52}
                                                height={52}
                                                className="rounded-full relative z-10 border-2 border-[#D4AF37]/40"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase">
                                                {t.author}
                                            </h4>
                                            <p className="text-[11px] text-[#D4AF37] font-extrabold uppercase tracking-[0.2em]">
                                                {t.role}
                                            </p>
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
