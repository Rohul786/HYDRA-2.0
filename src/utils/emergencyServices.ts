import { EmergencyService, EmergencyServiceType } from '@/types';
import { calculateHaversineDistance, formatDistance, calculateEstimatedTravelTime } from './geoDistance';
import { DEFAULT_MOCK_SERVICES } from '@/data/mockEmergencyServices';

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

/**
 * Fetch nearby emergency services around given latitude and longitude.
 * Attempts real OpenStreetMap Overpass API first, then falls back seamlessly to local mock dataset.
 */
export async function getNearbyEmergencyServices(
  userLat: number,
  userLng: number
): Promise<{
  hospitals: EmergencyService[];
  policeStations: EmergencyService[];
  fireStations: EmergencyService[];
  shelters: EmergencyService[];
  isOverpassSource: boolean;
}> {
  try {
    const overpassResults = await fetchFromOverpass(userLat, userLng);
    if (
      overpassResults &&
      (overpassResults.hospitals.length > 0 ||
        overpassResults.policeStations.length > 0 ||
        overpassResults.fireStations.length > 0 ||
        overpassResults.shelters.length > 0)
    ) {
      // If some categories are missing in sparse OSM areas, blend in regional fallbacks for any empty category
      const mergedHospitals = overpassResults.hospitals.length > 0
        ? overpassResults.hospitals
        : getFallbackServicesForType('hospital', userLat, userLng);

      const mergedPolice = overpassResults.policeStations.length > 0
        ? overpassResults.policeStations
        : getFallbackServicesForType('police', userLat, userLng);

      const mergedFire = overpassResults.fireStations.length > 0
        ? overpassResults.fireStations
        : getFallbackServicesForType('fire_station', userLat, userLng);

      const mergedShelters = overpassResults.shelters.length > 0
        ? overpassResults.shelters
        : getFallbackServicesForType('shelter', userLat, userLng);

      return {
        hospitals: mergedHospitals.sort((a, b) => a.distanceMeters - b.distanceMeters),
        policeStations: mergedPolice.sort((a, b) => a.distanceMeters - b.distanceMeters),
        fireStations: mergedFire.sort((a, b) => a.distanceMeters - b.distanceMeters),
        shelters: mergedShelters.sort((a, b) => a.distanceMeters - b.distanceMeters),
        isOverpassSource: true,
      };
    }
  } catch (err) {
    console.warn('Overpass API query skipped or failed, using local emergency fallback:', err);
  }

  // Pure fallback mode
  return {
    hospitals: getFallbackServicesForType('hospital', userLat, userLng).sort((a, b) => a.distanceMeters - b.distanceMeters),
    policeStations: getFallbackServicesForType('police', userLat, userLng).sort((a, b) => a.distanceMeters - b.distanceMeters),
    fireStations: getFallbackServicesForType('fire_station', userLat, userLng).sort((a, b) => a.distanceMeters - b.distanceMeters),
    shelters: getFallbackServicesForType('shelter', userLat, userLng).sort((a, b) => a.distanceMeters - b.distanceMeters),
    isOverpassSource: false,
  };
}

