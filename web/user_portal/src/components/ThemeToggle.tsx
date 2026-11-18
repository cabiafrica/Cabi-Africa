import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <button
            onClick={toggleTheme}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none"
            title="Toggle theme"
            aria-label="Toggle theme"
            type="button"
        >
            {mounted ? (
                theme === 'light' ? (
                    <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                )
            ) : (
                <span className="w-4 h-4 block" />
            )}
        </button>
    );
};
