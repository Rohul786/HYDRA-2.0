'use client';

import React, { useState, useEffect } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { MetroCity, LeadTimeWindow, TidalState } from '@/types';
import { Radio, Waves, Clock } from 'lucide-react';

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
    syncBackendFloodRisk,
    isSyncingFloodRisk,
    isDemoMode,
    toggleDemoMode,
  } = useFloodStore();

  const [currentTime, setCurrentTime] = useState<string>('');

  // Debounced background synchronization with backend flood risk pipeline
  useEffect(() => {
    const handler = setTimeout(() => {
      syncBackendFloodRisk();
    }, 1200);
    return () => clearTimeout(handler);
  }, [rainfallIntensity, activeMetro, syncBackendFloodRisk]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-slate-700/60 p-3 max-w-5xl w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
      {/* 1. Metro Basin Switcher */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50">
        {(['mumbai', 'delhi', 'chennai'] as MetroCity[]).map((cityKey) => {
          const cfg = METRO_CONFIGS[cityKey];
          const isActive = activeMetro === cityKey;
          return (
            <button
              key={cityKey}
              onClick={() => setActiveMetro(cityKey)}
              className={`px-3 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
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
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-blue-400 text-[11px] font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Doppler Radar:
              {isSyncingFloodRisk && (
                <span className="text-[9px] text-cyan-300 font-mono font-normal animate-pulse">
                  (syncing API nowcast...)
                </span>
              )}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono ${
                rainfallIntensity >= 60
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : rainfallIntensity >= 30
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}
            >
              {rainfallIntensity} mm/hr
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <span>{currentDbz} dBZ</span>
            <span>•</span>
            <span className="text-slate-300 font-bold">{activeConfig.radarStation.split(' ')[0]} DWR</span>
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
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setRainfallIntensity(80)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 transition-colors cursor-pointer"
              title="Cloudburst simulation (80 mm/hr)"
            >
              Cloudburst
            </button>
            <button
              onClick={() => setRainfallIntensity(45)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors cursor-pointer"
              title="Monsoonal Downpour (45 mm/hr)"
            >
              Heavy
            </button>
            <button
              onClick={() => setRainfallIntensity(0)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Dry weather (0 mm/hr)"
            >
              Dry
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tidal State (for coastal basins) */}
      {(activeMetro === 'mumbai' || activeMetro === 'chennai') && (
        <div className="flex items-center gap-1 shrink-0 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50">
          <span className="text-[10px] font-bold text-slate-400 px-1 flex items-center gap-1">
            <Waves className="w-3 h-3 text-cyan-400" />
            Tide:
          </span>
          {(['low_tide', 'normal', 'high_tide'] as TidalState[]).map((t) => (
            <button
              key={t}
              onClick={() => setTidalState(t)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                tidalState === t
                  ? t === 'high_tide'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'high_tide' ? 'High Tide ⚠️' : t === 'low_tide' ? 'Low' : 'Normal'}
            </button>
          ))}
        </div>
      )}

      {/* 4. Predictive Window Horizon */}
      <div className="flex items-center gap-1 shrink-0 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50">
        {(['0h', '1h', '2h', '3h'] as LeadTimeWindow[]).map((windowKey) => (
          <button
            key={windowKey}
            onClick={() => setTimeWindow(windowKey)}
            className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
              selectedTimeWindow === windowKey
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {windowKey === '0h' ? 'NOW' : `+${windowKey}`}
          </button>
        ))}
      </div>

      {/* 5. Demo Mode Toggle & Indicator (SIH Prototype) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggleDemoMode}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
            isDemoMode
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/40 animate-pulse'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
          }`}
          title="Toggle SIH presentation demo scenario (Simulated cloudburst & municipal surcharge)"
        >
          <span>⚡</span>
          <span>{isDemoMode ? 'DEMO ACTIVE' : 'DEMO MODE'}</span>
        </button>

        {isDemoMode && (
          <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
            SIMULATED DATA
          </span>
        )}
      </div>

      {/* 6. Live Digital Clock & Radar Link Ticker */}
      <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800 text-[11px] font-mono text-slate-400 shrink-0">
        <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-bold text-slate-200">{currentTime || 'LIVE'}</span>
      </div>
    </div>
  );
}
