import Slider from 'react-slick';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ShieldCheck, TrendingUp, Sparkles, Wrench } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonials = [
    {
        content: "The chauffeurs are suddenly so calm, courteous, and respectful. It proved the driver was never the problem—oppressive commissions on legacy apps were. Treated with dignity and fair pay, you get an executive experience no other app can touch.",
        author: "Amina N.",
        role: "Corporate Commuter, Nairobi",
        seal: "Dignity & Courtesy Crest",
        initials: "AN",
        icon: ShieldCheck,
        highlight: "Respect & Dignity",
    },
    {
        content: "You feel a different energy in the cabin. Daily rides directly fund vehicle ownership and family wealth creation through Cabi's reusable commission. Drivers can finally build lasting wealth, and that pride shines in every mile.",
        author: "David M.",
        role: "Tech Executive & Regular Rider",
        seal: "Partner Wealth & Equity Crest",
        initials: "DM",
        icon: TrendingUp,
        highlight: "Driver Wealth Creation",
    },
    {
        content: "Oppressive commissions on other apps forced us to postpone repairs. Now, with Cabi's reusable commission funding vehicle upkeep and wealth creation, servicing my car is completely effortless. Passengers immediately notice how silent and well-maintained it is.",
        author: "Josphat K.",
        role: "Driver Partner (4 Yrs Driving), Nairobi",
        seal: "Vehicle Wellness & Upkeep Crest",
        initials: "JK",
        icon: Wrench,
        highlight: "Effortless Maintenance & Pride",
    },
    {
        content: "Hands down the best mobility experience. Verified 4-digit PIN safety, calm sanctuaries, and zero surge extortion. Cabi proved drivers were never chaotic—greedy app design was. Riding here is peaceful, reliable, and best-in-class.",
        author: "Zainab B.",
        role: "Regional Business Traveler",
        seal: "Executive Sanctuary Seal",
        initials: "ZB",
        icon: Sparkles,
        highlight: "Best Experience Like No Other",
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
        autoplaySpeed: 5500,
        pauseOnHover: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1280,
                settings: { slidesToShow: 2, infinite: true, autoplay: true, autoplaySpeed: 5000 },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 1, infinite: true, autoplay: true, autoplaySpeed: 5000, arrows: false },
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
                            Satisfied Users
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
                        What happens when you eliminate exploitative platform greed and treat partners with dignity: real reflections from riders and driver partners across our ecosystem.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl px-0 sm:px-6">
                    <Slider {...settings} className="testimonial-slider">
                        {testimonials.map((t, i) => (
                            <div key={i} className="px-2 sm:px-3 py-4 sm:py-6 h-full">
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col justify-between group relative overflow-hidden min-h-[380px]">
                                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <FaQuoteLeft className="text-[#D4AF37]/30 group-hover:text-[#D4AF37]/60 text-2xl sm:text-3xl transition-colors duration-300" />
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                                                {t.highlight}
                                            </span>
                                        </div>

                                        <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed mb-8 font-normal italic relative z-10">
                                            &ldquo;{t.content}&rdquo;
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-200 dark:border-white/10 relative z-10">
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-[#ffe088] via-[#FACC15] to-[#D4AF37] rounded-2xl opacity-40 group-hover:opacity-90 transition-opacity duration-500 blur-sm" />
                                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-[#D4AF37]/50 flex items-center justify-center relative z-10 shadow-md">
                                                <t.icon className="w-5 h-5 text-[#D4AF37]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase">
                                                    {t.author}
                                                </h4>
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                                                    {t.initials}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[#D4AF37] font-extrabold uppercase tracking-[0.15em]">
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
