'use client';

import React from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { RefreshCw, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContinuousUpdateBanner() {
  const { updateCycle, alertLevel, downgradeAlertState } = useFloodStore();

  const isDowngraded = alertLevel === 'DOWNGRADED';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3 space-y-2.5 text-xs">
      {/* State Machine Flow Indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
          Continuous Recalculation Cycle
        </span>
        <span className="text-[10px] font-mono font-bold text-gray-400">
          Last Check: {updateCycle.lastRecalculatedAt}
        </span>
      </div>

      {/* Cycle Progression Pill Timeline */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100 text-[10px] font-mono">
        {updateCycle.cycleHistory.slice(-4).map((step, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-gray-400 font-bold">{step.timeLabel}</span>
            <span
              className={`font-black mt-0.5 ${
                step.status === 'CRITICAL'
                  ? 'text-red-600'
                  : step.status === 'PRE-ALERT'
                  ? 'text-orange-600'
                  : step.status === 'WATCH'
                  ? 'text-amber-600'
                  : step.status === 'DOWNGRADED'
                  ? 'text-purple-600'
                  : 'text-emerald-600'
              }`}
            >
              {step.probabilityPct}%
            </span>
            <span className="text-[8px] text-gray-500">{step.status}</span>
          </div>
        ))}
      </div>

      {/* Downgrade Banner if active */}
      {isDowngraded ? (
        <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Warning Downgraded</span>
            <p className="text-[11px] text-purple-800 leading-tight mt-0.5">
              Conditions have weakened. Previous warning has been downgraded to 38% probability.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-gray-500">
            System actively correlates radar trend with surface rain gauges.
          </span>
          <button
            onClick={() => downgradeAlertState()}
            className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            title="Simulate radar echo dissipation and downgrade warning"
          >
            <ArrowDownRight className="w-3 h-3" />
            <span>Simulate Downgrade</span>
          </button>
        </div>
      )}
    </div>
  );
}
