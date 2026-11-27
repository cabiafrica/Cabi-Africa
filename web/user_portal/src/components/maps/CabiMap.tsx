import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

export interface MapMarker {
    id: string;
    position: [number, number];
    type: 'driver' | 'passenger' | 'pickup' | 'dropoff' | 'custom';
    icon?: L.Icon;
    popup?: string;
    onClick?: () => void;
}

export interface DirectionStep {
    instruction: string;
    distance: string;
}

export interface CabiMapProps {
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    route?: [number, number][];
    onMapClick?: (lat: number, lng: number) => void;
    height?: string;
    className?: string;
    showTraffic?: boolean;
    directions?: DirectionStep[];
}

// Custom marker icons (ported from admin_panel and refined)
const createDriverIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #fbbf24;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transform: rotate(45deg);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

const createPickupIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #0A0A0B;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 3px solid #D4AF37;
        box-shadow: 0 2px 8px rgba(0,0,0,0.45);
      "></div>
    `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
};

const createDropoffIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #FACC15;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 3px solid #0A0A0B;
        box-shadow: 0 2px 8px rgba(0,0,0,0.45);
      "></div>
    `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
};

export const CabiMap: React.FC<CabiMapProps> = ({
    center = [-1.286389, 36.817223], // Nairobi, Kenya
    zoom = 13,
    markers = [],
    route,
    onMapClick,
    height = '500px',
    className = '',
    showTraffic = false,
    directions = [],
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const trafficLayerRef = useRef<L.TileLayer | null>(null);
    const onMapClickRef = useRef(onMapClick);
    onMapClickRef.current = onMapClick;

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center,
            zoom,
            zoomControl: false,
            zoomAnimation: false,
        });

        // Add zoom control to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        map.on('click', (e) => {
            onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);

        return () => {
            map.stop();
            map.off();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Keep map centered when center prop updates without a full route fit
    useEffect(() => {
        if (!mapRef.current || (route && route.length > 0)) return;
        mapRef.current.setView(center, zoom, { animate: false });
    }, [center[0], center[1], zoom, route]);

    // Update markers
    useEffect(() => {
        if (!mapRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        markers.forEach((marker) => {
            let icon: L.Icon | L.DivIcon;

            if (marker.icon) {
                icon = marker.icon;
            } else {
                switch (marker.type) {
                    case 'driver':
                        icon = createDriverIcon();
                        break;
                    case 'pickup':
                        icon = createPickupIcon();
                        break;
                    case 'dropoff':
                        icon = createDropoffIcon();
                        break;
                    default:
                        icon = createDriverIcon();
                }
            }

            const leafletMarker = L.marker(marker.position, { icon }).addTo(
                markersLayerRef.current!
            );

            if (marker.popup) {
                leafletMarker.bindPopup(marker.popup);
            }

            if (marker.onClick) {
                leafletMarker.on('click', marker.onClick);
            }
        });
    }, [markers]);

    // Update route
    useEffect(() => {
        if (!mapRef.current) return;

        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }

        if (route && route.length > 0) {
            routeLayerRef.current = L.polyline(route, {
                color: '#D4AF37',
                weight: 5,
                opacity: 0.9,
                lineJoin: 'round',
            }).addTo(mapRef.current);

            // Fit bounds to show the entire route
            mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [50, 50],
                animate: false,
            });
        }
    }, [route]);

    // Handle Traffic Layer
    useEffect(() => {
        if (!mapRef.current) return;

        if (showTraffic) {
            // Mocking a traffic layer using a transport/street focused layer or could use a real traffic API if available
            // For demonstration, we'll use a slightly different tile set or just add a CSS filter to the existing one
            // A real implementation might use: L.tileLayer('https://path/to/traffic/{z}/{x}/{y}.png').addTo(mapRef.current);

            // Let's use Thunderforest Transport as a 'traffic' proxy for visual complexity
            trafficLayerRef.current = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_KEY', {
                opacity: 0.5
            });
            // Since we don't have a real key, we'll just simulate traffic by drawing some red/orange lines on common routes or just alerting
            console.log("Traffic layer enabled");
        } else {
            if (trafficLayerRef.current) {
                trafficLayerRef.current.remove();
                trafficLayerRef.current = null;
            }
        }
    }, [showTraffic]);

    const [showDirections, setShowDirections] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[3px] border border-slate-200 dark:border-white/10 shadow-lg">
            <div
                ref={mapContainerRef}
                style={{ height, width: '100%' }}
                className={className}
            />

            {/* Turn-by-Turn Directions Overlay */}
            {directions && directions.length > 0 && showDirections && (
                <div className="absolute top-3 left-3 z-[1000] w-72 max-h-[75%] bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-md rounded-[3px] shadow-2xl overflow-y-auto p-4 border border-slate-200 dark:border-amber-500/30 animate-fade-in">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Turn-by-Turn Route
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowDirections(false)}
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs p-1"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-3">
                        {directions.map((step, i) => (
                            <div key={i} className="flex gap-2.5 items-start border-l-2 border-amber-500/40 pl-2.5 pb-1">
                                <span className="text-[10px] font-mono text-amber-500 font-bold shrink-0">{i + 1}.</span>
                                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                    <p className="leading-snug">{step.instruction}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{step.distance}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Map Action Buttons (Top Right) */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
                {directions && directions.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowDirections(!showDirections)}
                        className={`px-2.5 py-1.5 rounded-[3px] shadow-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            showDirections
                                ? 'bg-amber-500 text-black'
                                : 'bg-white/90 dark:bg-black/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        }`}
                        title="Toggle Turn-by-Turn Directions"
                    >
                        <span>🗺️</span>
                        <span>{showDirections ? 'Hide Steps' : 'Turn-by-Turn'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CabiMap;
