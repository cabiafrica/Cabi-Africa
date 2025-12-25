'use client';

import { useState, ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface AccordionProps {
    title: string;
    children: ReactNode;
}

export default function Accordion({ title, children }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                {isOpen ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {children}
                    </p>
                </div>
            )}
        </div>
    );
}
