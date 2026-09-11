'use client';

import React from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { ACTIVE_DISASTER_EVENTS } from '@/utils/multiDisasterData';
import { Flame, CloudRain, Zap, Wind, Waves, AlertTriangle } from 'lucide-react';

export default function MultiDisasterCard() {
  const { activeMetro } = useFloodStore();

  const events = ACTIVE_DISASTER_EVENTS[activeMetro] || ACTIVE_DISASTER_EVENTS.mumbai;

  const getDisasterIcon = (type: string) => {
    switch (type) {
      case 'Flood':
      case 'Flash Flood':
        return <Waves className="w-3.5 h-3.5 text-blue-600" />;
      case 'Cloudburst Risk':
      case 'Extreme Rainfall':
        return <CloudRain className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Lightning':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'Cyclone':
      case 'Storm':
        return <Wind className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Heatwave':
        return <Flame className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-xs text-gray-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span>Multi-Hazard Disaster Watch ({events.length})</span>
        </h4>
        <span className="text-[10px] text-gray-400 font-mono font-bold">
          IMD / CWC / NDMA
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 text-[11px] space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-900 flex items-center gap-1.5">
                {getDisasterIcon(evt.type)}
                <span>{evt.type}</span>
              </span>
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getSeverityBadge(
                  evt.severity
                )}`}
              >
                {evt.severity}
              </span>
            </div>

            <div className="text-gray-700">
              Location: <strong>{evt.location}</strong>
            </div>

            <div className="text-[10px] text-gray-500 line-clamp-1">
              Area: {evt.affectedArea}
            </div>

            <div className="flex items-center justify-between text-[9px] text-gray-400 pt-0.5 border-t border-gray-200/50">
              <span>{evt.time} • Prob: <strong>{evt.probabilityPct}%</strong></span>
              <span className="truncate max-w-[150px]" title={evt.officialSource}>
                {evt.officialSource}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
