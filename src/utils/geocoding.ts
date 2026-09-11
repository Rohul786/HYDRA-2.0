/**
 * Worldwide geocoding utility using OpenStreetMap Nominatim
 */

export interface GeocodedPlace {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
}

interface NominatimResultItem {
  place_id: number;
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchWorldPlaces(query: string): Promise<GeocodedPlace[]> {
  if (!query || query.trim().length < 2) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: NominatimResultItem) => ({
      id: `place_${item.place_id}`,
      name: item.name || item.display_name.split(',')[0],
      fullName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

// Quick pre-set major global crisis monitoring hubs
export const GLOBAL_MONITORING_HUBS: GeocodedPlace[] = [
  { id: 'hub_mumbai', name: 'Mumbai, India', fullName: 'Bandra Kurla Complex, Mumbai, Maharashtra, India', latitude: 19.0596, longitude: 72.8626 },
  { id: 'hub_tokyo', name: 'Tokyo, Japan', fullName: 'Tokyo Metropolitan Region, Kanto, Japan', latitude: 35.6762, longitude: 139.6503 },
  { id: 'hub_miami', name: 'Miami, USA', fullName: 'Miami, Florida, United States', latitude: 25.7617, longitude: -80.1918 },
  { id: 'hub_jakarta', name: 'Jakarta, Indonesia', fullName: 'Special Capital Region of Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { id: 'hub_london', name: 'London, UK', fullName: 'Greater London, England, United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: 'hub_sydney', name: 'Sydney, Australia', fullName: 'Sydney, New South Wales, Australia', latitude: -33.8688, longitude: 151.2093 },
  { id: 'hub_manila', name: 'Manila, Philippines', fullName: 'Metro Manila, Philippines', latitude: 14.5995, longitude: 120.9842 },
];
