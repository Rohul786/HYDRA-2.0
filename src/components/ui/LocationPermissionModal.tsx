'use client';

import React, { useState, useEffect } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  MapPin,
  ShieldCheck,
  Building2,
  Crosshair,
  AlertCircle,
  Loader2,
  X,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

export default function LocationPermissionModal() {
  const {
    locationPermissionModalOpen,
    closeLocationPermissionModal,
    userLocation,
    locationMode,
    activeMetro,
  } = useFloodStore();

  const { requestLocation, loading } = useUserLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!locationPermissionModalOpen) return null;

  const handleAllowGps = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hydra_location_prompt_handled', 'true');
    }
    requestLocation(true);
    closeLocationPermissionModal();
  };

  const handleSelectMetroManually = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hydra_location_prompt_handled', 'true');
    }
    closeLocationPermissionModal();
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hydra_location_prompt_handled', 'true');
    }
    closeLocationPermissionModal();
  };

  const isDenied = userLocation.permissionState === 'denied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-md border border-blue-100 bg-white p-1 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="HYDRA Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  Location Access
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Urban Safety
                </span>
              </div>
              <h2 className="text-base font-black text-gray-900 tracking-tight mt-0.5">
                Allow HYDRA to Detect Your Location?
              </h2>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-2xs border border-gray-100 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-gray-600 leading-relaxed">
            HYDRA 2.0 uses your location to compute hyper-local flood nowcasts and guide your immediate evacuation in extreme rainfall events.
          </p>

          {/* Benefits Grid */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100/80">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  Real-Time Rescue Proximity
                </h4>
                <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                  Instantly pinpoints the closest verified police stations, hospitals, and designated disaster relief shelters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  Street Waterlogging &amp; Safe Pathfinding
                </h4>
                <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                  Calculates exact water depth on your street and computes live evacuation routes bypassing flooded roads.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  Strict Privacy &amp; Zero Tracking
                </h4>
                <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                  GPS coordinates are evaluated locally in your browser session for disaster safety only.
                </p>
              </div>
            </div>
          </div>

          {/* If browser permission is blocked */}
          {isDenied && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="font-bold block">Browser Permission Blocked:</strong>
                Location access was previously blocked in your browser. Click the lock/info icon in your browser URL address bar, change <strong>Location</strong> to <strong>Allow</strong>, and refresh the page.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={handleSelectMetroManually}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Select Metro City Manually</span>
          </button>

          <button
            onClick={handleAllowGps}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Acquiring GPS...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Allow &amp; Detect My Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
