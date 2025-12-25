import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { SosManager } from '../sos/SosManager';

export const Header: React.FC<{ currentView: string }> = ({ currentView }) => {
    const { user } = useAuth();
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
        <header className="glass-panel shadow-sm h-16 flex items-center px-6 justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-xl font-semibold text-gray-800 capitalize whitespace-nowrap">
                    {currentView.replace(/-/g, ' ')}
                </h2>
                {/* Global Search Bar */}
                <div className="relative max-w-md w-full ml-8 hidden sm:block" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search users, drivers..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 2 && setShowResults(true)}
                    />

                    {/* Search Results Dropdown */}
                    {showResults && results.length > 0 && (
                        <div className="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-50">
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        alert(`Navigate to ${result.name} (${result.type})`); // Placeholder for navigation
                                        setShowResults(false);
                                        setQuery('');
                                    }}
                                >
                                    <span className={`w-2 h-2 rounded-full ${result.type === 'DRIVER' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                    <div className="flex flex-col">
                                        <span className="font-medium truncate">{result.name}</span>
                                        <span className="text-xs text-gray-500">{result.email} • {result.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {showResults && results.length === 0 && (
                        <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md py-2 px-4 text-sm text-gray-500 z-50">
                            No results found.
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                    Logged in as <span className="font-semibold text-gray-900">{user?.fullName || 'Admin'}</span>
                </div>
                <SosManager />
            </div>
        </header>
    );
};
