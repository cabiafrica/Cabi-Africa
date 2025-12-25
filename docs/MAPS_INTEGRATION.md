# Cabi Maps Integration Guide

## Overview

The Cabi platform uses a custom map system based on **OpenStreetMap** (OSM) that is free, open-source, and has no usage limits. This map system is integrated across all applications:

- **Driver App** (Flutter)
- **Passenger App** (Flutter)
- **Dispatch Panel** (React/Next.js)
- **Admin Panel** (React/Next.js)
- **User Portal** (React/Next.js)

## Why OpenStreetMap?

- ✅ **Free & Open Source** - No API keys or billing required
- ✅ **Unlimited Usage** - No request limits or quotas
- ✅ **Global Coverage** - Excellent coverage of Kenya and Nairobi
- ✅ **Privacy-Friendly** - No tracking or data collection
- ✅ **Customizable** - Full control over styling and features

## Architecture

### Flutter Apps (Driver & Passenger)

**Package**: `cabi_maps` (located in `libs/cabi_maps`)

**Dependencies**:
- `flutter_map`: ^6.1.0 - Flutter map widget
- `latlong2`: ^0.9.0 - Latitude/longitude utilities
- `http`: ^1.1.0 - HTTP requests

**Key Components**:
1. `CabiMap` - Main map widget
2. `CabiMapMarker` - Marker types (driver, passenger, pickup, dropoff)
3. `CabiMapController` - Programmatic map control

### Web Apps (Dispatch, Admin, User Portal)

**Component**: `CabiMap.tsx` (located in `apps/components`)

**Dependencies**:
- `leaflet`: ^1.9.4 - JavaScript map library
- `@types/leaflet`: ^1.9.8 - TypeScript definitions

**Features**:
- Custom marker icons for drivers, passengers, locations
- Route polylines
- Click handlers
- Responsive design

## Installation

### For Flutter Apps

1. Add dependency to `pubspec.yaml`:
```yaml
dependencies:
  cabi_maps:
    path: ../../libs/cabi_maps
```

2. Run:
```bash
flutter pub get
```

### For Web Apps

1. Install dependencies:
```bash
npm install leaflet @types/leaflet
# or
pnpm add leaflet @types/leaflet
```

2. Import the component:
```typescript
import { CabiMap } from '@/components/CabiMap';
```

## Usage Examples

### Flutter (Driver/Passenger App)

```dart
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';

// Basic map
CabiMap(
  initialCenter: LatLng(-1.286389, 36.817223), // Nairobi
  initialZoom: 13.0,
  markers: [
    CabiMapMarker.driver(
      position: LatLng(-1.286389, 36.817223),
      driverId: 'driver-123',
      isOnline: true,
    ),
    CabiMapMarker.passenger(
      position: LatLng(-1.290270, 36.821946),
    ),
  ],
  routePoints: [
    LatLng(-1.286389, 36.817223),
    LatLng(-1.290270, 36.821946),
  ],
  onTap: (position) {
    print('Tapped at: ${position.latitude}, ${position.longitude}');
  },
)
```

### React/Next.js (Dispatch/Admin Panel)

```typescript
import { CabiMap, MapMarker } from '@/components/CabiMap';

const markers: MapMarker[] = [
  {
    id: 'driver-1',
    position: [-1.286389, 36.817223],
    type: 'driver',
    popup: 'Driver: John K.',
    onClick: () => console.log('Driver clicked'),
  },
  {
    id: 'passenger-1',
    position: [-1.290270, 36.821946],
    type: 'passenger',
    popup: 'Passenger: Jane W.',
  },
];

const route: [number, number][] = [
  [-1.286389, 36.817223],
  [-1.290270, 36.821946],
];

<CabiMap
  center={[-1.286389, 36.817223]}
  zoom={13}
  markers={markers}
  route={route}
  onMapClick={(lat, lng) => console.log(`Clicked: ${lat}, ${lng}`)}
  height="600px"
/>
```

## Marker Types

### Flutter

- `CabiMapMarker.driver()` - Driver vehicle marker (green when online, grey when offline)
- `CabiMapMarker.passenger()` - Passenger marker (blue)
- `CabiMapMarker.pickup()` - Pickup location (green circle)
- `CabiMapMarker.dropoff()` - Dropoff location (red pin)
- `CabiMapMarker.custom()` - Custom marker with any icon

### React/TypeScript

