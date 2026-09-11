'use client';

import { useMemo } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useFloodStore } from '@/store/useFloodStore';
import { MOCK_HAZARDS, HAZARD_CONFIG } from '@/data/mockHazards';
import { HazardItem, HazardSeverity } from '@/types';
import { Clock, ShieldAlert } from 'lucide-react';

const SEVERITY_COLORS: Record<HazardSeverity, { stroke: string; fill: string; badge: string }> = {
  critical: { stroke: '#dc2626', fill: '#ef4444', badge: 'bg-red-100 text-red-800 border-red-200' },
  high: { stroke: '#ea580c', fill: '#f97316', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
  moderate: { stroke: '#d97706', fill: '#f59e0b', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  low: { stroke: '#16a34a', fill: '#22c55e', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function HazardMarkers() {
  const { layerVisibility, setSelectedHazard } = useFloodStore();

  const createHazardIcon = (hazard: HazardItem) => {
    const config = HAZARD_CONFIG[hazard.type];
    const sev = SEVERITY_COLORS[hazard.severity];

    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-115">
          <div class="w-9 h-9 rounded-full bg-white border-2 shadow-xl flex items-center justify-center text-lg animate-pulse"
               style="border-color: ${sev.stroke};">
            <span>${config.icon}</span>
          </div>
          <div class="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow"
               style="background-color: ${sev.stroke};">
            ${hazard.riskScore}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });
  };

  const activeHazards = useMemo(() => {
    return MOCK_HAZARDS.filter((hazard) => layerVisibility.hazards[hazard.type]);
  }, [layerVisibility.hazards]);

  return (
    <>
      {activeHazards.map((hazard) => {
        const sev = SEVERITY_COLORS[hazard.severity];
        const config = HAZARD_CONFIG[hazard.type];

        return (
          <div key={hazard.id}>
            <Circle
              center={[hazard.latitude, hazard.longitude]}
              radius={hazard.radius}
              pathOptions={{
                color: sev.stroke,
                fillColor: sev.fill,
                fillOpacity: 0.14,
                weight: 2,
                dashArray: hazard.severity === 'critical' ? '6, 6' : undefined,
              }}
            />
            <Marker
              position={[hazard.latitude, hazard.longitude]}
              icon={createHazardIcon(hazard)}
              eventHandlers={{
                click: () => {
                  setSelectedHazard(hazard);
                },
              }}
            >
              <Popup className="hazard-popup rounded-2xl shadow-xl">
                <div className="p-2 min-w-[240px] max-w-[300px]">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{config.icon}</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {config.label}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${sev.badge}`}>
                      {hazard.severity} Risk
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1">
                    {hazard.name}
                  </h4>

                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 bg-gray-50 p-1.5 rounded-lg mb-2">
                    <span>Risk Score: <strong className="text-red-600">{hazard.riskScore}/100</strong></span>
                    <span>Radius: {hazard.radius >= 1000 ? `${(hazard.radius / 1000).toFixed(1)} km` : `${hazard.radius} m`}</span>
                  </div>

                  <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">
                    {hazard.description}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{hazard.timestamp}</span>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-2 flex items-start gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-red-900 leading-snug">
                      <strong>Action:</strong> {hazard.recommendedAction}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}
    </>
  );
}
