import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiMoon, HiSun } from 'react-icons/hi';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <HiMoon className="w-5 h-5" />
            ) : (
                <HiSun className="w-5 h-5" />
            )}
        </button>
    );
};
