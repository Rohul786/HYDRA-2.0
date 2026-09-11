'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFloodStore } from '@/store/useFloodStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { EmergencyService, EmergencyServiceType } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Navigation,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Droplets,
  CloudRain,
  Radio,
  Building2,
  Activity,
  Info,
  Layers,
  Loader2,
} from 'lucide-react';

import NowcastCard from './NowcastCard';
import DrainageRunoffCard from './DrainageRunoffCard';
import NearestMunicipalityCard from './NearestMunicipalityCard';
import MultiDisasterCard from './MultiDisasterCard';
import LocationController from './LocationController';
import ContinuousUpdateBanner from './ContinuousUpdateBanner';
import ForecastReliabilityCard from './ForecastReliabilityCard';
import UserProfileMenu from './UserProfileMenu';

export default function LiveOperationsDock() {
  const {
    activeMetro,
    rainfallIntensity,
    selectedTimeWindow,
    safetyStatus,
    nearbyServices,
    currentWeather,
    activeNavigationDestination,
    setActiveNavigationDestination,
    setMapCenterTarget,
    backendStatus,
    backendLatencyMs,
    checkBackendConnection,
    syncBackendWeather,
    liveSafeRoute,
    isCalculatingRoute,
    openDisclaimerModal,
    isDemoMode,
  } = useFloodStore();

  const { latitude, longitude } = useUserLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'municipal' | 'emergency'>('status');
  const [serviceFilter, setServiceFilter] = useState<'all' | EmergencyServiceType>('all');

  // Periodic health check and weather synchronization with backend
  useEffect(() => {
    checkBackendConnection();
    syncBackendWeather();
    const timer = setInterval(() => {
      checkBackendConnection();
    }, 25000);
    return () => clearInterval(timer);
  }, [checkBackendConnection, syncBackendWeather, activeMetro]);

  const config = METRO_CONFIGS[activeMetro];

  const handleDirections = (service: EmergencyService) => {
    setActiveNavigationDestination(service);
    setMapCenterTarget([service.latitude, service.longitude]);
  };

  const getGoogleMapsUrl = (service: EmergencyService) => {
    const originLat = latitude ?? config.center[0];
    const originLng = longitude ?? config.center[1];
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${service.latitude},${service.longitude}`;
  };

  // Aggregate all services for filtering
  const allServices: EmergencyService[] = [
    ...nearbyServices.hospitals,
    ...nearbyServices.shelters,
    ...nearbyServices.policeStations,
    ...nearbyServices.fireStations,
  ].sort((a, b) => a.distanceMeters - b.distanceMeters);

  const filteredServices = serviceFilter === 'all'
    ? allServices
    : allServices.filter((s) => s.type === serviceFilter);

  const getCategoryIcon = (type: EmergencyServiceType) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'shelter': return '🏠';
      case 'police': return '👮';
      case 'fire_station': return '🚒';
    }
  };

  return (
    <div
      className={`absolute top-6 left-6 z-20 transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-88 md:w-[420px]'
      }`}
    >
      {/* COLLAPSED PILL */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/80 p-2.5 flex flex-col items-center gap-3 hover:scale-105 transition-all cursor-pointer group"
          title="Expand Live HUD Dock"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-md">
            <Image
              src="/logo.png"
              alt="HYDRA Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
      )}

      {/* FULL EXPANDED OPERATIONS DOCK */}
      {!isCollapsed && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/70 overflow-hidden flex flex-col max-h-[calc(100vh-48px)] animate-in fade-in zoom-in-95 duration-200">
          {/* 1. Header & Live Telemetry Badge */}
          <div className="p-4 pb-3 border-b border-gray-100 bg-gradient-to-b from-gray-50/70 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-white shrink-0">
                  <Image
                    src="/logo.png"
                    alt="HYDRA Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base font-black tracking-tight text-gray-900 leading-none">
                      HYDRA
                    </h1>
                    <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md tracking-wider">
                      2.0
                    </span>
                    {backendStatus === 'connected' ? (
                      <span
                        className="flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200"
                        title={`FastAPI backend connected (${backendLatencyMs ?? 0}ms)`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        API {backendLatencyMs ? `${backendLatencyMs}ms` : 'LIVE'}
                      </span>
                    ) : backendStatus === 'connecting' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-spin"></span>
                        CONNECTING
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200"
                        title="Backend offline; using high-fidelity local physics surrogate fallback"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        STANDALONE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">
                    Urban Flood Nowcasting System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Safety Advisory / Disclaimer Button */}
                <button
                  onClick={openDisclaimerModal}
                  className="p-1.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors cursor-pointer"
                  title="View HYDRA Early Warning Disclaimer & Safety Information"
                >
                  <Info className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  title="Collapse Dock"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Data Watermark if in Demo Mode */}
            {isDemoMode && (
              <div className="mt-2 text-[10px] font-black uppercase text-purple-700 bg-purple-50 p-1.5 rounded-xl border border-purple-200 text-center tracking-wider animate-pulse">
                ⚡ DEMO / SIMULATED DATA ACTIVE (SIH PROTOTYPE)
              </div>
            )}

            {/* Citizen Profile & Emergency Alert Channels */}
            <div className="mt-2.5 flex items-center justify-between">
              <UserProfileMenu />
            </div>

            {/* Location Controller (GPS / Manual Selection) */}
            <div className="mt-2.5">
              <LocationController />
            </div>
          </div>

          {/* 2. Segmented Mode Controller (Tabs) */}
          <div className="flex items-center p-1.5 bg-gray-100/70 border-b border-gray-100 text-xs gap-1">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] ${
                activeTab === 'status'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Nowcast &amp; Risk</span>
            </button>
            <button
              onClick={() => setActiveTab('municipal')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] ${
                activeTab === 'municipal'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Municipal Dispatch</span>
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] ${
                activeTab === 'emergency'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>Rescue ({allServices.length})</span>
            </button>
          </div>

          {/* 3. Tab Body Container */}
          <div className="p-3.5 overflow-y-auto space-y-3.5 text-xs flex-1">
            {/* TAB 1: LIVE FLOOD STATUS & METEOROLOGY */}
            {activeTab === 'status' && (
              <>
                {/* Location Flood Risk Assessment Banner */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    safetyStatus.level === 'danger'
                      ? 'bg-red-50/90 border-red-200 text-red-950'
                      : safetyStatus.level === 'warning'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  }`}
                >
                  {safetyStatus.level === 'danger' ? (
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  ) : safetyStatus.level === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70 shadow-xs">
                        {safetyStatus.title}
                      </span>
                      {safetyStatus.waterDepthCm > 0 && (
                        <span className="text-[11px] font-black text-red-600">
                          +{safetyStatus.waterDepthCm} cm Depth
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold leading-snug mt-1">
                      {safetyStatus.message}
                    </p>
                    <div className="text-[10px] opacity-75 mt-1 font-mono">
                      Lead Time: {selectedTimeWindow} • {config.radarStation.split(' ')[0]} Nowcast
                    </div>
                  </div>
                </div>

                {/* 1. Probabilistic Rainfall Nowcast Card (30m, 60m, 120m) */}
                <NowcastCard />

                {/* 2. Runoff Estimation & Drainage Stress Card */}
                <DrainageRunoffCard />

                {/* 3. Continuous Observation & Downgrade Cycle Card */}
                <ContinuousUpdateBanner />

                {/* 4. Forecast Reliability & Accuracy Card */}
                <ForecastReliabilityCard />

                {/* Live Doppler & Atmospheric Telemetry */}
                <div className="bg-gray-50/90 rounded-2xl p-3 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                      Doppler Radar Telemetry
                    </span>
                    <span className="font-mono text-blue-700 font-black">
                      {rainfallIntensity} mm/hr
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                      <span className="text-[9px] text-gray-400 font-bold block">PRECIP</span>
                      <span className="text-sm font-black text-blue-600">
                        {rainfallIntensity}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono block">mm/hr</span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                      <span className="text-[9px] text-gray-400 font-bold block">AMBIENT</span>
                      <span className="text-sm font-black text-orange-600">
                        {Math.round(currentWeather.temp)}°C
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono block">surface</span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                      <span className="text-[9px] text-gray-400 font-bold block">TERRAIN DEM</span>
                      <span className="text-sm font-black text-gray-800">
                        {config.demRangeM[0]}-{config.demRangeM[1]}m
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono block">MSL Range</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 leading-tight pt-1 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Primary Outfall: <strong className="text-gray-700">{config.primaryOutfall}</strong></span>
                  </div>
                </div>

                {/* Active Evacuation Route Notice if set */}
                {activeNavigationDestination && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span>Active Evacuation Corridor</span>
                      </span>
                      <button
                        onClick={() => setActiveNavigationDestination(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="text-xs font-black text-gray-900">
                      {activeNavigationDestination.name}
                    </div>
                    <div className="text-[11px] text-gray-600 line-clamp-1">
                      {activeNavigationDestination.address}
                    </div>

                    {/* Live Pathfinding Telemetry from FastAPI /safe-route */}
                    {isCalculatingRoute && (
                      <div className="flex items-center gap-1.5 text-[10px] text-blue-700 bg-blue-100/60 p-1.5 rounded-lg font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Computing shortest road detour avoiding flooded zones...</span>
                      </div>
                    )}

                    {liveSafeRoute && !isCalculatingRoute && (
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 text-[11px] space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                          <span>🛡️ Dijkstra Safe Path</span>
                          <span className="font-mono">{liveSafeRoute.properties.distance_km} km</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Flooded nodes avoided:</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {liveSafeRoute.properties.flooded_segments_avoided} segments
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Engine calculation time:</span>
                          <span className="font-mono">
                            {liveSafeRoute.properties.calculation_time_ms} ms
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-emerald-800">
                        {liveSafeRoute
                          ? `${liveSafeRoute.properties.distance_km} km detour`
                          : `${activeNavigationDestination.distanceFormatted} away`}
                      </span>
                      <a
                        href={getGoogleMapsUrl(activeNavigationDestination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: MUNICIPAL RESPONSE & MULTI-HAZARD DISASTER WATCH */}
            {activeTab === 'municipal' && (
              <>
                <NearestMunicipalityCard />
                <MultiDisasterCard />
              </>
            )}

            {/* TAB 3: NEARBY EMERGENCY SERVICES (REAL VERIFIED ADDRESSES) */}
            {activeTab === 'emergency' && (
              <>
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { id: 'all' as const, label: 'All' },
                    { id: 'hospital' as const, label: '🏥 Hospitals' },
                    { id: 'shelter' as const, label: '🏠 Shelters' },
                    { id: 'police' as const, label: '👮 Police' },
                    { id: 'fire_station' as const, label: '🚒 Fire' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setServiceFilter(filter.id)}
                      className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        serviceFilter === filter.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Facility Cards */}
                <div className="space-y-2.5">
                  {filteredServices.map((service) => {
                    const isSelected = activeNavigationDestination?.id === service.id;

                    return (
                      <div
                        key={service.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50/60 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 bg-white shadow-xs'
                        }`}
                      >
                        {/* Header: Emoji, Name, Distance */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <span className="text-base shrink-0">
                              {getCategoryIcon(service.type)}
                            </span>
                            <div>
                              <h4 className="text-xs font-black text-gray-900 leading-tight">
                                {service.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                  {service.distanceFormatted}
                                </span>
                                {service.capacity && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {service.capacity} Beds/Cap
                                  </span>
                                )}
                                <span className="text-[9px] font-semibold text-emerald-600">
                                  ● 24/7 Active
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Real Verified Address */}
                        <div className="mt-2 text-[11px] text-gray-600 bg-gray-50/80 p-2 rounded-xl border border-gray-100 leading-relaxed font-normal">
                          <div className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">
                            Verified Address
                          </div>
                          {service.address}
                        </div>

                        {/* Actions: Directions & Call */}
                        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleDirections(service)}
                            className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-700 text-white shadow-xs'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Routing Active' : 'Evac Route'}</span>
                          </button>

                          {service.phone && (
                            <a
                              href={`tel:${service.phone.replace(/[^0-9+]/g, '')}`}
                              className="py-1.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              title={`Direct dial: ${service.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>
                          )}

                          <a
                            href={getGoogleMapsUrl(service)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 transition-colors"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
