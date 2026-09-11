'use client';

import { useMemo } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useFloodStore } from '@/store/useFloodStore';

export default function UserLocationMarker() {
  const { userLocation } = useFloodStore();

  const userIcon = useMemo(() => {
    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-60"></div>
          <div class="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="absolute -top-7 whitespace-nowrap bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-blue-400">
            📍 YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  if (!userLocation.latitude || !userLocation.longitude) {
    return null;
  }

  const latLng: [number, number] = [userLocation.latitude, userLocation.longitude];

  return (
    <>
      {userLocation.accuracy && userLocation.isRealGps && (
        <Circle
          center={latLng}
          radius={Math.min(userLocation.accuracy, 200)}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 1,
            dashArray: '4, 4',
          }}
        />
      )}
      <Marker position={latLng} icon={userIcon}>
        <Popup className="rounded-xl shadow-lg">
          <div className="p-1 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Your Location</div>
            <div className="text-sm font-semibold text-gray-900 mt-0.5">
              {userLocation.isRealGps ? 'Live GPS Coordinate' : 'Demo Location (BKC)'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
            </div>
            {userLocation.accuracy && (
              <div className="text-[11px] text-gray-400 mt-0.5">
                Accuracy: ±{Math.round(userLocation.accuracy)}m
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}
