import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { FaTimes } from 'react-icons/fa';
import type { MapMarker } from '@/components/maps/CabiMap';

export interface Coords {
    lat: number;
    lng: number;
}

export type MapPinMode = 'pickup' | 'dropoff';

const CabiMap = dynamic(() => import('@/components/maps/CabiMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[260px] rounded-xl bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-neutral-500">
            Loading interactive map...
        </div>
    ),
});

export const NAIROBI_PRESETS: { label: string; coords: Coords }[] = [
    { label: 'Nairobi CBD, Kenyatta Ave', coords: { lat: -1.286389, lng: 36.817223 } },
    { label: 'Westlands, Sarit Centre', coords: { lat: -1.2611, lng: 36.8025 } },
    { label: 'JKIA Terminal 1A, Nairobi', coords: { lat: -1.3192, lng: 36.9275 } },
    { label: 'Kilimani, Yaya Centre', coords: { lat: -1.2928, lng: 36.7879 } },
    { label: 'Gigiri, UN Avenue', coords: { lat: -1.2335, lng: 36.8169 } },
];

export function inferCoordsFromText(label: string, fallback: Coords): Coords {
    const lower = label.toLowerCase();
    for (const preset of NAIROBI_PRESETS) {
        const key = preset.label.split(',')[0].toLowerCase();
        if (lower.includes(key)) {
            return preset.coords;
        }
    }
    return fallback;
}

export async function resolveAddressFromCoords(lat: number, lng: number): Promise<string> {
    const coordFallback = `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { signal: controller.signal }
        );
        clearTimeout(timer);
        if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
                return data.display_name.split(',').slice(0, 3).join(', ');
            }
        }
    } catch {
        // Graceful fallback when reverse geocoder is unreachable
    }
    return coordFallback;
}

export function buildPinMarkers(
    pickup: string,
    pickupCoords: Coords | null,
    destination: string,
    dropoffCoords: Coords | null
): MapMarker[] {
    const list: MapMarker[] = [];
    if (pickupCoords) {
        list.push({
            id: 'pickup-pin',
            position: [pickupCoords.lat, pickupCoords.lng],
            type: 'pickup',
            popup: `Pickup: ${pickup || 'Selected Location'}`,
        });
    }
    if (dropoffCoords) {
        list.push({
            id: 'dropoff-pin',
            position: [dropoffCoords.lat, dropoffCoords.lng],
            type: 'dropoff',
            popup: `Drop-off: ${destination || 'Selected Destination'}`,
        });
    }
    return list;
}

interface MapPinModalProps {
    mode: MapPinMode | null;
    onModeChange: (mode: MapPinMode | null) => void;
    pickup: string;
    destination: string;
    pickupCoords: Coords | null;
    dropoffCoords: Coords | null;
    onPickupSelect: (label: string, coords: Coords) => void;
    onDropoffSelect: (label: string, coords: Coords) => void;
}

export default function MapPinModal({
    mode,
    onModeChange,
    pickup,
    destination,
    pickupCoords,
    dropoffCoords,
    onPickupSelect,
    onDropoffSelect,
}: MapPinModalProps) {
    const [resolvingPin, setResolvingPin] = useState(false);

    const markers = useMemo(
        () => buildPinMarkers(pickup, pickupCoords, destination, dropoffCoords),
        [pickup, pickupCoords, destination, dropoffCoords]
    );

    const activeCenter: [number, number] = useMemo(() => {
        if (mode === 'pickup' && pickupCoords) return [pickupCoords.lat, pickupCoords.lng];
        if (mode === 'dropoff' && dropoffCoords) return [dropoffCoords.lat, dropoffCoords.lng];
        if (pickupCoords) return [pickupCoords.lat, pickupCoords.lng];
        return [-1.286389, 36.817223];
    }, [mode, pickupCoords, dropoffCoords]);

    if (!mode) return null;

    const handleMapPinSelect = async (lat: number, lng: number) => {
        setResolvingPin(true);
        const label = await resolveAddressFromCoords(lat, lng);
        if (mode === 'pickup') {
            onPickupSelect(label, { lat, lng });
        } else {
            onDropoffSelect(label, { lat, lng });
        }
        setResolvingPin(false);
    };

    const applyPresetLocation = (preset: { label: string; coords: Coords }) => {
        if (mode === 'pickup') {
            onPickupSelect(preset.label, preset.coords);
        } else {
            onDropoffSelect(preset.label, preset.coords);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Interactive Pin Selector"
            onKeyDown={(e) => {
                if (e.key === 'Escape') onModeChange(null);
            }}
        >
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => onModeChange(null)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onModeChange(null);
                }}
            />
            <div className="relative bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl animate-reveal z-10">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                            Interactive Pin Selector
                        </p>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                            Click anywhere on the map to set your{' '}
                            {mode === 'pickup' ? 'Pickup Location' : 'Drop-off Destination'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => onModeChange(null)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:text-black dark:hover:text-white"
                        aria-label="Close map pin selector"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Switch between Pickup Pin and Drop-off Pin */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => onModeChange('pickup')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            mode === 'pickup'
                                ? 'bg-[#D4AF37] text-black'
                                : 'bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/10'
                        }`}
                    >
                        1. Pickup Pin {pickupCoords ? '✓' : ''}
                    </button>
                    <button
                        type="button"
                        onClick={() => onModeChange('dropoff')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            mode === 'dropoff'
                                ? 'bg-[#FACC15] text-black'
                                : 'bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/10'
                        }`}
                    >
                        2. Drop-off Pin {dropoffCoords ? '✓' : ''}
                    </button>
                    {resolvingPin && (
                        <span className="text-xs font-semibold text-[#D4AF37] ml-2">
                            Resolving address...
                        </span>
                    )}
                </div>

                {/* Quick Nairobi Hub Presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {NAIROBI_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            type="button"
                            onClick={() => applyPresetLocation(preset)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-surface-dark hover:border-[#D4AF37] border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-neutral-200 transition-colors"
                        >
                            {preset.label.split(',')[0]}
                        </button>
                    ))}
                </div>

                <div className="h-[300px] sm:h-[360px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <CabiMap
                        center={activeCenter}
                        zoom={13}
                        height="100%"
                        markers={markers}
                        route={
                            pickupCoords && dropoffCoords
                                ? [
                                      [pickupCoords.lat, pickupCoords.lng],
                                      [dropoffCoords.lat, dropoffCoords.lng],
                                  ]
                                : undefined
                        }
                        onMapClick={handleMapPinSelect}
                    />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-600 dark:text-neutral-300 space-y-0.5">
                        <p>
                            <strong className="text-slate-900 dark:text-white">Pickup:</strong>{' '}
                            {pickup || 'Not pinned yet'}
                        </p>
                        <p>
                            <strong className="text-slate-900 dark:text-white">Drop-off:</strong>{' '}
                            {destination || 'Not pinned yet'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onModeChange(null)}
                        className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest shadow-md"
                    >
                        Done Pinning
                    </button>
                </div>
            </div>
        </div>
    );
}

