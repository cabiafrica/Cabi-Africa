import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    type: 'driver' | 'passenger' | 'pickup' | 'dropoff' | 'emergency' | 'custom';
    icon?: L.Icon;
    popup?: string;
    onClick?: () => void;
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

// Custom marker icons
const createDriverIcon = (isOnline = true) => {
    const color = isOnline ? '#10b981' : '#6b7280';
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
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
        background-color: #F59E0B;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const createPickupIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #10b981;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          background-color: white;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        "></div>
      </div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

const createEmergencyIcon = () => {
    return L.divIcon({
        className: 'custom-emergency-icon',
        html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.45);
          animation: pulse-emergency-ring 1.3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        "></div>
        <div style="
          background-color: #ef4444;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2.5px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(239, 68, 68, 0.85);
          z-index: 2;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes pulse-emergency-ring {
          0% { transform: scale(0.7); opacity: 0.95; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      </style>
    `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
    });
};

const createDropoffIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: #ef4444;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
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
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView(center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

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
                        icon = createDriverIcon(true);
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
                    case 'emergency':
                        icon = createEmergencyIcon();
                        break;
                    default:
                        icon = createDriverIcon(true);
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
                color: '#F59E0B',
                weight: 4,
                opacity: 0.8,
            }).addTo(mapRef.current);

            // Fit bounds to show the entire route
            mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [50, 50],
            });
        }
    }, [route]);

    return (
        <div
            ref={mapContainerRef}
            style={{ height, width: '100%' }}
            className={className}
        />
    );
};

export default CabiMap;