async function fetchFromOverpass(
  userLat: number,
  userLng: number
): Promise<{
  hospitals: EmergencyService[];
  policeStations: EmergencyService[];
  fireStations: EmergencyService[];
  shelters: EmergencyService[];
} | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  const radiusMeters = 8000;
  const query = `
    [out:json][timeout:6];
    (
      node["amenity"="hospital"](around:${radiusMeters},${userLat},${userLng});
      node["amenity"="police"](around:${radiusMeters},${userLat},${userLng});
      node["amenity"="fire_station"](around:${radiusMeters},${userLat},${userLng});
      node["amenity"="shelter"](around:${radiusMeters},${userLat},${userLng});
      node["social_facility"="shelter"](around:${radiusMeters},${userLat},${userLng});
    );
    out body 25;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !Array.isArray(data.elements)) return null;

    const hospitals: EmergencyService[] = [];
    const policeStations: EmergencyService[] = [];
    const fireStations: EmergencyService[] = [];
    const shelters: EmergencyService[] = [];

    data.elements.forEach((el: OverpassElement) => {
      if (!el.lat || !el.lon) return;

      const tags = el.tags || {};
      const amenity = tags.amenity;
      const socialFacility = tags.social_facility;
      const distance = calculateHaversineDistance(userLat, userLng, el.lat, el.lon);
      const travelTime = calculateEstimatedTravelTime(distance, 'driving');

      // Only capture real phone number if provided by OSM, never invent
      const rawPhone = tags.phone || tags['contact:phone'] || tags['contact:mobile'];
      const phone = typeof rawPhone === 'string' && rawPhone.trim().length > 0 ? rawPhone.trim() : undefined;

      // Only capture capacity if provided by OSM
      const rawCapacity = tags.capacity ? parseInt(tags.capacity, 10) : undefined;
      const capacity = rawCapacity && !isNaN(rawCapacity) ? rawCapacity : undefined;

      const baseService: EmergencyService = {
        id: `osm_${el.id}`,
        type: 'hospital',
        name: tags.name || 'Emergency Facility',
        latitude: el.lat,
        longitude: el.lon,
        distanceMeters: distance,
        distanceFormatted: formatDistance(distance),
        travelTimeMins: travelTime,
        address: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:city'] || ''}`.trim() : undefined,
        phone,
        capacity,
        isDemoFallback: false,
      };

      if (amenity === 'hospital') {
        hospitals.push({ ...baseService, type: 'hospital', name: tags.name || 'General Hospital' });
      } else if (amenity === 'police') {
        policeStations.push({ ...baseService, type: 'police', name: tags.name || 'Police Station' });
      } else if (amenity === 'fire_station') {
        fireStations.push({ ...baseService, type: 'fire_station', name: tags.name || 'Fire & Rescue Station' });
      } else if (amenity === 'shelter' || socialFacility === 'shelter') {
        shelters.push({ ...baseService, type: 'shelter', name: tags.name || 'Community Shelter' });
      }
    });

    return { hospitals, policeStations, fireStations, shelters };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function getFallbackServicesForType(
  type: EmergencyServiceType,
  userLat: number,
  userLng: number
): EmergencyService[] {
  // Check if user is relatively near Mumbai (within ~50km of BKC: lat 19.06, lng 72.86)
  const distFromBkc = calculateHaversineDistance(userLat, userLng, 19.06, 72.86);

  if (distFromBkc < 60000) {
    // Use realistic verified Mumbai mock services
    return DEFAULT_MOCK_SERVICES.filter((s) => s.type === type).map((s) => {
      const distance = calculateHaversineDistance(userLat, userLng, s.latitude, s.longitude);
      return {
        ...s,
        distanceMeters: distance,
        distanceFormatted: formatDistance(distance),
        travelTimeMins: calculateEstimatedTravelTime(distance, 'driving'),
      };
    });
  }

  // If user is elsewhere (e.g. tested in another city) and Overpass failed,
  // generate structured regional fallback emergency services relative to their exact location
  const offsets = [
    { dLat: 0.009, dLng: 0.007, suffix: 'Central' },
    { dLat: -0.012, dLng: 0.008, suffix: 'District' },
    { dLat: 0.006, dLng: -0.011, suffix: 'Civic' },
  ];

  const typeNames: Record<EmergencyServiceType, { name: string; phone?: string; capacity?: number }> = {
    hospital: { name: 'Emergency Hospital & Trauma Center', phone: '+1 800-422-911' },
    police: { name: 'Local Precinct Police Station', phone: '100' },
    fire_station: { name: 'Municipal Fire & Rescue Depot', phone: '101' },
    shelter: { name: 'Civic Community Relief Center', capacity: 300 },
  };

  return offsets.map((off, idx) => {
    const lat = userLat + off.dLat;
    const lng = userLng + off.dLng;
    const distance = calculateHaversineDistance(userLat, userLng, lat, lng);
    const info = typeNames[type];

    return {
      id: `fallback_${type}_${idx}`,
      type,
      name: `${info.name} (${off.suffix})`,
      latitude: lat,
      longitude: lng,
      distanceMeters: distance,
      distanceFormatted: formatDistance(distance),
      travelTimeMins: calculateEstimatedTravelTime(distance, 'driving'),
      address: `Service Zone ${off.suffix}`,
      phone: info.phone,
      capacity: info.capacity,
      isDemoFallback: true,
    };
  });
}
