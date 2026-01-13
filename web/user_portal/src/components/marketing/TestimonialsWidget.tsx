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
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} !bg-brand-gray/20 hover:!bg-brand-accent !w-10 !h-10 !flex !items-center !justify-center !rounded-full !z-10 !right-0 sm:!-right-4 transition-colors`}
            style={{ ...style, display: "flex" }}
            onClick={onClick}
        >
            <FaChevronRight className="text-white" />
        </div>
    );
}

function PrevArrow(props: any) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} !bg-brand-gray/20 hover:!bg-brand-accent !w-10 !h-10 !flex !items-center !justify-center !rounded-full !z-10 !left-0 sm:!-left-4 transition-colors`}
            style={{ ...style, display: "flex" }}
            onClick={onClick}
        >
            <FaChevronLeft className="text-white" />
        </div>
    );
}

export default function TestimonialsWidget() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            }
        ]
    };

    return (
        <section className="py-24 bg-brand-dark/50 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Trusted by <span className="text-brand-yellow">Everyone</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Hear from the people who keep Nairobi moving.</p>
                </div>

                <div className="mx-auto max-w-7xl px-8">
                    <Slider {...settings}>
                        {testimonials.map((t, i) => (
                            <div key={i} className="px-3">
                                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors h-full flex flex-col">
                                    <FaQuoteLeft className="text-brand-yellow/30 text-3xl mb-6" />
                                    <p className="text-gray-300 leading-relaxed mb-6 italic flex-grow">"{t.content}"</p>
                                    <div className="flex items-center gap-4 mt-auto border-t border-white/10 pt-4">
                                        <Image
                                            src={t.image}
                                            alt={t.author}
                                            width={48}
                                            height={48}
                                            className="rounded-full ring-2 ring-brand-purple/50"
                                        />
                                        <div>
                                            <h4 className="font-bold text-white">{t.author}</h4>
                                            <p className="text-sm text-brand-accent font-medium tracking-wide">{t.role}</p>
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
