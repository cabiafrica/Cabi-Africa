import Image from 'next/image';

interface Testimonial {
    quote: string;
    name: string;
    role: string;
    avatarUrl?: string;
}

interface TestimonialsProps {
    title: string;
    testimonials: Testimonial[];
}

export default function Testimonials({ title, testimonials }: TestimonialsProps) {
    return (
        <section className="py-16 sm:py-24 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-3 mb-3">
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                            Rider Stories
                        </span>
                        <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {testimonials.map((testimonial, index) => {
                        const hasExternalAvatar = testimonial.avatarUrl && testimonial.avatarUrl.startsWith('http');
                        const initials = testimonial.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase();

                        return (
                            <div
                                key={index}
                                className="rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/45 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <blockquote className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mb-6 font-medium leading-relaxed">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </blockquote>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-11 w-11 relative rounded-xl overflow-hidden bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-sm">
                                        {hasExternalAvatar ? (
                                            <Image
                                                src={testimonial.avatarUrl!}
                                                alt={`${testimonial.name} — CABI Africa verified rider testimonial`}
                                                fill
                                                sizes="44px"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-base font-bold text-slate-900 dark:text-white">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
