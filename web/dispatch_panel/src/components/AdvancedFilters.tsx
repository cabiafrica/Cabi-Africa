import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    id: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange';
    options?: FilterOption[];
}

interface AdvancedFiltersProps {
    filters: FilterConfig[];
    onFilterChange: (filters: Record<string, any>) => void;
    onClear?: () => void;
}

const AdvancedFilters = ({ filters, onFilterChange, onClear }: AdvancedFiltersProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

    const handleFilterChange = (filterId: string, value: any) => {
        const newFilters = { ...activeFilters };

        if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
            delete newFilters[filterId];
        } else {
            newFilters[filterId] = value;
        }

        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearAll = () => {
        setActiveFilters({});
        onFilterChange({});
        onClear?.();
    };

    const activeFilterCount = Object.keys(activeFilters).length;

    return (
        <div className="relative">
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${isOpen || activeFilterCount > 0
                        ? 'bg-amber-600/20 border-amber-500/50 text-amber-400'
                        : 'bg-slate-900/50 border-slate-800/50 text-slate-400 hover:border-slate-700/50 hover:text-white'
                    }`}
            >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                        <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Filter Options */}
                    <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                        {filters.map((filter) => (
                            <div key={filter.id} className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    {filter.label}
                                </label>

                                {filter.type === 'select' && (
                                    <select
                                        value={activeFilters[filter.id] || ''}
                                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                                    >
                                        <option value="">All</option>
                                        {filter.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {filter.type === 'multiselect' && (
                                    <div className="space-y-2">
                                        {filter.options?.map((option) => (
                                            <label
                                                key={option.value}
                                                className="flex items-center gap-2 cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        Array.isArray(activeFilters[filter.id]) &&
                                                        activeFilters[filter.id].includes(option.value)
                                                    }
                                                    onChange={(e) => {
                                                        const current = activeFilters[filter.id] || [];
                                                        const newValue = e.target.checked
                                                            ? [...current, option.value]
                                                            : current.filter((v: string) => v !== option.value);
                                                        handleFilterChange(filter.id, newValue);
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                                />
                                                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {filter.type === 'date' && (
                                    <input
                                        type="date"
                                        value={activeFilters[filter.id] || ''}
                                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                                    />
                                )}

                                {filter.type === 'daterange' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={activeFilters[filter.id]?.start || ''}
                                            onChange={(e) =>
                                                handleFilterChange(filter.id, {
                                                    ...activeFilters[filter.id],
                                                    start: e.target.value,
                                                })
                                            }
                                            placeholder="Start date"
                                            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                                        />
                                        <input
                                            type="date"
                                            value={activeFilters[filter.id]?.end || ''}
                                            onChange={(e) =>
                                                handleFilterChange(filter.id, {
                                                    ...activeFilters[filter.id],
                                                    end: e.target.value,
                                                })
                                            }
                                            placeholder="End date"
                                            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800/50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;
