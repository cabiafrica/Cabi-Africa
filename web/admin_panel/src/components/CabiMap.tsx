import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../hooks/useTheme';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapMarker {
    id: string;
    position: [number, number];
    type: 'driver' | 'passenger' | 'pickup' | 'dropoff' | 'custom';
    icon?: L.Icon;
    popup?: string;
    onClick?: () => void;
    status?: 'online' | 'busy' | 'offline';
}

export interface CabiMapProps {
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    route?: [number, number][];
    onMapClick?: (lat: number, lng: number) => void;
    height?: string;
    className?: string;
}

// Custom marker icons with premium styling
const createDriverIcon = (status: 'online' | 'busy' | 'offline' = 'online') => {
    const color = status === 'online' ? '#FFD700' : status === 'busy' ? '#F59E0B' : '#94a3b8';
    const pulseClass = status === 'online' ? 'marker-pulse' : '';
    
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <style>
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${color}77; }
          70% { transform: scale(1); box-shadow: 0 0 0 10px ${color}00; }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 ${color}00; }
        }
        .marker-pulse {
          animation: pulse 2s infinite;
        }
      </style>
      <div class="${pulseClass}" style="
        background-color: #0F172A;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${color}">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const createPassengerIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #3b82f6;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

const createPickupIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #10b981;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const createDropoffIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #ef4444;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

export const CabiMap: React.FC<CabiMapProps> = ({
    center = [-1.286389, 36.817223],
    zoom = 13,
    markers = [],
    route,
    onMapClick,
    height = '500px',
    className = '',
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const { isDark } = useTheme();

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false // Custom zoom control styling can be added later
        }).setView(center, zoom);

        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, {
            attribution: '&copy; CARTO',
            maxZoom: 20,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        if (onMapClick) {
            map.on('click', (e) => {
                onMapClick(e.latlng.lat, e.latlng.lng);
            });
        }

        mapRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !tileLayerRef.current) return;
        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        tileLayerRef.current.setUrl(tileUrl);
    }, [isDark]);

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
                        icon = createDriverIcon(marker.status);
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
                    default:
                        icon = createDriverIcon('online');
                }
            }

            const leafletMarker = L.marker(marker.position, { icon }).addTo(
                markersLayerRef.current!
            );

            if (marker.popup) {
                leafletMarker.bindPopup(marker.popup, {
                    className: 'premium-popup'
                });
            }

            if (marker.onClick) {
                leafletMarker.on('click', marker.onClick);
            }
        });
    }, [markers]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }

        if (route && route.length > 0) {
            routeLayerRef.current = L.polyline(route, {
                color: '#FFD700',
                weight: 5,
                opacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '10, 10'
            }).addTo(mapRef.current);

            mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [50, 50],
            });
        }
    }, [route]);

    return (
        <div
            ref={mapContainerRef}
            style={{ height, width: '100%' }}
            className={`rounded-2xl overflow-hidden ${className}`}
        />
    );
};

export default CabiMap;

