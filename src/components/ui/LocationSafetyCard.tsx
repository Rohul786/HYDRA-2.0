'use client';

import { useUserLocation } from '@/hooks/useUserLocation';
import { useFloodStore } from '@/store/useFloodStore';
import {
  Crosshair,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  MapPin,
  Info,
  Droplets,
} from 'lucide-react';

export default function LocationSafetyCard() {
  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    isRealGps,
    requestLocation,
  } = useUserLocation();

  const { safetyStatus, activeMetro } = useFloodStore();

  const getSafetyBadge = () => {
    switch (safetyStatus.level) {
      case 'danger':
        return {
          icon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />,
          bg: 'bg-red-50 border-red-200',
          textColor: 'text-red-900',
          badgeBg: 'bg-red-600 text-white',
          title: safetyStatus.title || 'CRITICAL FLOOD',
          message: safetyStatus.message,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          bg: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-900',
          badgeBg: 'bg-amber-500 text-white',
          title: safetyStatus.title || 'CAUTION',
          message: safetyStatus.message,
        };
      case 'safe':
      default:
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />,
          bg: 'bg-emerald-50 border-emerald-200',
          textColor: 'text-emerald-900',
          badgeBg: 'bg-emerald-600 text-white',
          title: safetyStatus.title || 'SAFE',
          message: safetyStatus.message,
        };
    }
  };

  const badge = getSafetyBadge();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 max-w-sm w-80 flex flex-col gap-3">
      {/* Geolocation Trigger & Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${isRealGps ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className="text-xs font-semibold text-gray-700">
            {isRealGps ? 'Live GPS Location' : `${activeMetro.toUpperCase()} Metro Hub`}
          </span>
        </div>

        <button
          onClick={requestLocation}
          disabled={loading}
          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
          title="Detect GPS Location"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isRealGps ? 'Refresh GPS' : 'Locate Me'}</span>
            </>
          )}
        </button>
      </div>

      {/* Lat/Long & Accuracy */}
      {latitude && longitude && (
        <div className="text-[11px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex items-center justify-between">
          <span>
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
          {accuracy ? <span>±{Math.round(accuracy)}m</span> : <span>Verified Hub</span>}
        </div>
      )}

      {/* Permission Denied / Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-snug">{error}</p>
          </div>
          <button
            onClick={requestLocation}
            className="self-end flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* User Flood Safety Status Badge */}
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${badge.bg}`}>
        {badge.icon}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wide ${badge.badgeBg}`}
            >
              {badge.title}
            </span>
            {safetyStatus.waterDepthCm > 0 && (
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-600" />
                {safetyStatus.waterDepthCm} cm depth
              </span>
            )}
          </div>
          <span className={`text-xs font-medium leading-tight ${badge.textColor}`}>
            {badge.message}
          </span>
        </div>
      </div>
    </div>
  );
}
