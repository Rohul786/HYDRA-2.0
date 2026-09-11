'use client';

import { useMemo, useEffect } from 'react';
import { Polyline, Tooltip, useMap } from 'react-leaflet';
import { useFloodStore } from '@/store/useFloodStore';
import L from 'leaflet';

export default function EvacuationRouteLayer() {
  const {
    activeNavigationDestination,
    userLocation,
    liveSafeRoute,
    isCalculatingRoute,
    backendStatus,
  } = useFloodStore();
  const map = useMap();

  const userLat = userLocation.latitude ?? 19.0596;
  const userLng = userLocation.longitude ?? 72.8626;

  // Extract coordinates: prefer real road network detour from FastAPI backend
  const positions: [number, number][] = useMemo(() => {
    if (!activeNavigationDestination) return [];

    // If backend provided detailed LineString geometry [lon, lat]
    if (
      liveSafeRoute &&
      liveSafeRoute.geometry &&
      liveSafeRoute.geometry.coordinates &&
      liveSafeRoute.geometry.coordinates.length > 1
    ) {
      return liveSafeRoute.geometry.coordinates.map(
        (pt) => [pt[1], pt[0]] as [number, number]
      );
    }

    // Direct fallback vector while pathfinding or offline
    return [
      [userLat, userLng],
      [activeNavigationDestination.latitude, activeNavigationDestination.longitude],
    ];
  }, [activeNavigationDestination, liveSafeRoute, userLat, userLng]);

  // Fit bounds when new evacuation route is activated
  useEffect(() => {
    if (activeNavigationDestination && positions.length >= 2) {
      try {
        const bounds = L.latLngBounds(positions);
        map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      } catch {
        // Safe catch if map is unmounting
      }
    }
  }, [activeNavigationDestination, positions, map]);

  if (!activeNavigationDestination || positions.length < 2) {
    return null;
  }

  const isRoadNetworkRoute =
    Boolean(liveSafeRoute && liveSafeRoute.geometry?.coordinates?.length > 2);
  const routeProps = liveSafeRoute?.properties;

  return (
    <>
      {/* Glow ambient underlay */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: isRoadNetworkRoute ? '#059669' : '#2563eb', // Emerald green for safe route, blue for direct
          weight: 9,
          opacity: 0.3,
        }}
      />

      {/* Main road transit path */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: isRoadNetworkRoute ? '#10b981' : '#1d4ed8',
          weight: 4,
          opacity: 0.95,
          dashArray: isRoadNetworkRoute ? undefined : '8, 8',
        }}
      >
        <Tooltip
          permanent
          direction="center"
          className="bg-white/95 text-slate-900 font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-lg border border-emerald-200"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 font-black text-emerald-800">
              <span>{isRoadNetworkRoute ? '🛡️ Safe Detour Corridor' : '📍 Direct Evacuation'}</span>
              {isCalculatingRoute && (
                <span className="text-[10px] text-blue-600 animate-pulse font-mono">(computing...)</span>
              )}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              {routeProps ? (
                <>
                  <b>{routeProps.distance_km} km</b> ({routeProps.distance_m}m)
                  {routeProps.flooded_segments_avoided > 0 && (
                    <span className="text-emerald-600 font-bold ml-1">
                      • Avoided {routeProps.flooded_segments_avoided} flooded zones
                    </span>
                  )}
                  {routeProps.calculation_time_ms && (
                    <span className="text-slate-400 font-mono text-[9px] ml-1">
                      [{routeProps.calculation_time_ms}ms]
                    </span>
                  )}
                </>
              ) : (
                <>
                  {activeNavigationDestination.distanceFormatted}
                  {activeNavigationDestination.travelTimeMins
                    ? ` • ~${activeNavigationDestination.travelTimeMins}m drive`
                    : ''}
                </>
              )}
            </div>
          </div>
        </Tooltip>
      </Polyline>
    </>
  );
}
