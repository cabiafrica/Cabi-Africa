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
    type: 'driver' | 'passenger' | 'pickup' | 'dropoff' | 'custom' | 'hazard';
    bearing?: number;
    isMoving?: boolean;
    category?: string;
    categoryColor?: string;
    icon?: L.Icon | L.DivIcon;
    popup?: string;
    onClick?: () => void;
    hazardData?: {
        title: string;
        delayText?: string;
        isClosure?: boolean;
    };
}

export interface DirectionStep {
    instruction: string;
    distance: string;
}

export interface AlternativeRouteOption {
    points: [number, number][];
    label: string;
    extraTime: string;
    distanceKm?: number;
    durationMin?: number;
    summary?: string;
}

export interface TrafficSegmentOption {
    points: [number, number][];
    status: 'clear' | 'moderate' | 'heavy' | 'closure';
}

export interface RouteHazardOption {
    position: [number, number];
    title: string;
    delayText?: string;
    isClosure?: boolean;
}

export interface CabiMapProps {
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    route?: [number, number][];
    alternativeRoutes?: AlternativeRouteOption[];
    trafficSegments?: TrafficSegmentOption[];
    hazards?: RouteHazardOption[];
    onSelectAlternativeRoute?: (index: number) => void;
    onMapClick?: (lat: number, lng: number) => void;
    height?: string;
    className?: string;
    showTraffic?: boolean;
    directions?: DirectionStep[];
    themeMode?: 'light' | 'dark' | 'auto';
}

// Moderate, non-aggressive vehicle category colors (strictly no purple)
export const resolveModerateCategoryColor = (category?: string, customColor?: string): string => {
    if (customColor) return customColor;
    const cat = (category || 'STANDARD').toUpperCase();
    if (cat === 'BODA' || cat === 'MOTO') return '#D97706'; // Warm Terracotta Amber
    if (cat === 'CABIGO' || cat === 'BASIC' || cat === 'STANDARD') return '#0D9488'; // Petrol Teal / Sage
    if (cat === 'EXECUTIVE' || cat === 'PREMIUM') return '#D4AF37'; // Presidential Champagne Gold
    if (cat === 'XL' || cat === 'SUV' || cat === 'VAN') return '#2563EB'; // Executive Steel Navy
    return '#0D9488';
};

