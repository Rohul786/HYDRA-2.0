import { HazardItem, HazardSeverity } from '@/types';

// Curated active global disaster events across major world continents
export const PRE_SEEDED_GLOBAL_HAZARDS: HazardItem[] = [
  {
    id: 'global_tokyo_typhoon',
    type: 'cyclone',
    name: 'Typhoon Outer Rainband & Storm Surge',
    severity: 'high',
    riskScore: 82,
    latitude: 35.6762,
    longitude: 139.6503,
    radius: 45000,
    timestamp: 'JMA Tropical Cyclone Warning',
    description: 'Severe tropical storm approaching Tokyo Bay with gusts up to 110 km/h and localized river swelling.',
    recommendedAction: 'Move away from coastal lowlands. Secure windows and monitor municipal evacuation advisories.',
  },
  {
    id: 'global_miami_flood',
    type: 'flood',
    name: 'South Florida King Tide Coastal Inundation',
    severity: 'moderate',
    riskScore: 64,
    latitude: 25.7617,
    longitude: -80.1918,
    radius: 12000,
    timestamp: 'NOAA Coastal Flood Advisory',
    description: 'High astronomical tide coupled with persistent onshore flow inundating low-lying streets in Miami Beach.',
    recommendedAction: 'Avoid driving through saltwater puddles. Park vehicles on elevated structures.',
  },
  {
    id: 'global_jakarta_rainfall',
    type: 'extreme_rainfall',
    name: 'Monsoon Convective Downburst Cell',
    severity: 'critical',
    riskScore: 91,
    latitude: -6.2088,
    longitude: 106.8456,
    radius: 18000,
    timestamp: 'BMKG Torrential Rainfall Alert',
    description: 'Severe cloudburst exceeding 75 mm/hr overloading Ciliwung River channels.',
    recommendedAction: 'Activate neighborhood water gates. Move valuables above ground floor level.',
  },
  {
    id: 'global_london_heatwave',
    type: 'heatwave',
    name: 'Western European Thermal Dome',
    severity: 'moderate',
    riskScore: 56,
    latitude: 51.5074,
    longitude: -0.1278,
    radius: 35000,
    timestamp: 'UK Met Office Amber Heat Alert',
    description: 'Persistent high pressure ridge driving urban temperatures above 34°C with high UV index.',
    recommendedAction: 'Stay hydrated, utilize shaded public cooling zones, avoid unventilated subway lines during peak hours.',
  },
  {
    id: 'global_sydney_wildfire',
    type: 'wildfire',
    name: 'Blue Mountains Bushfire Smoke Corridor',
    severity: 'moderate',
    riskScore: 68,
    latitude: -33.8688,
    longitude: 151.2093,
    radius: 30000,
    timestamp: 'NSW Rural Fire Service Watch',
    description: 'Elevated fire danger index due to hot gusty westerly winds and dry eucalyptus forest vegetation.',
    recommendedAction: 'Implement bushfire survival plans. Keep respirators ready if smoke haze increases.',
  },
  {
    id: 'global_manila_storm',
    type: 'severe_storm',
    name: 'Luzon Squall Line & Urban Flash Flood Watch',
    severity: 'high',
    riskScore: 78,
    latitude: 14.5995,
    longitude: 120.9842,
    radius: 20000,
    timestamp: 'PAGASA Severe Weather Bulletin',
    description: 'Intense thunderstorm line causing rapid ponding along Epifanio de los Santos Avenue (EDSA).',
    recommendedAction: 'Motorists advised to divert away from underpasses. Stay alert to rising floodwaters.',
  },
  {
    id: 'global_pacific_tsunami',
    type: 'tsunami',
    name: 'Pacific Ring of Fire Coastal Swell Advisory',
    severity: 'low',
    riskScore: 24,
    latitude: -21.1789,
    longitude: -175.1982,
    radius: 80000,
    timestamp: 'PTWC Ocean Buoy Network',
    description: 'Minor sea level fluctuations registered following subsea tectonic adjustment.',
    recommendedAction: 'No destructive trans-oceanic tsunami generated. Coastal swimmers should heed local lifeguard warnings.',
  },
];

interface UsgsFeature {
  id: string;
  properties?: {
    mag?: number;
    place?: string;
    time?: number;
  };
  geometry?: {
    coordinates?: [number, number, number];
  };
}

/**
 * Fetches live real-time earthquakes worldwide from USGS
 */
