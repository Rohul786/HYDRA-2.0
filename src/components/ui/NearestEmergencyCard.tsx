'use client';

import React from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import {
  Phone,
  Navigation,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';

export default function NearestEmergencyCard() {
  const {
    nearbyServices,
    userLocation,
    setMapCenterTarget,
    setActiveNavigationDestination,
  } = useFloodStore();

  const nearestPolice = nearbyServices.policeStations[0] || null;
  const nearestHospital = nearbyServices.hospitals[0] || null;

  const handleViewOnMap = (lat: number, lng: number) => {
    setMapCenterTarget([lat, lng]);
  };

  const handleDirections = (service: any) => {
    setActiveNavigationDestination(service);
    setMapCenterTarget([service.latitude, service.longitude]);
  };

  const getDirectionsUrl = (destLat: number, destLng: number) => {
    const originLat = userLocation.latitude;
    const originLng = userLocation.longitude;
    if (originLat && originLng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🚨</span>
          <div>
            <h3 className="font-black text-xs text-gray-900 tracking-tight uppercase">
              Nearest Police &amp; Hospital
            </h3>
            <div className="text-[10px] text-gray-500 font-medium">
              {userLocation.isRealGps ? '📍 Near Your Current GPS Location' : '🏙️ Near Active Basin Coordinates'}
            </div>
          </div>
        </div>
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
          userLocation.isRealGps
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : 'text-blue-700 bg-blue-50 border-blue-100'
        }`}>
          {userLocation.isRealGps ? 'GPS Proximity' : 'Location-Aware'}
        </span>
      </div>

      <div className="space-y-2.5">
        {/* 1. NEAREST POLICE STATION */}
        {nearestPolice ? (
          <div className="bg-gradient-to-r from-blue-50/50 to-slate-50 p-3 rounded-2xl border border-blue-100/90 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">👮</span>
                <div>
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Nearest Police Station
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-900 leading-tight">
                    {nearestPolice.name}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shrink-0 shadow-2xs">
                {nearestPolice.distanceFormatted}
                {nearestPolice.travelTimeMins ? ` • ~${nearestPolice.travelTimeMins}m` : ''}
              </span>
            </div>

            {nearestPolice.address && (
              <div className="text-[11px] text-gray-600 bg-white/80 p-2 rounded-xl border border-blue-100/60 leading-relaxed font-medium">
                <span className="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">
                  Verified Address
                </span>
                {nearestPolice.address}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => handleViewOnMap(nearestPolice.latitude, nearestPolice.longitude)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="View Police Station on map"
              >
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>View on Map</span>
              </button>

              <a
                href={getDirectionsUrl(nearestPolice.latitude, nearestPolice.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                title="Get Google Maps directions"
              >
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>Directions</span>
              </a>

              {nearestPolice.phone && (
                <a
                  href={`tel:${nearestPolice.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`Call ${nearestPolice.name}`}
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/70 text-xs text-gray-500 flex items-center justify-between">
            <span>No verified police station detected in range</span>
            <a
              href={`https://www.google.com/maps/search/police+station/@${userLocation.latitude ?? 19.0626},${userLocation.longitude ?? 72.8626},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-bold text-[10px] hover:underline flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </a>
          </div>
        )}

        {/* 2. NEAREST HOSPITAL */}
        {nearestHospital ? (
          <div className="bg-gradient-to-r from-red-50/40 to-slate-50 p-3 rounded-2xl border border-red-100/90 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">🏥</span>
                <div>
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                    Nearest Hospital &amp; Trauma Center
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-900 leading-tight">
                    {nearestHospital.name}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-black text-red-700 bg-white px-2 py-0.5 rounded-md border border-red-200 shrink-0 shadow-2xs">
                {nearestHospital.distanceFormatted}
                {nearestHospital.travelTimeMins ? ` • ~${nearestHospital.travelTimeMins}m` : ''}
              </span>
            </div>

            {nearestHospital.address && (
              <div className="text-[11px] text-gray-600 bg-white/80 p-2 rounded-xl border border-red-100/60 leading-relaxed font-medium">
                <span className="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">
                  Verified Address
                </span>
                {nearestHospital.address}
              </div>
            )}

            {nearestHospital.capacity && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>24/7 Trauma Emergency • {nearestHospital.capacity} Verified Beds</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => handleViewOnMap(nearestHospital.latitude, nearestHospital.longitude)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-[11px] border border-red-200 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="View Hospital on map"
              >
                <MapPin className="w-3 h-3 text-red-600" />
                <span>View on Map</span>
              </button>

              <a
                href={getDirectionsUrl(nearestHospital.latitude, nearestHospital.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                title="Get Google Maps directions"
              >
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>Directions</span>
              </a>

              {nearestHospital.phone && (
                <a
                  href={`tel:${nearestHospital.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-1.5 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`Call ${nearestHospital.name}`}
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/70 text-xs text-gray-500 flex items-center justify-between">
            <span>No verified hospital detected in range</span>
            <a
              href={`https://www.google.com/maps/search/hospital/@${userLocation.latitude ?? 19.0626},${userLocation.longitude ?? 72.8626},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 font-bold text-[10px] hover:underline flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
