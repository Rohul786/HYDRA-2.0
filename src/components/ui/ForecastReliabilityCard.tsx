'use client';

import React from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { Award, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function ForecastReliabilityCard() {
  const { forecastReliability } = useFloodStore();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3 text-xs">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          <h3 className="font-black text-xs text-gray-900 tracking-tight">
            Forecast Reliability &amp; Accuracy
          </h3>
        </div>
        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          {forecastReliability.detectionRatePct}% Reliability Index
        </span>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
          <span className="text-[9px] font-bold text-gray-400 block uppercase">
            Validated Events
          </span>
          <span className="text-sm font-black text-gray-900 font-mono">
            {forecastReliability.historicalEventsCount}
          </span>
          <span className="text-[9px] text-gray-500 block">Monsoon Records</span>
        </div>

        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
          <span className="text-[9px] font-bold text-gray-400 block uppercase">
            Mean Lead Time
          </span>
          <span className="text-sm font-black text-blue-700 font-mono">
            {forecastReliability.meanLeadTimeMins} min
          </span>
          <span className="text-[9px] text-gray-500 block">Early Warning</span>
        </div>

        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
          <span className="text-[9px] font-bold text-gray-400 block uppercase">
            Mean Error
          </span>
          <span className="text-sm font-black text-emerald-700 font-mono">
            ±{forecastReliability.meanErrorPct}%
          </span>
          <span className="text-[9px] text-gray-500 block">Rainfall Depth</span>
        </div>
      </div>

      {/* 3. Recent Validated Predictions Log */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Recent Validations (Predicted vs Ground-Truth Gauge):
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {forecastReliability.recentEvaluations.map((item) => (
            <div
              key={item.eventId}
              className="p-2 rounded-xl border border-gray-100 bg-gray-50/70 text-[11px] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 font-mono text-[10px]">
                  {item.date} • {item.eventId}
                </span>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  {item.result}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600 text-[10px]">
                <span>
                  Predicted: <strong className="text-blue-700">{item.predictedRange}</strong>
                </span>
                <span>
                  Observed: <strong className="text-gray-900">{item.observedMm} mm/h</strong>
                </span>
                <span className="font-mono text-gray-500">
                  Err: {item.forecastErrorPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
