import Image from 'next/image';

interface Testimonial {
    quote: string;
    name: string;
    role: string;
    avatarUrl: string;
}

interface TestimonialsProps {
    title: string;
    testimonials: Testimonial[];
}

export default function Testimonials({ title, testimonials }: TestimonialsProps) {
    return (
        <section className="py-16 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
                    {title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg shadow-sm">
                            <blockquote className="text-lg text-gray-500 dark:text-gray-400 mb-6 font-medium italic">
                                "{testimonial.quote}"
                            </blockquote>
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden bg-gray-300">
                                    {/* Placeholder avatar if image fails or is missing */}
                                    <Image
                                        src={testimonial.avatarUrl}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                        unoptimized // For simplistic external/placeholder images
                                    />
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
                    ))}
                </div>
            </div>
        </section>
    );
}