// 3D Isometric Vehicle Marker for moving drivers
export const create3DVehicleIcon = (category?: string, bearing = 0, isMoving = true, customColor?: string) => {
    const accentColor = resolveModerateCategoryColor(category, customColor);
    const cat = (category || 'STANDARD').toUpperCase();
    const isBoda = cat === 'BODA' || cat === 'MOTO';
    const isXl = cat === 'XL' || cat === 'SUV' || cat === 'VAN';

    const headlightBeam = isMoving
        ? `<polygon points="18,0 34,0 30,16 22,16" fill="url(#beamGrad)" opacity="0.6"/>`
        : '';

    let chassisSvg = '';
    if (isBoda) {
        chassisSvg = `
          <!-- Boda Motorcycle -->
          <rect x="24" y="8" width="4" height="8" rx="2" fill="#000" stroke="#94A3B8" stroke-width="0.8"/>
          <line x1="18" y1="14" x2="34" y2="14" stroke="#CBD5E1" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="26" cy="20" r="5" fill="${accentColor}" stroke="#000" stroke-width="1.2"/>
          <circle cx="26" cy="19" r="2" fill="#F8FAFC" opacity="0.6"/>
          <rect x="23" y="24" width="6" height="13" rx="2.5" fill="#1E293B" stroke="${accentColor}" stroke-width="1.2"/>
          <rect x="24" y="36" width="4" height="7" rx="2" fill="#000"/>
        `;
    } else if (isXl) {
        chassisSvg = `
          <!-- SUV / Van -->
          <rect x="15" y="10" width="24" height="38" rx="5" fill="rgba(0,0,0,0.4)" filter="blur(2px)"/>
          <rect x="14" y="8" width="24" height="38" rx="4.5" fill="#0F172A" stroke="${accentColor}" stroke-width="1.8"/>
          <rect x="15.5" y="9" width="4" height="2" rx="1" fill="#FEF08A"/>
          <rect x="32.5" y="9" width="4" height="2" rx="1" fill="#FEF08A"/>
          <rect x="16.5" y="13" width="19" height="7.5" rx="1.5" fill="url(#glassGrad)"/>
          <rect x="16" y="22" width="20" height="17" rx="2" fill="${accentColor}" opacity="0.95"/>
          <line x1="18" y1="23" x2="18" y2="38" stroke="rgba(0,0,0,0.35)" stroke-width="1.6"/>
          <line x1="34" y1="23" x2="34" y2="38" stroke="rgba(0,0,0,0.35)" stroke-width="1.6"/>
          <rect x="17.5" y="40" width="17" height="4" rx="1" fill="#0369A1"/>
          <rect x="15" y="44.5" width="4" height="1.5" rx="0.5" fill="#EF4444"/>
          <rect x="33" y="44.5" width="4" height="1.5" rx="0.5" fill="#EF4444"/>
        `;
    } else {
        chassisSvg = `
          <!-- Executive Sedan -->
          <rect x="16" y="10" width="22" height="35" rx="4.5" fill="rgba(0,0,0,0.45)" filter="blur(2px)"/>
          <rect x="15" y="9" width="22" height="35" rx="4" fill="#0F172A" stroke="${accentColor}" stroke-width="1.6"/>
          <rect x="16.5" y="10" width="3.5" height="2" rx="1" fill="#FEF08A"/>
          <rect x="32" y="10" width="3.5" height="2" rx="1" fill="#FEF08A"/>
          <rect x="17" y="14" width="18" height="6.5" rx="1.5" fill="url(#glassGrad)"/>
          <rect x="17" y="22" width="18" height="12" rx="2" fill="${accentColor}" opacity="0.95"/>
          <circle cx="26" cy="28" r="2.5" fill="#FFFFFF" opacity="0.7"/>
          <rect x="18" y="35.5" width="16" height="4.5" rx="1" fill="#0369A1"/>
          <rect x="16" y="42.5" width="3.5" height="1.5" rx="0.5" fill="#EF4444"/>
          <rect x="32.5" y="42.5" width="3.5" height="1.5" rx="0.5" fill="#EF4444"/>
        `;
    }

    return L.divIcon({
        className: 'cabi-marker-3d-vehicle',
        html: `
      <div style="
        position: relative;
        width: 52px;
        height: 52px;
        transform: translate(-50%, -50%) rotate(${bearing}deg);
        transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      ">
        <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="beamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8"/>
              <stop offset="100%" stop-color="#0284C7"/>
            </linearGradient>
          </defs>
          ${headlightBeam}
          ${chassisSvg}
        </svg>
      </div>
    `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

export const createPassengerIcon = () => {
    return L.divIcon({
        className: 'cabi-marker-passenger',
        html: `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(37, 99, 235, 0.2); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #0F172A; border: 2px solid #2563EB; box-shadow: 0 4px 12px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #38BDF8; box-shadow: 0 0 6px #38BDF8;"></div>
        </div>
      </div>
    `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

const createPickupIcon = () => {
    return L.divIcon({
        className: 'cabi-marker-pickup',
        html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); width: 90px; pointer-events: auto;">
        <!-- Pill Badge -->
        <div style="
          background: #0A0A0B;
          color: #10B981;
          border: 1.5px solid #10B981;
          border-radius: 3px;
          padding: 2px 7px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
          white-space: nowrap;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="width: 5px; height: 5px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
          <span>PICKUP</span>
        </div>
        <!-- Beacon Teardrop Pin -->
        <div style="position: relative; width: 32px; height: 32px;">
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.25);
          "></div>
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: #0A0A0B;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2.5px solid #D4AF37;
            box-shadow: 0 6px 16px rgba(0,0,0,0.55);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 13px;
              height: 13px;
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              border-radius: 50%;
              transform: rotate(45deg);
              box-shadow: 0 0 8px rgba(16,185,129,0.8);
            "></div>
          </div>
        </div>
        <div style="
          width: 14px;
          height: 4px;
          background: rgba(0,0,0,0.35);
          border-radius: 50%;
          margin-top: -2px;
          filter: blur(1px);
        "></div>
      </div>
    `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

const createDropoffIcon = () => {
    return L.divIcon({
        className: 'cabi-marker-dropoff',
        html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); width: 100px; pointer-events: auto;">
        <!-- Pill Badge -->
        <div style="
          background: #0A0A0B;
          color: #F59E0B;
          border: 1.5px solid #D4AF37;
          border-radius: 3px;
          padding: 2px 7px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
          white-space: nowrap;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="font-size: 10px;">🏁</span>
          <span>DESTINATION</span>
        </div>
        <!-- Destination Beacon Pin -->
        <div style="position: relative; width: 32px; height: 32px;">
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: rgba(245, 158, 11, 0.25);
          "></div>
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: #111827;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2.5px solid #F59E0B;
            box-shadow: 0 6px 16px rgba(0,0,0,0.55);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 13px;
              height: 13px;
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              border-radius: 50%;
              transform: rotate(45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 8px rgba(245,158,11,0.8);
            ">
              <div style="width: 4px; height: 4px; background: #0A0A0B; border-radius: 1px;"></div>
            </div>
          </div>
        </div>
        <div style="
          width: 14px;
          height: 4px;
          background: rgba(0,0,0,0.35);
          border-radius: 50%;
          margin-top: -2px;
          filter: blur(1px);
        "></div>
      </div>
    `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

const createHazardIcon = (title: string, delayText?: string, isClosure?: boolean) => {
    const isClose = !!isClosure;
    const borderColor = isClose ? '#EF4444' : '#F59E0B';
    const bgColor = isClose ? '#450A0A' : '#1C1917';
    const textColor = isClose ? '#FCA5A5' : '#FDE68A';
    const iconSymbol = isClose ? '⛔' : '⚠️';

    return L.divIcon({
        className: 'cabi-marker-hazard',
        html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <div style="
          background: ${bgColor};
          border: 1.5px solid ${borderColor};
          border-radius: 3px;
          padding: 3px 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.5);
          white-space: nowrap;
          color: ${textColor};
          font-family: inherit;
        ">
          <span style="font-size: 11px;">${iconSymbol}</span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.1;">
              ${title}
            </span>
            ${delayText ? `<span style="font-size: 8px; font-weight: 600; opacity: 0.85;">${delayText}</span>` : ''}
          </div>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid ${borderColor};
          margin-top: -1px;
        "></div>
      </div>
    `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

export const CabiMap: React.FC<CabiMapProps> = ({
    center = [-1.286389, 36.817223], // Nairobi, Kenya
    zoom = 13,
    markers = [],
    route,
    alternativeRoutes = [],
    trafficSegments = [],
    hazards = [],
    onSelectAlternativeRoute,
    onMapClick,
    height = '500px',
    className = '',
    showTraffic = false,
    directions = [],
    themeMode = 'auto',
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const alternativeRoutesLayerRef = useRef<L.LayerGroup | null>(null);
    const trafficSegmentsLayerRef = useRef<L.LayerGroup | null>(null);
    const hazardsLayerRef = useRef<L.LayerGroup | null>(null);
    const trafficLayerRef = useRef<L.TileLayer | null>(null);
    const baseTileLayerRef = useRef<L.TileLayer | null>(null);
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

        // High-reliability monochrome basemap with shaded greys:
        // Uses OpenStreetMap tiles with custom SVG/CSS filter matrices for crystal-clear
        // black/white/grey shaded streets without any third-party API key requirements.
        baseTileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        map.on('click', (e) => {
            onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        alternativeRoutesLayerRef.current = L.layerGroup().addTo(map);
        trafficSegmentsLayerRef.current = L.layerGroup().addTo(map);
        markersLayerRef.current = L.layerGroup().addTo(map);
        hazardsLayerRef.current = L.layerGroup().addTo(map);

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
                        icon = create3DVehicleIcon(
                            marker.category,
                            marker.bearing ?? 0,
                            marker.isMoving ?? true,
                            marker.categoryColor
                        );
                        break;
                    case 'passenger':
                        icon = createPassengerIcon();
                        break;
                    case 'pickup':
                        icon = createPickupIcon();
                        break;
                    case 'dropoff':
                        icon = createDropoffIcon();
                        break;
                    case 'hazard':
                        icon = createHazardIcon(
                            marker.hazardData?.title || 'Route Alert',
                            marker.hazardData?.delayText,
                            marker.hazardData?.isClosure
                        );
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

    // Update alternative routes (faint/translucent lines)
    useEffect(() => {
        if (!mapRef.current || !alternativeRoutesLayerRef.current) return;

        alternativeRoutesLayerRef.current.clearLayers();

        if (alternativeRoutes && alternativeRoutes.length > 0) {
            alternativeRoutes.forEach((alt, index) => {
                if (!alt.points || alt.points.length === 0) return;

                // Faint translucent alternative route (grey shaded)
                const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;
                const poly = L.polyline(alt.points, {
                    color: isDark ? '#64748B' : '#94A3B8',
                    weight: 4.0,
                    opacity: 0.40,
                    dashArray: '5, 8',
                    lineJoin: 'round',
                }).addTo(alternativeRoutesLayerRef.current!);

                poly.bindTooltip(
                    `<div style="font-size: 10px; font-weight: 800; font-family: sans-serif;">${alt.label} (${alt.extraTime})</div>`,
                    { sticky: true, className: 'cabi-route-tooltip' }
                );

                poly.on('click', () => {
                    onSelectAlternativeRoute?.(index);
                });
            });
        }
    }, [alternativeRoutes, onSelectAlternativeRoute]);

    // Update primary route and traffic segments
    useEffect(() => {
        if (!mapRef.current) return;

        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }

        if (trafficSegmentsLayerRef.current) {
            trafficSegmentsLayerRef.current.clearLayers();
        }

        if (route && route.length > 0) {
            // Base polyline (Gold arterial foundation)
            routeLayerRef.current = L.polyline(route, {
                color: '#D4AF37',
                weight: 5.5,
                opacity: 0.85,
                lineJoin: 'round',
            }).addTo(mapRef.current);

            // Overlay colored traffic congestion segments
            if (trafficSegments && trafficSegments.length > 0 && trafficSegmentsLayerRef.current) {
                trafficSegments.forEach((seg) => {
                    if (!seg.points || seg.points.length === 0) return;

                    let segColor = '#10B981'; // clear green
                    if (seg.status === 'moderate') segColor = '#F59E0B'; // moderate amber
                    else if (seg.status === 'heavy') segColor = '#EF4444'; // heavy red
                    else if (seg.status === 'closure') segColor = '#991B1B'; // closure

                    L.polyline(seg.points, {
                        color: segColor,
                        weight: 5.5,
                        opacity: 0.95,
                        lineJoin: 'round',
                        lineCap: 'round',
                    }).addTo(trafficSegmentsLayerRef.current!);
                });
            }

            // Fit bounds to show the entire route
            mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [50, 50],
                animate: false,
            });
        }
    }, [route, trafficSegments]);

    // Update route hazard markers
    useEffect(() => {
        if (!mapRef.current || !hazardsLayerRef.current) return;

        hazardsLayerRef.current.clearLayers();

        if (hazards && hazards.length > 0) {
            hazards.forEach((h) => {
                const icon = createHazardIcon(h.title, h.delayText, h.isClosure);
                L.marker(h.position, { icon }).addTo(hazardsLayerRef.current!);
            });
        }
    }, [hazards]);

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
            {/* Target purely by html.dark or html:not(.dark) without mutating Leaflet container classes */}
            <style jsx global>{`
                html.dark .leaflet-tile-pane {
                    filter: grayscale(100%) invert(92%) contrast(110%) brightness(82%);
                }
                html:not(.dark) .leaflet-tile-pane {
                    filter: grayscale(100%) contrast(92%) brightness(102%);
                }
            `}</style>
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
