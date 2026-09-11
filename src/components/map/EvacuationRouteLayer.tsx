'use client';

import { useMemo } from 'react';
import { Polyline, Tooltip, useMap } from 'react-leaflet';
import { useFloodStore } from '@/store/useFloodStore';
import { useEffect } from 'react';
import L from 'leaflet';

export default function EvacuationRouteLayer() {
  const { activeNavigationDestination, userLocation } = useFloodStore();
  const map = useMap();

  const userLat = userLocation.latitude ?? 19.0596;
  const userLng = userLocation.longitude ?? 72.8626;

  const positions: [number, number][] = useMemo(() => {
    if (!activeNavigationDestination) return [];
    return [
      [userLat, userLng],
      [activeNavigationDestination.latitude, activeNavigationDestination.longitude],
    ];
  }, [activeNavigationDestination, userLat, userLng]);

  // Fit bounds when new evacuation route is activated
  useEffect(() => {
    if (activeNavigationDestination && positions.length === 2) {
      const bounds = L.latLngBounds(positions);
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 16 });
    }
  }, [activeNavigationDestination, positions, map]);

  if (!activeNavigationDestination || positions.length < 2) {
    return null;
  }

  return (
    <>
      {/* Glow background line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#2563eb',
          weight: 8,
          opacity: 0.35,
        }}
      />
      {/* Animated dashed evacuation polyline */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#1d4ed8',
          weight: 4,
          opacity: 0.95,
          dashArray: '8, 8',
        }}
      >
        <Tooltip permanent direction="center" className="bg-white/95 text-blue-900 font-bold text-xs px-2 py-1 rounded-lg shadow-md border border-blue-200">
          <span>
            {activeNavigationDestination.distanceFormatted}
            {activeNavigationDestination.travelTimeMins
              ? ` • ~${activeNavigationDestination.travelTimeMins}m travel`
              : ''}
          </span>
        </Tooltip>
      </Polyline>
    </>
  );
}
