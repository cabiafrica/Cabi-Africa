import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    items: FAQItem[];
}

interface FAQAccordionProps {
    categories: FAQCategory[];
}

export default function FAQAccordion({ categories }: FAQAccordionProps) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const key = `${categoryIndex}-${itemIndex}`;
        const newOpenItems = new Set(openItems);

        if (newOpenItems.has(key)) {
            newOpenItems.delete(key);
        } else {
            newOpenItems.add(key);
        }

        setOpenItems(newOpenItems);
    };

    const isOpen = (categoryIndex: number, itemIndex: number) => {
        return openItems.has(`${categoryIndex}-${itemIndex}`);
    };

    return (
        <div className="space-y-8">
            {categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="w-1 h-8 bg-indigo-600 mr-3 rounded-full"></span>
                        {category.title}
                    </h2>

                    <div className="space-y-3">
                        {category.items.map((item, itemIndex) => {
                            const isItemOpen = isOpen(categoryIndex, itemIndex);

                            return (
                                <div
                                    key={itemIndex}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
                                >
                                    <button
                                        onClick={() => toggleItem(categoryIndex, itemIndex)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                                        aria-expanded={isItemOpen}
                                    >
                                        <span className="font-semibold text-gray-900 dark:text-white pr-8">
                                            {item.question}
                                        </span>
                                        <svg
                                            className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 transition-transform duration-200 ${isItemOpen ? 'transform rotate-180' : ''
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-200 ${isItemOpen ? 'max-h-96' : 'max-h-0'
                                            }`}
                                    >
                                        <div className="px-6 pb-4 pt-2">
                                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                                {item.answer}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
