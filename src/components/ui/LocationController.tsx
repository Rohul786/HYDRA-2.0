'use client';

import React, { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { MapPin, Crosshair, Loader2, Navigation2, Check, ChevronDown } from 'lucide-react';

export const PRESET_ZONES: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  mumbai: [
    { name: 'Bandra Kurla Complex (BKC)', lat: 19.0626, lng: 72.8626 },
    { name: 'Dadar TT / Hindmata', lat: 19.0178, lng: 72.8478 },
    { name: 'Santacruz / Milan Subway', lat: 19.0833, lng: 72.8428 },
    { name: 'Kurla West (Mithi Basin)', lat: 19.0726, lng: 72.8796 },
    { name: 'Andheri West (Veera Desai)', lat: 19.1352, lng: 72.8315 },
  ],
  delhi: [
    { name: 'Connaught Place (Inner Circle)', lat: 28.6328, lng: 77.2197 },
    { name: 'Minto Road Railway Bridge', lat: 28.6416, lng: 77.2258 },
    { name: 'ITO Junction / Vikas Marg', lat: 28.6304, lng: 77.2435 },
    { name: 'Pul Prahladpur Underpass', lat: 28.5115, lng: 77.2942 },
    { name: 'Kashmere Gate ISBT', lat: 28.6675, lng: 77.2285 },
  ],
  chennai: [
    { name: 'Velachery 100 Feet Road', lat: 12.9785, lng: 80.2185 },
    { name: 'Madipakkam Lake Margin', lat: 12.9642, lng: 80.1989 },
    { name: 'T. Nagar (Usman Road)', lat: 13.0418, lng: 80.2341 },
    { name: 'Saidapet / Adyar Riverbank', lat: 13.0213, lng: 80.2231 },
    { name: 'Vyasarpadi Jeeva Subway', lat: 13.1124, lng: 80.2589 },
  ],
};

export default function LocationController() {
  const {
    activeMetro,
    userLocation,
    setUserLocation,
    setMapCenterTarget,
    evaluateSafetyStatus,
  } = useFloodStore();

  const { loading: gpsLoading, requestLocation } = useUserLocation();
  const [showManualDropdown, setShowManualDropdown] = useState(false);

  const zones = PRESET_ZONES[activeMetro] || PRESET_ZONES.mumbai;
  const cfg = METRO_CONFIGS[activeMetro];

  const handleSelectPreset = (zone: { name: string; lat: number; lng: number }) => {
    setUserLocation({
      latitude: zone.lat,
      longitude: zone.lng,
      isRealGps: false,
    });
    setMapCenterTarget([zone.lat, zone.lng]);
    evaluateSafetyStatus(zone.lat, zone.lng);
    setShowManualDropdown(false);
  };

  const centerOnUser = () => {
    if (userLocation.latitude && userLocation.longitude) {
      setMapCenterTarget([userLocation.latitude, userLocation.longitude]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3 space-y-2.5 text-xs">
      {/* 1. Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin
            className={`w-3.5 h-3.5 shrink-0 ${
              userLocation.isRealGps ? 'text-blue-600' : 'text-gray-400'
            }`}
          />
          <span className="font-bold text-gray-800 text-[11px] truncate">
            {userLocation.isRealGps ? (
              <span className="text-blue-700">📍 Using your current location</span>
            ) : (
              <span>Location: {cfg.name}</span>
            )}
          </span>
        </div>

        {/* GPS Request Action */}
        <div className="flex items-center gap-1">
          <button
            onClick={requestLocation}
            disabled={gpsLoading}
            className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Request explicit browser geolocation"
          >
            {gpsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Crosshair className="w-3 h-3" />
            )}
            <span>{userLocation.isRealGps ? 'Retry GPS' : 'Enable GPS'}</span>
          </button>

          {userLocation.latitude && (
            <button
              onClick={centerOnUser}
              className="p-1 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              title="View current location on map"
            >
              <Navigation2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Manual Location Selection */}
      <div className="relative">
        <button
          onClick={() => setShowManualDropdown(!showManualDropdown)}
          className="w-full py-1.5 px-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold flex items-center justify-between text-[11px] border border-gray-200 transition-colors cursor-pointer"
        >
          <span>Manually Select Metro Zone ({zones.length} Presets)</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {showManualDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-30 max-h-48 overflow-y-auto animate-in fade-in duration-100">
            {zones.map((zone, idx) => {
              const isSelected =
                userLocation.latitude?.toFixed(4) === zone.lat.toFixed(4) &&
                userLocation.longitude?.toFixed(4) === zone.lng.toFixed(4);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(zone)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-gray-700'
                  }`}
                >
                  <span>{zone.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