export async function fetchGlobalEarthquakes(): Promise<HazardItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data || !Array.isArray(data.features)) return [];

    // Take the top 30 most significant earthquakes in the last 24h
    return data.features.slice(0, 30).map((f: UsgsFeature) => {
      const mag = f.properties?.mag ?? 3.0;
      const coords = f.geometry?.coordinates || [0, 0];
      const lng = coords[0];
      const lat = coords[1];
      const place = f.properties?.place || 'Seismic Event';
      const timeStr = f.properties?.time ? new Date(f.properties.time).toLocaleTimeString() : 'Recent';

      let severity: HazardSeverity = 'low';
      let riskScore = Math.min(99, Math.round(mag * 12));

      if (mag >= 6.0) {
        severity = 'critical';
        riskScore = Math.min(99, Math.round(mag * 15));
      } else if (mag >= 5.0) {
        severity = 'high';
        riskScore = Math.round(mag * 14);
      } else if (mag >= 4.0) {
        severity = 'moderate';
        riskScore = Math.round(mag * 12);
      }

      const radiusMeters = Math.max(8000, Math.round(Math.pow(10, Math.min(mag, 6.5) * 0.45) * 600));

      return {
        id: `usgs_${f.id}`,
        type: 'earthquake',
        name: `M ${mag.toFixed(1)} Earthquake: ${place}`,
        severity,
        riskScore,
        latitude: lat,
        longitude: lng,
        radius: radiusMeters,
        timestamp: `USGS Live • ${timeStr}`,
        description: `Subsurface tectonic displacement at depth ${coords[2]?.toFixed(1) || '10'} km. Magnitude ${mag.toFixed(1)} recorded by global seismic sensors.`,
        recommendedAction: mag >= 5.0
          ? 'Drop, Cover, and Hold On. Inspect buildings for structural damage and watch for aftershocks.'
          : 'Monitor local geological survey advisories. Report any tremors or gas pipeline issues.',
      };
    });
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Fetches live weather conditions & generates meteorological hazards for any place on Earth
 */
export async function fetchLiveWeatherHazards(
  lat: number,
  lng: number,
  placeName = 'Current Location'
): Promise<{
  weather: {
    temp: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  };
  dynamicHazards: HazardItem[];
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        weather: { temp: 28, precipitation: 0, windSpeed: 10, condition: 'Normal' },
        dynamicHazards: [],
      };
    }

    const data = await res.json();
    const current = data.current || {};
    const temp = current.temperature_2m ?? 28;
    const precip = current.precipitation ?? current.rain ?? 0;
    const wind = current.wind_speed_10m ?? 8;

    const dynamicHazards: HazardItem[] = [];

    // Check extreme rainfall threshold (> 15 mm/hr)
    if (precip >= 15) {
      dynamicHazards.push({
        id: `live_rain_${lat.toFixed(2)}_${lng.toFixed(2)}`,
        type: 'extreme_rainfall',
        name: `Intense Precipitation Cell (${placeName})`,
        severity: precip >= 35 ? 'critical' : 'high',
        riskScore: Math.min(98, Math.round(precip * 2.2)),
        latitude: lat,
        longitude: lng,
        radius: 3500,
        timestamp: 'Live Open-Meteo Satellite Doppler',
        description: `Heavy downpour recording ${precip} mm/hr. Potential for flash urban waterlogging and storm drain overflow.`,
        recommendedAction: 'Avoid low underpasses and underground basements. Divert to elevated arterial roads.',
      });
    }

    // Check severe wind storm (> 50 km/h)
    if (wind >= 50) {
      dynamicHazards.push({
        id: `live_storm_${lat.toFixed(2)}_${lng.toFixed(2)}`,
        type: 'severe_storm',
        name: `High Wind Squall Alert (${placeName})`,
        severity: wind >= 75 ? 'critical' : 'high',
        riskScore: Math.min(95, Math.round(wind * 1.1)),
        latitude: lat,
        longitude: lng,
        radius: 6000,
        timestamp: 'Live Atmospheric Radar',
        description: `Sustained gale winds measuring ${wind} km/h with dangerous gust potential.`,
        recommendedAction: 'Secure loose outdoor items. Stay clear of high trees, bill-boards, and power cables.',
      });
    }

    // Check extreme heatwave (> 38°C)
    if (temp >= 38) {
      dynamicHazards.push({
        id: `live_heat_${lat.toFixed(2)}_${lng.toFixed(2)}`,
        type: 'heatwave',
        name: `Thermal Stress Heatwave (${placeName})`,
        severity: temp >= 42 ? 'critical' : 'moderate',
        riskScore: Math.min(92, Math.round((temp - 30) * 8)),
        latitude: lat,
        longitude: lng,
        radius: 8000,
        timestamp: 'Live Meteorological Station',
        description: `Ambient dry-bulb temperature reached ${temp}°C, causing acute heat exhaustion risk.`,
        recommendedAction: 'Limit strenuous outdoor activity, maintain high electrolyte intake, and visit air-cooled facilities.',
      });
    }

    return {
      weather: {
        temp,
        precipitation: precip,
        windSpeed: wind,
        condition: precip > 10 ? 'Heavy Rain' : precip > 0 ? 'Light Rain' : wind > 40 ? 'Windy' : 'Clear',
      },
      dynamicHazards,
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      weather: { temp: 28, precipitation: 0, windSpeed: 10, condition: 'Normal' },
      dynamicHazards: [],
    };
  }
}
