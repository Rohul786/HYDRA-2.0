'use client';

import React, { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { NowcastWindowKey } from '@/types';
import { CloudRain, AlertTriangle, Radio, ShieldAlert, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function NowcastCard() {
  const { nowcastData, extremeRainfall, isDemoMode, alertLevel } = useFloodStore();
  const [selectedWindow, setSelectedWindow] = useState<NowcastWindowKey>('60m');

  const currentWindowData = nowcastData[selectedWindow];

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-700 border-red-300';
      case 'PRE_ALERT':
        return 'bg-orange-500/15 text-orange-700 border-orange-300';
      case 'WATCH':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      default:
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3">
      {/* 1. Header & Source Transparency */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CloudRain className="w-4 h-4 text-blue-600" />
          <h3 className="font-black text-xs text-gray-900 tracking-tight">
            Rainfall Nowcast &amp; Early Warning
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {isDemoMode && (
            <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
              Demo / Simulated Data
            </span>
          )}
          <span className="text-[9px] font-mono text-gray-400">
            {currentWindowData.lastUpdated}
          </span>
        </div>
      </div>

      {/* 2. Window Horizon Tabs (30m, 60m, 120m) */}
      <div className="grid grid-cols-3 gap-1 bg-gray-100/70 p-1 rounded-xl text-xs">
        {(['30m', '60m', '120m'] as NowcastWindowKey[]).map((win) => {
          const isSelected = selectedWindow === win;
          const label = win === '30m' ? 'Next 30m' : win === '60m' ? 'Next 60m' : 'Next 120m';
          return (
            <button
              key={win}
              onClick={() => setSelectedWindow(win)}
              className={`py-1 rounded-lg font-black transition-all cursor-pointer text-[11px] ${
                isSelected
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Main Probabilistic Box */}
      <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-3.5 rounded-2xl border border-blue-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${getAlertBadgeColor(currentWindowData.alertType)}`}>
            {currentWindowData.alertType === 'CRITICAL'
              ? 'CRITICAL ALERT'
              : currentWindowData.alertType === 'PRE_ALERT'
              ? 'PRE-ALERT'
              : currentWindowData.alertType === 'WATCH'
              ? 'HEAVY RAINFALL WATCH'
              : 'MONITOR'}
          </span>
          <span className="text-[10px] font-semibold text-gray-600 font-mono">
            Horizon: <strong>{currentWindowData.timeWindow}</strong>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-white/90 p-2 rounded-xl border border-blue-100/80 text-center">
            <span className="text-[9px] font-bold text-gray-400 block uppercase">
              Expected Range
            </span>
            <span className="text-xs font-black text-blue-700 font-mono block mt-0.5">
              {currentWindowData.expectedRangeMmHr}
            </span>
            <span className="text-[9px] text-gray-500 font-semibold block">
              {currentWindowData.intensityLabel}
            </span>
          </div>

          <div className="bg-white/90 p-2 rounded-xl border border-blue-100/80 text-center">
            <span className="text-[9px] font-bold text-gray-400 block uppercase">
              Probability
            </span>
            <span className="text-base font-black text-indigo-700 font-mono block">
              {currentWindowData.probabilityPct}%
            </span>
            <span className="text-[9px] text-gray-500 font-semibold block">
              Likelihood
            </span>
          </div>

          <div className="bg-white/90 p-2 rounded-xl border border-blue-100/80 text-center">
            <span className="text-[9px] font-bold text-gray-400 block uppercase">
              Confidence
            </span>
            <span className="text-xs font-black text-emerald-700 block mt-0.5">
              {currentWindowData.confidence}
            </span>
            <span className="text-[9px] text-gray-500 font-semibold block">
              Ensemble Score
            </span>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 leading-tight pt-1 flex items-center justify-between border-t border-blue-100/60">
          <span className="truncate">
            Data Source: <strong className="text-gray-700">{currentWindowData.dataSource}</strong>
          </span>
          <span className="shrink-0 font-semibold text-blue-700">Estimated Nowcast</span>
        </div>
      </div>

      {/* 4. Extreme Convective / Cloudburst Warning Banner */}
      {extremeRainfall.detected && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent p-3 rounded-2xl border border-red-300 text-xs space-y-1.5 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="font-black text-red-800 flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>⚠️ {extremeRainfall.title.toUpperCase()}</span>
            </span>
            <span className="text-[10px] font-mono font-black text-red-700 bg-white/80 px-1.5 py-0.5 rounded">
              {extremeRainfall.probabilityPct}% Prob
            </span>
          </div>
          <div className="text-[11px] text-red-950 font-medium leading-tight">
            High-intensity convective cloudburst-tier precipitation cell detected. Estimated arrival in <strong>~{extremeRainfall.estimatedArrivalMins} mins</strong>.
          </div>
          <div className="text-[10px] text-red-700 font-mono flex items-center justify-between pt-0.5">
            <span>Heading: {extremeRainfall.movementDirection}</span>
            <span>Confidence: {extremeRainfall.confidence}</span>
          </div>
        </div>
      )}
    </div>
  );
}
