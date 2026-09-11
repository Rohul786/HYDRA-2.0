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
  Activity,
} from 'lucide-react';
import { HAZARD_CONFIG } from '@/data/mockHazards';
import { HazardType } from '@/types';

export default function RouteInspector() {
  const {
    selectedTimeWindow,
    setTimeWindow,
    activeRoute,
    setActiveRoute,
    layerVisibility,
    toggleLayerVisibility,
    toggleHazardLayer,
  } = useFloodStore();

  const [hazardLayersOpen, setHazardLayersOpen] = useState(false);
  const [emergencyLayersOpen, setEmergencyLayersOpen] = useState(false);

  const timeWindows: ('0h' | '1h' | '2h' | '3h')[] = ['0h', '1h', '2h', '3h'];

  const hazardKeys = Object.keys(HAZARD_CONFIG) as HazardType[];

  return (
    <div className="absolute top-6 right-6 z-10 w-80 flex flex-col gap-4 max-h-[calc(100vh-48px)] overflow-y-auto">
      {/* Forecasting Control (100% Preserved) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Predictive Nowcast
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeWindows.map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedTimeWindow === tw
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tw === '0h' ? 'Now' : `+${tw}`}
            </button>
          ))}
        </div>
      </div>

      {/* Map Layers (Preserved & Extended) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Map Layers</span>
          </div>
        </h3>

        {/* Core Flood Nowcasting Layers (Preserved) */}
        <div className="flex flex-col gap-2 pb-3 border-b border-gray-100">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layerVisibility.streets}
              onChange={() => toggleLayerVisibility('streets')}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-medium">Street Inundation</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layerVisibility.drainage}
              onChange={() => toggleLayerVisibility('drainage')}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-medium">Drainage Network</span>
          </label>
        </div>

        {/* Emergency Services Layer Toggles (New) */}
        <div className="pt-2.5 pb-2.5 border-b border-gray-100">
          <button
            onClick={() => setEmergencyLayersOpen(!emergencyLayersOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer pb-1"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Emergency Services
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
                { key: 'hospitals' as ExtendedLayerKey, label: 'Hospitals', emoji: '🏥' },
                { key: 'police' as ExtendedLayerKey, label: 'Police', emoji: '👮' },
                { key: 'fire' as ExtendedLayerKey, label: 'Fire Dept', emoji: '🚒' },
                { key: 'shelters' as ExtendedLayerKey, label: 'Shelters', emoji: '🏠' },
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
                  <span className="truncate">{serv.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Disaster Hazard Layers (New) */}
        <div className="pt-2.5">
          <button
            onClick={() => setHazardLayersOpen(!hazardLayersOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer pb-1"
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              Multi-Disaster Hazards
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transform transition-transform ${
                hazardLayersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {hazardLayersOpen && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
              {hazardKeys.map((hz) => {
                const conf = HAZARD_CONFIG[hz];
                return (
                  <label
                    key={hz}
                    className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={layerVisibility.hazards[hz] ?? false}
                      onChange={() => toggleHazardLayer(hz)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{conf.icon}</span>
                    <span className="truncate">{conf.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Route Navigation (100% Preserved) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-green-600" />
          Route Navigation
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">Bandra Kurla Complex</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 font-medium">Chhatrapati Shivaji Airport</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setActiveRoute('primary')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              activeRoute === 'primary' || activeRoute === 'both'
                ? 'border-red-200 bg-red-50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-gray-800">Primary Route</div>
              <div className="text-xs text-red-600 font-medium mt-1">
                Blocked at BKC Road (+45 cm)
              </div>
              <div className="text-xs text-gray-500 mt-1">2.5 km • 25 mins</div>
            </div>
          </button>

          <button
            onClick={() => setActiveRoute('alternate')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              activeRoute === 'alternate' || activeRoute === 'both'
                ? 'border-green-200 bg-green-50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-gray-800">Alternate Route</div>
              <div className="text-xs text-green-700 font-medium mt-1">
                Clear via Western Express
              </div>
              <div className="text-xs text-gray-500 mt-1">3.2 km • 12 mins</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
