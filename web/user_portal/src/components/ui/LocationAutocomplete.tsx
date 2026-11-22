import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { PlaceSuggestion, searchLocalPlaces } from '@/data/places';

interface LocationAutocompleteProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (label: string, coords: { lat: number; lng: number }) => void;
    onPinClick?: () => void;
    placeholder?: string;
    ariaLabel?: string;
    inputClassName?: string;
    surfaceClassName?: string;
    leftIcon?: React.ReactNode;
    rightSlot?: React.ReactNode;
}

/**
 * Location input with instant neighbourhood-suffixed suggestions,
 * inline typeahead autofill (Tab / Right Arrow), and debounced geocoder augmentation.
 */
export default function LocationAutocomplete({
    id,
    value,
    onChange,
    onSelect,
    onPinClick,
    placeholder = 'Enter location',
    ariaLabel,
    inputClassName = '',
    surfaceClassName = '',
    leftIcon,
    rightSlot,
}: LocationAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [remoteSuggestions, setRemoteSuggestions] = useState<PlaceSuggestion[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const localSuggestions = useMemo(() => searchLocalPlaces(value, 6), [value]);

    const suggestions = useMemo(() => {
        if (!remoteSuggestions.length) return localSuggestions;
        const seen = new Set(localSuggestions.map((s) => s.label.toLowerCase()));
        return [
            ...localSuggestions,
            ...remoteSuggestions.filter((r) => !seen.has(r.label.toLowerCase())),
        ].slice(0, 7);
    }, [localSuggestions, remoteSuggestions]);

    // Inline autofill ghost suffix when top suggestion starts with current input
    const inlineCompletion = useMemo(() => {
        const trimmed = value;
        if (!trimmed || trimmed.length < 2 || suggestions.length === 0) return '';
        const top = suggestions[0].label;
        if (top.toLowerCase().startsWith(trimmed.toLowerCase()) && top.length > trimmed.length) {
            return trimmed + top.slice(trimmed.length);
        }
        return '';
    }, [value, suggestions]);

    useEffect(() => {
        setActiveIndex(0);
    }, [value]);

    useEffect(() => {
        const q = value.trim();
        if (q.length < 3) {
            setRemoteSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data?.suggestions)) {
                        setRemoteSuggestions(data.suggestions);
                    }
                }
            } catch {
                // Keep instant local suggestions on network hiccup
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [value]);

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleChoose = (item: PlaceSuggestion) => {
        onChange(item.label);
        onSelect(item.label, { lat: item.lat, lng: item.lng });
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab' && inlineCompletion && open) {
            e.preventDefault();
            handleChoose(suggestions[0]);
            return;
        }

        if (
            e.key === 'ArrowRight' &&
            inlineCompletion &&
            open &&
            e.currentTarget.selectionStart === value.length
        ) {
            e.preventDefault();
            handleChoose(suggestions[0]);
            return;
        }

        if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setOpen(true);
            return;
        }

        if (!open) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (suggestions.length ? (prev + 1) % suggestions.length : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) =>
                suggestions.length ? (prev - 1 + suggestions.length) % suggestions.length : 0
            );
        } else if (e.key === 'Enter' && suggestions[activeIndex]) {
            e.preventDefault();
            handleChoose(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className={`relative flex items-center ${surfaceClassName}`}>
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        {leftIcon}
                    </div>
                )}

                {/* Subtle inline typeahead ghost overlay */}
                {open && inlineCompletion && (
                    <input
                        type="text"
                        readOnly
                        tabIndex={-1}
                        aria-hidden="true"
                        aria-label="Location autocomplete inline suggestion"
                        value={inlineCompletion}
                        className={`${inputClassName} pointer-events-none select-none !bg-transparent !border-transparent !ring-0 !shadow-none !text-neutral-400/65 dark:!text-white/30 absolute inset-0 z-[1]`}
                    />
                )}

                <input
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="both"
                    aria-label={ariaLabel || placeholder || 'Location search'}
                    autoComplete="off"
                    value={value}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`${inputClassName} relative z-[2] !bg-transparent`}
                />

                {rightSlot}
            </div>

            {open && (suggestions.length > 0 || onPinClick) && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-2 z-[90] max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 shadow-2xl py-1.5"
                >
                    {onPinClick && (
                        <li role="presentation" className="border-b border-slate-100 dark:border-white/10 mb-1">
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setOpen(false);
                                    onPinClick();
                                }}
                                className="w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-[#D4AF37] hover:bg-amber-500/10 transition-colors"
                            >
                                <span className="flex items-center gap-2.5">
                                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-amber-600 dark:text-[#D4AF37]" />
                                    <span>Pinpoint on Interactive Map</span>
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-[#ffe088] uppercase tracking-wider">
                                    Click Map
                                </span>
                            </button>
                        </li>
                    )}
                    {suggestions.map((item, idx) => {
                        const isHighlighted = idx === activeIndex;
                        return (
                            <li key={item.id} role="option" aria-selected={isHighlighted}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleChoose(item);
                                    }}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2.5 transition-colors ${
                                        isHighlighted
                                            ? 'bg-[#D4AF37]/15 text-slate-900 dark:text-white'
                                            : 'text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <span className="flex items-center gap-2.5 min-w-0">
                                        <FaMapMarkerAlt className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                        <span className="text-xs sm:text-sm font-bold truncate">
                                            {item.name}
                                        </span>
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-dark text-[#D4AF37] border border-slate-200 dark:border-white/10 shrink-0">
                                        {item.neighbourhood}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
