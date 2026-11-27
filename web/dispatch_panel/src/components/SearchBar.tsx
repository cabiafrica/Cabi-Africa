import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    onClear?: () => void;
    className?: string;
}

const SearchBar = ({ placeholder = 'Search...', onSearch, onClear, className = '' }: SearchBarProps) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
        onClear?.();
    };

    return (
        <div className={`relative ${className}`}>
            <div
                className={`flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-[3px] px-4 py-2.5 transition-all duration-200 ${isFocused
                        ? 'border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/50'
                    }`}
            >
                <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-amber-500' : 'text-slate-400'}`} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none text-sm"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[3px] transition-colors group"
                    >
                        <X className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
                    </button>
                )}
            </div>

            {/* Search suggestions could go here in the future */}
            {query && isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] shadow-xl overflow-hidden z-50">
                    <div className="p-3 text-xs text-slate-500">
                        Press Enter to search for "{query}"
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
