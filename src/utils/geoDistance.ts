/**
 * Haversine formula for calculating geographic distance between two coordinates
 */

const EARTH_RADIUS_METERS = 6371000;

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function calculateEstimatedTravelTime(distanceMeters: number, mode: 'driving' | 'walking' = 'driving'): number {
  const distanceKm = distanceMeters / 1000;
  // Driving avg 30 km/h in urban emergency conditions, Walking avg 5 km/h
  const speedKmh = mode === 'driving' ? 30 : 5;
  const minutes = Math.round((distanceKm / speedKmh) * 60);
  return Math.max(1, minutes);
}
