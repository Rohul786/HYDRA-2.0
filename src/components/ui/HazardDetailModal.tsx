'use client';

import { useFloodStore } from '@/store/useFloodStore';
import { HAZARD_CONFIG } from '@/data/mockHazards';
import { X, ShieldAlert, Clock, Compass } from 'lucide-react';

export default function HazardDetailModal() {
  const { selectedHazard, setSelectedHazard } = useFloodStore();

  if (!selectedHazard) return null;

  const config = HAZARD_CONFIG[selectedHazard.type];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-5 w-88 animate-in slide-in-from-bottom-4 max-w-[calc(100vw-2rem)]">
      <button
        onClick={() => setSelectedHazard(null)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xl">{config.icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Disaster Advisory • {config.label}
        </span>
      </div>

      <div className="text-base font-bold text-gray-900 mb-2 leading-snug">
        {selectedHazard.name}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
            selectedHazard.severity === 'critical'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : selectedHazard.severity === 'high'
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : selectedHazard.severity === 'moderate'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {selectedHazard.severity} Severity
        </span>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          Risk Index: <strong className="text-red-600">{selectedHazard.riskScore}/100</strong>
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
        {selectedHazard.description}
      </p>

      <div className="space-y-2 border-t border-gray-100 pt-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span>{selectedHazard.timestamp}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Compass className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span>
            Coordinates: {selectedHazard.latitude.toFixed(4)}°N, {selectedHazard.longitude.toFixed(4)}°E (Radius: {selectedHazard.radius >= 1000 ? `${(selectedHazard.radius / 1000).toFixed(1)} km` : `${selectedHazard.radius}m`})
          </span>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs text-red-900 leading-snug">
          <strong className="block mb-0.5 font-bold">Recommended Safety Action:</strong>
          {selectedHazard.recommendedAction}
        </div>
      </div>
    </div>
  );
}
