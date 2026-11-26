import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SosManager } from '../sos/SosManager';

export const Header: React.FC<{ currentView: string }> = ({ currentView }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                const res = await adminService.globalSearch(query);
                setResults(res);
                setShowResults(true);
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setResults([]);
            setShowResults(false);
        }
    }, [query]);

    return (
        <header className="glass-panel shadow-md h-16 flex items-center px-6 justify-between sticky top-0 z-10 border-b border-white/5">
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-xl font-semibold text-slate-100 capitalize whitespace-nowrap tracking-tight">
                    {currentView.replace(/-/g, ' ')}
                </h2>
                {/* Global Search Bar */}
                <div className="relative max-w-md w-full ml-8 hidden sm:block" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-700/50 rounded-lg leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                        placeholder="Search users, drivers..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 2 && setShowResults(true)}
                    />

                    {/* Search Results Dropdown */}
                    {showResults && results.length > 0 && (
                        <div className="absolute mt-1 w-full bg-slate-800 shadow-xl max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-50 border border-slate-700">
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-700/50 flex items-center gap-2 text-slate-200"
                                    onClick={() => {
                                        alert(`Navigate to ${result.name} (${result.type})`); // Placeholder for navigation
                                        setShowResults(false);
                                        setQuery('');
                                    }}
                                >
                                    <span className={`w-2 h-2 rounded-full ${result.type === 'DRIVER' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                    <div className="flex flex-col">
                                        <span className="font-medium truncate">{result.name}</span>
                                        <span className="text-xs text-slate-400">{result.email} • {result.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {showResults && results.length === 0 && (
                        <div className="absolute mt-1 w-full bg-slate-800 shadow-xl rounded-lg py-2 px-4 text-sm text-slate-400 z-50 border border-slate-700">
                            No results found.
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <SosManager />
            </div>
        </header>
    );
};