- `type: 'driver'` - Driver vehicle marker
- `type: 'passenger'` - Passenger marker
- `type: 'pickup'` - Pickup location
- `type: 'dropoff'` - Dropoff location
- `type: 'custom'` - Custom marker

## Real-Time Integration

### Driver Location Updates

```dart
// Flutter - Update driver location
Stream<LatLng> locationStream = getDriverLocationStream();

locationStream.listen((newPosition) {
  setState(() {
    driverMarker = CabiMapMarker.driver(
      position: newPosition,
      driverId: 'driver-123',
      isOnline: true,
    );
  });
});
```

```typescript
// React - Update driver location
useEffect(() => {
  const subscription = subscribeToDriverLocation('driver-123', (position) => {
    setMarkers(prev => prev.map(m => 
      m.id === 'driver-123' 
        ? { ...m, position: [position.lat, position.lng] }
        : m
    ));
  });

  return () => subscription.unsubscribe();
}, []);
```

### Route Calculation

For route calculation between two points, you can use:

1. **OSRM (Open Source Routing Machine)** - Free routing service
   - API: `http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}`
   
2. **GraphHopper** - Free tier available
   - API: `https://graphhopper.com/api/1/route`

3. **Mapbox Directions API** - Free tier: 100,000 requests/month
   - API: `https://api.mapbox.com/directions/v5/mapbox/driving`

Example using OSRM:

```typescript
async function getRoute(start: [number, number], end: [number, number]) {
  const url = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.routes && data.routes[0]) {
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]: number[]) => [lat, lng] as [number, number]
    );
  }
  
  return [];
}
```

## Styling & Customization

### Custom Tile Layers

You can use different map styles:

```dart
// Flutter - Dark mode
TileLayer(
  urlTemplate: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  userAgentPackageName: 'com.cabi.app',
)
```

```typescript
// React - Satellite view
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri'
}).addTo(map);
```

### Popular Free Tile Providers

1. **OpenStreetMap** (Default)
   - URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
   - Best for: General purpose, detailed streets

2. **Stadia Maps** (Free tier: 200,000 tiles/month)
   - URL: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png`
   - Best for: Clean, modern look

3. **CartoDB** (Free)
   - URL: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
   - Best for: Minimal, light background

## Performance Optimization

### 1. Marker Clustering

For maps with many markers (e.g., dispatch panel showing all drivers):

```typescript
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup>
  {drivers.map(driver => (
    <Marker key={driver.id} position={driver.position} />
  ))}
</MarkerClusterGroup>
```

### 2. Lazy Loading

Only load map when needed:

```typescript
const MapComponent = dynamic(() => import('@/components/CabiMap'), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});
```

### 3. Debounce Updates

```typescript
const debouncedUpdateMarkers = useMemo(
  () => debounce((newMarkers) => setMarkers(newMarkers), 500),
  []
);
```

## Application-Specific Features

### Driver App
- Show current location
- Display route to pickup/dropoff
- Show nearby ride requests
- Navigation integration

### Passenger App
- Search for pickup/dropoff locations
- Show nearby drivers
- Display route and ETA
- Track driver in real-time

### Dispatch Panel
- View all active drivers
- Monitor ongoing trips
- Assign rides to drivers
- Heat map of demand

### Admin Panel
- Geographic analytics
- Driver distribution
- Service area management
- Route optimization

## Troubleshooting

### Map not displaying

1. Check internet connection (tiles are loaded from internet)
2. Verify tile URL is accessible
3. Check browser console for errors
4. Ensure container has explicit height

### Markers not showing

1. Verify marker positions are valid lat/lng
2. Check marker icon paths
3. Ensure markers are added to correct layer

### Performance issues

1. Implement marker clustering
2. Limit number of visible markers
3. Use debouncing for updates
4. Consider using WebGL for large datasets

## Future Enhancements

- [ ] Offline map support
- [ ] Custom map tiles for branding
- [ ] Traffic layer integration
- [ ] 3D building visualization
- [ ] Heat maps for demand analysis
- [ ] Geofencing capabilities
- [ ] Multi-stop route optimization

## Resources

- [OpenStreetMap](https://www.openstreetmap.org/)
- [Flutter Map Documentation](https://docs.fleaflet.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OSRM API](http://project-osrm.org/)
- [Nominatim (Geocoding)](https://nominatim.org/)

## Support

For issues or questions about the map integration, contact the development team or refer to the main project documentation.
