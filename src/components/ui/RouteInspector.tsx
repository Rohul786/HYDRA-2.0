'use client';

import { useState } from 'react';
import { useFloodStore, ExtendedLayerKey } from '@/store/useFloodStore';
import {
  MapPin,
  Navigation,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Layers,
  ChevronDown,
  Shield,
  Droplets,
} from 'lucide-react';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { LeadTimeWindow } from '@/types';

export default function RouteInspector() {
  const {
    activeMetro,
    selectedTimeWindow,
    setTimeWindow,
    rainfallIntensity,
    activeRoute,
    setActiveRoute,
    layerVisibility,
    toggleLayerVisibility,
  } = useFloodStore();

  const [emergencyLayersOpen, setEmergencyLayersOpen] = useState(false);

  const timeWindows: LeadTimeWindow[] = ['0h', '1h', '2h', '3h'];
  const activeConfig = METRO_CONFIGS[activeMetro];

  // Dynamic route descriptions based on metro
  const routeOrigins: Record<string, { start: string; dest: string; primaryMsg: string; altMsg: string }> = {
    mumbai: {
      start: 'Bandra Kurla Complex (BKC)',
      dest: 'CSM International Airport (T2)',
      primaryMsg: `Blocked at BKC Road (+${rainfallIntensity >= 40 ? 45 : 20} cm depth)`,
      altMsg: 'Clear via Western Express Flyover (+8 mins)',
    },
    delhi: {
      start: 'Connaught Place (Outer Circle)',
      dest: 'New Delhi Railway Station (Ajmeri Gate)',
      primaryMsg: `Submerged: Minto Road Underpass (+${rainfallIntensity >= 40 ? 90 : 35} cm depth)`,
      altMsg: 'Safe: Barakhamba & Elevated Ridge Road (Dry)',
    },
    chennai: {
      start: 'Velachery Main Road',
      dest: 'Chennai Airport (Meenambakkam)',
      primaryMsg: `Inundated: Velachery Lake Breach (+${rainfallIntensity >= 40 ? 55 : 25} cm depth)`,
      altMsg: 'Safe: 100 Feet Elevated Bypass Corridor',
    },
  };

  const currentRouteInfo = routeOrigins[activeMetro] || routeOrigins.mumbai;

  return (
    <div className="absolute top-6 right-6 z-10 w-80 flex flex-col gap-4 max-h-[calc(100vh-48px)] overflow-y-auto">
      {/* 1. Predictive Nowcast Horizon */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Predictive Nowcast
          </h3>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {activeConfig.name}
          </span>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeWindows.map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedTimeWindow === tw
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tw === '0h' ? 'Now' : `+${tw}`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hydraulic GIS Map Layers */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Hydraulic GIS Layers</span>
          </div>
        </h3>

        {/* Core Flood Nowcasting Layers */}
        <div className="flex flex-col gap-2.5 pb-3 border-b border-gray-100">
          <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layerVisibility.streets}
                onChange={() => toggleLayerVisibility('streets')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-bold">🌊 Street Inundation Depth</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">0-3h Lead</span>
          </label>

          <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layerVisibility.drainage}
                onChange={() => toggleLayerVisibility('drainage')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-bold">🚰 Drainage Graph &amp; Surcharge</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">1D Flow</span>
          </label>

          <div className="flex items-center gap-2 pt-1 text-[10px] text-gray-500">
            <Droplets className="w-3 h-3 text-blue-500" />
            <span>DEM Micro-topography coupled to drains</span>
          </div>
        </div>

        {/* Emergency Services & Flood Shelters */}
        <div className="pt-2.5">
          <button
            onClick={() => setEmergencyLayersOpen(!emergencyLayersOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer pb-1"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Flood Shelters &amp; Rescue Hubs
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transform transition-transform ${
                emergencyLayersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {emergencyLayersOpen && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
              {[
                { key: 'shelters' as ExtendedLayerKey, label: 'Evac Shelters', emoji: '🏠' },
                { key: 'hospitals' as ExtendedLayerKey, label: 'Hospitals', emoji: '🏥' },
                { key: 'police' as ExtendedLayerKey, label: 'Police', emoji: '👮' },
                { key: 'fire' as ExtendedLayerKey, label: 'Fire & Rescue', emoji: '🚒' },
              ].map((serv) => (
                <label
                  key={serv.key}
                  className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={layerVisibility[serv.key]}
                    onChange={() => toggleLayerVisibility(serv.key)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{serv.emoji}</span>
                  <span className="truncate font-medium">{serv.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Flood-Safe Route Navigation */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-green-600" />
          Flood-Safe Navigation
        </h3>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-700 font-bold truncate">
              {currentRouteInfo.start}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xs text-gray-700 font-bold truncate">
              {currentRouteInfo.dest}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => setActiveRoute('primary')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              activeRoute === 'primary' || activeRoute === 'both'
                ? 'border-red-200 bg-red-50/80 shadow-sm'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-gray-900">Primary Transit Route</div>
              <div className="text-[11px] text-red-700 font-semibold mt-0.5 leading-tight">
                {currentRouteInfo.primaryMsg}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">2.5 km • +35 mins delay</div>
            </div>
          </button>

          <button
            onClick={() => setActiveRoute('alternate')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              activeRoute === 'alternate' || activeRoute === 'both'
                ? 'border-green-200 bg-green-50/80 shadow-sm'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-gray-900">Flood-Safe Corridor</div>
              <div className="text-[11px] text-green-700 font-semibold mt-0.5 leading-tight">
                {currentRouteInfo.altMsg}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">3.2 km • 12 mins (Elevated Road)</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
