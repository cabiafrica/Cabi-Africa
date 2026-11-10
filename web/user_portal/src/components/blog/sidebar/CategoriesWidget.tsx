import Link from 'next/link';

interface CategoriesWidgetProps {
    categories: string[];
}

export default function CategoriesWidget({ categories }: CategoriesWidgetProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-[#D4AF37]">Categories</h3>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <Link
                        key={category}
                        href={`/blog?category=${encodeURIComponent(category)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
                    >
                        {category}
                    </Link>
                ))}
            </div>
        </div>
    );
}
