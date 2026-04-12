import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// This is a common fix for an issue where the default marker icon doesn't appear
// when using Leaflet with module bundlers.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LiveMapProps {
  location: { lat: number; lng: number };
}

// A helper component to programmatically update the map's center view.
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center);
  }, [center, map]);
  return null;
};

export const LiveMap = ({ location }: LiveMapProps) => {
  const position: [number, number] = [location.lat, location.lng];

  return (
    <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%', borderRadius: '4px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      <Marker position={position}><Popup>Driver's current location.</Popup></Marker>
      <MapUpdater center={position} />
    </MapContainer>
  );
};