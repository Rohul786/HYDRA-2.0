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
  ChevronLeft,
  ChevronRight,
  Shield,
  Droplets,
  Route,
  Loader2,
  Cpu,
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
    requestSafeRoute,
    liveSafeRoute,
    isCalculatingRoute,
  } = useFloodStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [emergencyLayersOpen, setEmergencyLayersOpen] = useState(true);

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

  const corridorCoords: Record<string, { start: [number, number]; dest: [number, number] }> = {
    mumbai: { start: [19.0626, 72.8626], dest: [19.0990, 72.8745] },
    delhi: { start: [28.6328, 77.2197], dest: [28.6428, 77.2205] },
    chennai: { start: [12.9785, 80.2185], dest: [12.9997, 80.2376] },
  };

  const handleSelectRoute = (type: 'primary' | 'alternate') => {
    setActiveRoute(type);
    const coords = corridorCoords[activeMetro] || corridorCoords.mumbai;
    requestSafeRoute(
      coords.start[0],
      coords.start[1],
      coords.dest[0],
      coords.dest[1],
      type === 'alternate'
    );
  };

  const currentRouteInfo = routeOrigins[activeMetro] || routeOrigins.mumbai;

  if (isCollapsed) {
    return (
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-3 flex items-center gap-2.5 hover:scale-105 transition-all cursor-pointer group pointer-events-auto"
          title="Expand GIS Layers & Route Inspector"
        >
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black text-gray-900">GIS &amp; Routes</div>
            <div className="text-[10px] text-gray-400 font-semibold">{activeConfig.name} Corridor</div>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-6 right-6 z-20 w-80 md:w-88 flex flex-col gap-3 max-h-[calc(100vh-48px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Panel Top Header Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-gray-200/80 p-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-900 tracking-tight">
              GIS Layers &amp; Routing
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold">
              Coupled Hydraulic ML System
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Predictive Nowcast Horizon */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/70 p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Predictive Lead Time</span>
          </h4>
          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {activeConfig.name}
          </span>
        </div>
        <div className="flex bg-gray-100/80 p-1 rounded-xl">
          {timeWindows.map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedTimeWindow === tw
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tw === '0h' ? 'Now' : `+${tw}`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hydraulic GIS Map Layers */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-purple-600" />
            <span>Active Hydraulic Overlays</span>
          </h4>
        </div>

        {/* Core Flood Nowcasting Layers */}
        <div className="space-y-2 pb-2.5 border-b border-gray-100 text-xs">
          <label className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer select-none transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layerVisibility.streets}
                onChange={() => toggleLayerVisibility('streets')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span className="font-bold text-gray-800">🌊 Street Inundation Depth</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">0-3h Lead</span>
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer select-none transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layerVisibility.drainage}
                onChange={() => toggleLayerVisibility('drainage')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span className="font-bold text-gray-800">🚰 Drainage Flow &amp; Surcharge</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">1D SWMM</span>
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer select-none transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layerVisibility.hotspots}
                onChange={() => toggleLayerVisibility('hotspots')}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
              />
              <span className="font-bold text-gray-800">⚠️ Waterlogging Hotspots</span>
            </div>
            <span className="text-[10px] text-orange-600 font-mono font-bold">4 Levels</span>
          </label>

          <div className="flex items-center gap-1.5 px-2 text-[10px] text-gray-500 font-medium">
            <Droplets className="w-3 h-3 text-blue-500 shrink-0" />
            <span>Coupled to micro-DEM topography &amp; high tide</span>
          </div>
        </div>

        {/* Emergency Facilities Layer Filter */}
        <div className="pt-0.5">
          <button
            onClick={() => setEmergencyLayersOpen(!emergencyLayersOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer pb-1.5"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Map Markers: Verified Help Hubs</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transform transition-transform ${
                emergencyLayersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {emergencyLayersOpen && (
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {[
                { key: 'shelters' as ExtendedLayerKey, label: 'Evac Shelters', emoji: '🏠' },
                { key: 'hospitals' as ExtendedLayerKey, label: 'Hospitals', emoji: '🏥' },
                { key: 'police' as ExtendedLayerKey, label: 'Police Stations', emoji: '👮' },
                { key: 'fire' as ExtendedLayerKey, label: 'Fire & Rescue', emoji: '🚒' },
              ].map((serv) => (
                <label
                  key={serv.key}
                  className="flex items-center gap-1.5 text-xs text-gray-700 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={layerVisibility[serv.key]}
                    onChange={() => toggleLayerVisibility(serv.key)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span>{serv.emoji}</span>
                  <span className="truncate font-semibold text-[11px]">{serv.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Flood-Safe Route Navigation */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/70 p-4 space-y-3">
        <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time Evacuation Corridor</span>
        </h4>

        {/* Origin & Destination */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-bold text-gray-800 truncate text-[11px]">
              {currentRouteInfo.start}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50/60 p-2 rounded-xl border border-blue-100">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-bold text-blue-900 truncate text-[11px]">
              {currentRouteInfo.dest}
            </span>
          </div>
        </div>

        {/* Route Selectors */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => handleSelectRoute('primary')}
            className={`w-full flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeRoute === 'primary' || activeRoute === 'both'
                ? 'border-red-200 bg-red-50/80 shadow-xs'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-gray-900">Primary Transit Route</div>
              <div className="text-[11px] text-red-700 font-semibold mt-0.5 leading-tight">
                {currentRouteInfo.primaryMsg}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 font-mono">2.5 km • +35 mins delay</div>
            </div>
          </button>

          <button
            onClick={() => handleSelectRoute('alternate')}
            className={`w-full flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeRoute === 'alternate' || activeRoute === 'both'
                ? 'border-emerald-200 bg-emerald-50/80 shadow-xs'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-gray-900">Flood-Safe Elevated Corridor</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 leading-tight">
                {currentRouteInfo.altMsg}
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-1">3.2 km • 12 mins (Elevated Flyover)</div>
            </div>
          </button>
        </div>

        {/* Live Pathfinding Telemetry from Backend */}
        {isCalculatingRoute && (
          <div className="flex items-center gap-1.5 p-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-mono">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Calculating Dijkstra safe route via FastAPI...</span>
          </div>
        )}

        {liveSafeRoute && !isCalculatingRoute && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-black text-emerald-900">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-600" />
                <span>FastAPI Routing Engine</span>
              </span>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                {liveSafeRoute.properties.pathfinding_algorithm?.toUpperCase() || 'DIJKSTRA'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-600">
              <span>Path Distance:</span>
              <span className="font-bold text-emerald-800 font-mono">
                {liveSafeRoute.properties.distance_km} km ({liveSafeRoute.properties.nodes_count} nodes)
              </span>
            </div>
            {liveSafeRoute.properties.flooded_segments_avoided > 0 && (
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Flooded Segments Detoured:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {liveSafeRoute.properties.flooded_segments_avoided}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
              <span>Engine Latency:</span>
              <span>{liveSafeRoute.properties.calculation_time_ms} ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
