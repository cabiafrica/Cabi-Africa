export interface Landmark {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
}

export const POPULAR_LANDMARKS: Landmark[] = [
  { id: '1', name: 'Nairobi CBD (Archives / Kencom)', code: 'CBD', latitude: -1.286389, longitude: 36.817223 },
  { id: '2', name: 'Westlands (Sarit / Westgate)', code: 'WESTLANDS', latitude: -1.2683, longitude: 36.8111 },
  { id: '3', name: 'JKIA Airport (Terminal 1)', code: 'JKIA', latitude: -1.3192, longitude: 36.9278 },
  { id: '4', name: 'Kilimani (Yaya Centre)', code: 'KILIMANI', latitude: -1.2975, longitude: 36.7907 },
  { id: '5', name: 'Upper Hill (Hospital Hub)', code: 'UPPERHILL', latitude: -1.2989, longitude: 36.8172 },
  { id: '6', name: 'Eastleigh (BBS Mall)', code: 'EASTLEIGH', latitude: -1.2778, longitude: 36.8528 },
  { id: '7', name: 'Ngong Road (Junction Mall)', code: 'JUNCTION', latitude: -1.3006, longitude: 36.7622 },
  { id: '8', name: 'Thika Road (TRM Mall)', code: 'TRM', latitude: -1.2186, longitude: 36.8883 },
  { id: '9', name: 'Wilson Airport / Langata', code: 'WILSON', latitude: -1.3217, longitude: 36.8147 },
  { id: '10', name: 'South B (Capital Centre)', code: 'SOUTHB', latitude: -1.3106, longitude: 36.8394 },
];

/**
 * Calculates Great-Circle distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates estimated fare in KES
 */
export function estimateOfflineFare(
  distanceKm: number,
  vehicleType: 'STANDARD' | 'BODA' = 'STANDARD',
): number {
  if (vehicleType === 'BODA') {
    const base = 80;
    const perKm = 20;
    return Math.max(100, Math.round(base + distanceKm * perKm));
  }
  // Standard Cab
  const base = 150;
  const perKm = 35;
  return Math.max(200, Math.round(base + distanceKm * perKm));
}

/**
 * Matches user selection (index number or text query) against landmarks
 */
export function resolveLandmark(query: string): Landmark | null {
  const clean = (query || '').trim().toLowerCase();
  if (!clean) return null;

  // Direct index match
  const byId = POPULAR_LANDMARKS.find((l) => l.id === clean);
  if (byId) return byId;

  // Code or substring match
  const byText = POPULAR_LANDMARKS.find(
    (l) =>
      l.code.toLowerCase() === clean ||
      l.name.toLowerCase().includes(clean) ||
      clean.includes(l.code.toLowerCase()),
  );
  if (byText) return byText;

  // Default fallback landmark for unmatched user entries (geocoded to Central Nairobi)
  return {
    id: `custom_${Date.now()}`,
    name: query.trim(),
    code: 'CUSTOM',
    latitude: -1.286389,
    longitude: 36.817223,
  };
}
