'use client';

import React, { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { Droplets, Activity, Gauge, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { getExplainableRiskFactors } from '@/utils/explainableRisk';
import { METRO_CONFIGS } from '@/data/metroFloodData';

export default function DrainageRunoffCard() {
  const {
    runoffEstimate,
    drainageStress,
    rainfallIntensity,
    activeMetro,
    isDemoMode,
  } = useFloodStore();

  const [showExplanation, setShowExplanation] = useState(false);
  const cfg = METRO_CONFIGS[activeMetro];

  // Elevation midpoint from active config
  const avgElevation = (cfg.demRangeM[0] + cfg.demRangeM[1]) / 2;
  const explainable = getExplainableRiskFactors(
    rainfallIntensity,
    drainageStress.stressPct,
    avgElevation,
    runoffEstimate.imperviousAreaPct
  );

  const getStressBadgeClass = (classification: string) => {
    switch (classification) {
      case 'Critical':
        return 'bg-red-500/15 text-red-700 border-red-300';
      case 'High':
        return 'bg-orange-500/15 text-orange-700 border-orange-300';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      default:
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-blue-600" />
          <h3 className="font-black text-xs text-gray-900 tracking-tight">
            Runoff &amp; Drainage Stress Engine
          </h3>
        </div>
        {isDemoMode && (
          <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
            Demo / Simulated Data
          </span>
        )}
      </div>

      {/* 2. Runoff vs Capacity Telemetry Matrix */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
            Estimated Inflow Runoff
          </span>
          <div className="text-base font-black text-blue-900 font-mono mt-0.5">
            {runoffEstimate.runoffVolumeM3.toLocaleString()} <span className="text-xs font-normal text-gray-600">m³</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1 truncate">
            {runoffEstimate.rainfallMm}mm rain • C = {runoffEstimate.runoffCoefficient}
          </div>
        </div>

        <div className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-100">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
            Drainage Capacity
          </span>
          <div className="text-base font-black text-purple-900 font-mono mt-0.5">
            {Math.round((drainageStress.capacityLps * 3600) / 1000).toLocaleString()}{' '}
            <span className="text-xs font-normal text-gray-600">m³/hr</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            {drainageStress.pumpsOperatingCount}/{drainageStress.pumpsTotalCount} pumps active
          </div>
        </div>
      </div>

      {/* 3. Hydraulic Stress Meter */}
      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            <span>Drainage Network Stress</span>
          </span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getStressBadgeClass(drainageStress.classification)}`}>
            {drainageStress.stressPct}% ({drainageStress.classification})
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              drainageStress.stressPct >= 130
                ? 'bg-red-600'
                : drainageStress.stressPct >= 100
                ? 'bg-orange-500'
                : drainageStress.stressPct >= 75
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (drainageStress.stressPct / 180) * 100)}%` }}
          />
        </div>

        {drainageStress.potentialExcessM3 > 0 && (
          <div className="text-[10px] font-bold text-red-700 flex items-center justify-between pt-0.5">
            <span>Potential Surface Excess:</span>
            <span className="font-mono">+{drainageStress.potentialExcessM3.toLocaleString()} m³ overflow</span>
          </div>
        )}
      </div>

      {/* 4. Explainable Risk Score (WHY HIGH RISK?) */}
      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full py-1.5 px-2 rounded-xl text-gray-700 hover:bg-gray-50 font-bold flex items-center justify-between text-xs transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-blue-700">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Explainable Risk Breakdown (Why {explainable.overallRisk}?)</span>
          </span>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showExplanation && (
          <div className="mt-2 space-y-1.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] animate-in fade-in duration-150">
            <div className="font-bold text-gray-800 text-xs mb-1">
              HYDRA Multi-Source Attribution:
            </div>
            {explainable.factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{factor.icon}</span>
                  <div>
                    <span className="font-bold text-gray-800 block leading-none">
                      {factor.label}
                    </span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      {factor.description}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                    factor.level === 'CRITICAL'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : factor.level === 'HIGH'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : factor.level === 'MODERATE'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {factor.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
