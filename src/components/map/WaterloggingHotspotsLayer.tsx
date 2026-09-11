'use client';

import React from 'react';
import { Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useFloodStore } from '@/store/useFloodStore';
import { WaterloggingHotspot } from '@/types';
import { AlertTriangle, Clock, Droplets, Building2, ShieldAlert } from 'lucide-react';

export default function WaterloggingHotspotsLayer() {
  const {
    waterloggingHotspots,
    layerVisibility,
    setSelectedHotspot,
    isDemoMode,
  } = useFloodStore();

  if (!layerVisibility.hotspots) return null;

  const getHotspotIcon = (risk: WaterloggingHotspot['riskLevel']) => {
    let color = '#16a34a'; // Green (Low)
    let ping = false;

    if (risk === 'critical') {
      color = '#dc2626'; // Red
      ping = true;
    } else if (risk === 'high') {
      color = '#ea580c'; // Orange
      ping = true;
    } else if (risk === 'moderate') {
      color = '#eab308'; // Yellow
    }

    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            ping
              ? `<div class="absolute w-7 h-7 rounded-full animate-ping opacity-60" style="background-color: ${color}"></div>`
              : ''
          }
          <div class="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white" style="background-color: ${color}">
            ▲
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const getRiskBadgeClass = (risk: WaterloggingHotspot['riskLevel']) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 border-orange-300';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-700 border-amber-300';
      default:
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <>
      {waterloggingHotspots.map((spot) => (
        <Marker
          key={spot.id}
          position={spot.coordinates}
          icon={getHotspotIcon(spot.riskLevel)}
          eventHandlers={{
            click: () => setSelectedHotspot(spot),
          }}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
            <div className="text-xs p-1">
              <div className="font-black text-gray-900 flex items-center gap-1.5">
                <span>⚠️ {spot.name}</span>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getRiskBadgeClass(spot.riskLevel)}`}>
                  {spot.riskLevel}
                </span>
              </div>
              <div className="text-[10px] text-gray-600 mt-1 space-y-0.5">
                <div>Rainfall: <b>{spot.rainfallRange}</b></div>
                <div>Drainage Stress: <b>{spot.drainageStressPct}%</b></div>
                <div>Impact: <b>~{spot.timeToImpactMins} mins</b></div>
              </div>
            </div>
          </Tooltip>

          <Popup className="hydra-hotspot-popup">
            <div className="p-1 max-w-xs text-xs space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    Predicted Hotspot
                  </span>
                  <h4 className="font-black text-gray-900 text-sm leading-snug">
                    {spot.name}
                  </h4>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getRiskBadgeClass(spot.riskLevel)}`}>
                  {spot.riskLevel} Risk
                </span>
              </div>

              {isDemoMode && (
                <div className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  Demo / Simulated Data
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block font-semibold">Est. Rainfall</span>
                  <span className="font-black text-blue-700">{spot.rainfallRange}</span>
                </div>
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block font-semibold">Est. Runoff</span>
                  <span className="font-black text-blue-900">{spot.expectedRunoffM3}</span>
                </div>
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block font-semibold">Drainage Stress</span>
                  <span className="font-black text-red-600">{spot.drainageStressPct}%</span>
                </div>
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block font-semibold">Water Depth</span>
                  <span className="font-black text-red-700">{spot.estimatedWaterDepthRangeM}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-600 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Lead Time: <strong>{spot.timeToImpactMins} min</strong></span>
                </span>
                <span className="font-bold text-gray-700">
                  Confidence: <span className="text-emerald-700">{spot.confidence}</span>
                </span>
              </div>

              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-[10px] space-y-1">
                <span className="font-bold text-gray-700 block flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  Nearby Critical Infrastructure:
                </span>
                <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                  {spot.nearbyCriticalInfrastructure.map((infra, idx) => (
                    <li key={idx} className="truncate">{infra}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] text-gray-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200/70 font-semibold leading-tight">
                <strong>Action:</strong> {spot.recommendedAction}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
