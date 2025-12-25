import Image from 'next/image';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
}

export default function Testimonials({ testimonials, title = "What Our Users Are Saying" }: TestimonialsProps) {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <figure key={index} className="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
              <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
                <p className="my-4">"{testimonial.quote}"</p>
              </blockquote>
              <figcaption className="flex items-center justify-center space-x-3">
                <Image
                  className="rounded-full w-9 h-9"
                  src={testimonial.avatarUrl}
                  alt={`Avatar of ${testimonial.name}`}
                  width={36}
                  height={36}
                />
                <div className="space-y-0.5 font-medium dark:text-white text-left">
                  <div>{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}