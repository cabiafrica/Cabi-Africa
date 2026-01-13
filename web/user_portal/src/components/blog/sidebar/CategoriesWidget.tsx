interface CategoriesWidgetProps {
    categories: string[];
}

export default function CategoriesWidget({ categories }: CategoriesWidgetProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Categories</h3>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <a
                        key={category}
                        href={`/blog?category=${category}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        {category}
                    </a>
                ))}
            </div>
        </div>
    );
}
