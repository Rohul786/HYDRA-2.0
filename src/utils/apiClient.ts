import type {
  BackendHealthResponse,
  BackendSafeRouteFeature,
  BackendWeatherCurrentResponse,
} from '@/types';
import type { FeatureCollection } from 'geojson';

// Configuration: API base URL with fallback
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Running in browser
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/**
 * Standard fetch wrapper with timeout and robust error resilience.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * 1. Health Check Telemetry
 */
export async function checkBackendHealth(): Promise<{
  ok: boolean;
  data: BackendHealthResponse | null;
  latencyMs: number;
  error?: string;
}> {
  const start = performance.now();
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${baseUrl}/health`, {}, 4000);
    const latencyMs = Math.round(performance.now() - start);
    if (!res.ok) {
      return { ok: false, data: null, latencyMs, error: `HTTP ${res.status}` };
    }
    const data: BackendHealthResponse = await res.json();
    return { ok: data.status === 'healthy' || data.status === 'degraded', data, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return { ok: false, data: null, latencyMs, error: msg };
  }
}

/**
 * 2. Safe Routing API Endpoint
 * Computes shortest path avoiding flooded segments and manhole backflow surcharge.
 */
export interface SafeRouteParams {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  avoidFloods?: boolean;
  penaltyMultiplier?: number;
  algorithm?: 'dijkstra' | 'astar';
}

export async function fetchSafeRoute(
  params: SafeRouteParams
): Promise<{ success: boolean; route: BackendSafeRouteFeature | null; error?: string }> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams({
    start_lat: params.startLat.toString(),
    start_lon: params.startLon.toString(),
    end_lat: params.endLat.toString(),
    end_lon: params.endLon.toString(),
    avoid_floods: (params.avoidFloods ?? true).toString(),
    penalty_multiplier: (params.penaltyMultiplier ?? 100.0).toString(),
    algorithm: params.algorithm ?? 'dijkstra',
  });

  try {
    const res = await fetchWithTimeout(`${baseUrl}/safe-route?${query.toString()}`, {}, 10000);
    if (!res.ok) {
      return { success: false, route: null, error: `Routing failed (HTTP ${res.status})` };
    }
    const route: BackendSafeRouteFeature = await res.json();
    return { success: true, route };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Safe route network error';
    return { success: false, route: null, error: msg };
  }
}

/**
 * 3. Live Flood Risk Nowcasting GeoJSON
 */
export interface FloodRiskParams {
  location?: string;
  rainfallSource?: 'open-meteo' | 'imerg' | 'synthetic';
  stormSeverity?: 'moderate' | 'heavy' | 'extreme';
  hoursBack?: number;
  forceRefresh?: boolean;
}

export async function fetchFloodRiskGeoJSON(
  params: FloodRiskParams = {}
): Promise<{ success: boolean; data: FeatureCollection | null; error?: string }> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams();
  if (params.location) query.set('location', params.location);
  if (params.rainfallSource) query.set('rainfall_source', params.rainfallSource);
  if (params.stormSeverity) query.set('storm_severity', params.stormSeverity);
  if (params.hoursBack) query.set('hours_back', params.hoursBack.toString());
  if (params.forceRefresh) query.set('force_refresh', 'true');

  try {
    const res = await fetchWithTimeout(`${baseUrl}/flood-risk?${query.toString()}`, {}, 15000);
    if (!res.ok) {
      return { success: false, data: null, error: `Flood risk HTTP ${res.status}` };
    }
    const data: FeatureCollection = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Flood risk request error';
    return { success: false, data: null, error: msg };
  }
}

/**
 * 4. Rich Current Weather & Hourly Slice
 */
export async function fetchCurrentWeather(params: {
  lat?: number;
  lon?: number;
  location?: string;
}): Promise<{ success: boolean; data: BackendWeatherCurrentResponse | null; error?: string }> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams();
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lon !== undefined) query.set('lon', params.lon.toString());
  if (params.location) query.set('location', params.location);

  try {
    const res = await fetchWithTimeout(`${baseUrl}/weather/current?${query.toString()}`, {}, 6000);
    if (!res.ok) {
      return { success: false, data: null, error: `Weather HTTP ${res.status}` };
    }
    const data: BackendWeatherCurrentResponse = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Weather request error';
    return { success: false, data: null, error: msg };
  }
}

/**
 * 5. Live Doppler Radar Nowcast Frames
 */
export async function fetchRadarFrames(params: {
  lat?: number;
  lon?: number;
  location?: string;
}): Promise<{ success: boolean; frames: Array<{ time: number; path: string }> | null; error?: string }> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams();
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lon !== undefined) query.set('lon', params.lon.toString());
  if (params.location) query.set('location', params.location);

  try {
    const res = await fetchWithTimeout(`${baseUrl}/weather/radar?${query.toString()}`, {}, 6000);
    if (!res.ok) {
      return { success: false, frames: null, error: `Radar HTTP ${res.status}` };
    }
    const json = await res.json();
    return { success: true, frames: json.frames || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Radar request error';
    return { success: false, frames: null, error: msg };
  }
}
