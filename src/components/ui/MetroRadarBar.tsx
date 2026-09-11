'use client';

import React from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { MetroCity, LeadTimeWindow, TidalState } from '@/types';

export default function MetroRadarBar() {
  const {
    activeMetro,
    setActiveMetro,
    rainfallIntensity,
    setRainfallIntensity,
    tidalState,
    setTidalState,
    selectedTimeWindow,
    setTimeWindow,
  } = useFloodStore();

  const activeConfig = METRO_CONFIGS[activeMetro];

  // Calculate equivalent Doppler reflectivity (dBZ)
  // Z = 200 * R^1.6  =>  dBZ = 10 * log10(Z)
  const calculateDbz = (r: number) => {
    if (r <= 0) return 0;
    const Z = 200 * Math.pow(r, 1.6);
    return Math.min(70, Math.round(10 * Math.log10(Z)));
  };

  const currentDbz = calculateDbz(rainfallIntensity);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-3 max-w-4xl w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
      {/* 1. Metro Basin Switcher */}
      <div className="flex items-center gap-1.5 shrink-0 bg-gray-50/80 p-1 rounded-xl border border-gray-200/60">
        {(['mumbai', 'delhi', 'chennai'] as MetroCity[]).map((cityKey) => {
          const cfg = METRO_CONFIGS[cityKey];
          const isActive = activeMetro === cityKey;
          return (
            <button
              key={cityKey}
              onClick={() => setActiveMetro(cityKey)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <span>{cityKey === 'mumbai' ? '🌊' : cityKey === 'delhi' ? '🏛️' : '🌊'}</span>
              <span>{cfg.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Doppler Radar Rainfall Slider & Intensity */}
      <div className="flex-1 flex flex-col justify-center px-2">
        <div className="flex items-center justify-between font-semibold mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-gray-700 font-bold">Doppler Radar Nowcast:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                rainfallIntensity >= 60
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : rainfallIntensity >= 30
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {rainfallIntensity} mm/hr
            </span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            {currentDbz} dBZ • {activeConfig.radarStation.split(' ')[0]}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={120}
            step={5}
            value={rainfallIntensity}
            onChange={(e) => setRainfallIntensity(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setRainfallIntensity(80)}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              title="Extreme Cloudburst: 80 mm/hr"
            >
              Cloudburst
            </button>
            <button
              onClick={() => setRainfallIntensity(45)}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              title="Heavy Monsoon: 45 mm/hr"
            >
              Heavy
            </button>
            <button
              onClick={() => setRainfallIntensity(0)}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="Clear: 0 mm/hr"
            >
              Dry
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tidal State (for coastal basins) */}
      {(activeMetro === 'mumbai' || activeMetro === 'chennai') && (
        <div className="flex items-center gap-1 shrink-0 bg-blue-50/50 p-1 rounded-xl border border-blue-100">
          <span className="text-[10px] font-bold text-blue-900 px-1">Tide:</span>
          {(['low_tide', 'normal', 'high_tide'] as TidalState[]).map((t) => (
            <button
              key={t}
              onClick={() => setTidalState(t)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                tidalState === t
                  ? t === 'high_tide'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              {t === 'high_tide' ? 'High Tide ⚠️' : t === 'low_tide' ? 'Low' : 'Normal'}
            </button>
          ))}
        </div>
      )}

      {/* 4. Predictive Window Horizon */}
      <div className="flex items-center gap-1 shrink-0 bg-gray-100/80 p-1 rounded-xl">
        {(['0h', '1h', '2h', '3h'] as LeadTimeWindow[]).map((windowKey) => (
          <button
            key={windowKey}
            onClick={() => setTimeWindow(windowKey)}
            className={`px-2.5 py-1 rounded-lg font-black transition-all ${
              selectedTimeWindow === windowKey
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {windowKey}
          </button>
        ))}
      </div>
    </div>
  );
}
