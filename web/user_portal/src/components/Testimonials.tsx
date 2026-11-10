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
        <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
                    {title}
                </h2>
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
                            <div key={index} className="bg-slate-50 dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
                                <blockquote className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-6 font-medium italic">
                                    "{testimonial.quote}"
                                </blockquote>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-11 w-11 relative rounded-full overflow-hidden bg-slate-900 dark:bg-brand-yellow flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">
                                        {hasExternalAvatar ? (
                                            <Image
                                                src={testimonial.avatarUrl!}
                                                alt={testimonial.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-base font-bold text-gray-900 dark:text-white">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
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
