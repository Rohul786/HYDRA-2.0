'use client';

import { useFloodStore } from '@/store/useFloodStore';
import { MapPin, Navigation, Clock, ShieldAlert, CheckCircle2, Layers } from 'lucide-react';

export default function RouteInspector() {
  const { selectedTimeWindow, setTimeWindow, activeRoute, setActiveRoute, layerVisibility, toggleLayerVisibility } = useFloodStore();

  const timeWindows: ('0h' | '1h' | '2h' | '3h')[] = ['0h', '1h', '2h', '3h'];

  return (
    <div className="absolute top-6 right-6 z-10 w-80 flex flex-col gap-4">
      {/* Forecasting Control */}
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
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
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

      {/* Layer Toggles */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-5">
         <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          Map Layers
        </h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={layerVisibility.streets}
              onChange={() => toggleLayerVisibility('streets')}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Street Inundation
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={layerVisibility.drainage}
              onChange={() => toggleLayerVisibility('drainage')}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Drainage Network
          </label>
        </div>
      </div>

      {/* Route Navigation */}
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
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
              activeRoute === 'primary' || activeRoute === 'both'
                ? 'border-red-200 bg-red-50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-gray-800">Primary Route</div>
              <div className="text-xs text-red-600 font-medium mt-1">Blocked at BKC Road (+45 cm)</div>
              <div className="text-xs text-gray-500 mt-1">2.5 km • 25 mins</div>
            </div>
          </button>

          <button 
             onClick={() => setActiveRoute('alternate')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
              activeRoute === 'alternate' || activeRoute === 'both'
                ? 'border-green-200 bg-green-50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-gray-800">Alternate Route</div>
              <div className="text-xs text-green-700 font-medium mt-1">Clear via Western Express</div>
              <div className="text-xs text-gray-500 mt-1">3.2 km • 12 mins</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
