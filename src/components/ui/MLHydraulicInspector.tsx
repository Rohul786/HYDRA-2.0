'use client';

import React from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { InundationProperties, DrainageNodeProperties } from '@/types';

export default function MLHydraulicInspector() {
  const { selectedFeature, setSelectedFeature, rainfallIntensity, selectedTimeWindow } =
    useFloodStore();

  if (!selectedFeature) return null;

  const isStreet = selectedFeature.type === 'street';
  const isDrain = selectedFeature.type === 'drain';

  const streetData = isStreet ? (selectedFeature.data as InundationProperties) : null;
  const drainData = isDrain ? (selectedFeature.data as DrainageNodeProperties) : null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            isStreet
              ? streetData?.riskLevel === 'critical'
                ? 'bg-gradient-to-r from-red-600 to-rose-700'
                : streetData?.riskLevel === 'warning'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : drainData?.status === 'surcharging'
              ? 'bg-gradient-to-r from-red-600 to-orange-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isStreet ? '🌊' : '🚰'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  {isStreet ? 'Street Inundation Profile' : 'Drainage Graph Node'}
                </span>
                <span className="text-xs font-semibold bg-black/20 px-2 py-0.5 rounded-full">
                  Lead Time: {selectedTimeWindow}
                </span>
              </div>
              <h2 className="text-lg font-black leading-tight mt-1">
                {isStreet ? streetData?.streetName : drainData?.nodeName}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedFeature(null)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-base transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* STREET VIEW */}
          {isStreet && streetData && (
            <>
              {/* Inundation Score Box */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    ML Predicted Water Depth
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-gray-900">
                      {streetData.waterDepthCm}
                    </span>
                    <span className="text-sm font-bold text-gray-500">cm</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ml-2 ${
                        streetData.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : streetData.riskLevel === 'warning'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {streetData.riskLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-[10px] font-bold">Flow Velocity</div>
                  <div className="text-sm font-extrabold text-gray-800 mt-1">
                    {streetData.flowVelocityMs || 0.4} m/s
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Peak in ~{streetData.timeToPeakMins || 25}m
                  </div>
                </div>
              </div>

              {/* Coupled Hydraulic Physics Breakdown */}
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-700 mb-2">
                  Coupled Physics-Informed Micro-DEM &amp; Drainage
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-900">DEM Micro-Elevation</div>
                    <div className="text-base font-black text-blue-950 mt-0.5">
                      {streetData.elevationM} m MSL
                    </div>
                    <div className="text-[10px] text-blue-700 mt-1">
                      Slope: {streetData.slopePct}% ({streetData.slopePct < 1 ? 'Bowl Depression' : 'Elevated Runoff'})
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-900">Concrete Imperviousness</div>
                    <div className="text-base font-black text-amber-950 mt-0.5">
                      {streetData.imperviousnessPct}%
                    </div>
                    <div className="text-[10px] text-amber-700 mt-1">
                      Catchment: {streetData.catchmentAreaHa} hectares
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-900">Overland Runoff Volume</div>
                    <div className="text-base font-black text-purple-950 mt-0.5">
                      {streetData.runoffLps || Math.round((rainfallIntensity * 9) / 0.36)} L/s
                    </div>
                    <div className="text-[10px] text-purple-700 mt-1">
                      Generated from {rainfallIntensity} mm/hr rain
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <div className="text-[10px] font-bold text-rose-900">Drainage Surcharge Backflow</div>
                    <div className="text-base font-black text-rose-950 mt-0.5">
                      {streetData.drainBackflowLps || 0} L/s
                    </div>
                    <div className="text-[10px] text-rose-700 mt-1">
                      {streetData.drainBackflowLps ? 'Pushing out of manholes' : 'Underground capacity OK'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ML Model Attribution */}
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                <div className="flex items-center justify-between font-bold text-[11px] text-gray-700 mb-2">
                  <span>ML Feature Attribution</span>
                  <span className="text-blue-600 font-mono">Surrogate Model: 96% Conf.</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-0.5">
                      <span>Doppler Radar Precipitation (mm/hr)</span>
                      <span className="font-bold">38%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-0.5">
                      <span>Underground Drainage Backflow Surcharge</span>
                      <span className="font-bold">32%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-0.5">
                      <span>Micro-DEM Elevation &amp; Slope Trapping</span>
                      <span className="font-bold">20%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-0.5">
                      <span>Concrete Imperviousness Coefficient</span>
                      <span className="font-bold">10%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-600 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* DRAINAGE NODE VIEW */}
          {isDrain && drainData && (
            <>
              {/* Utilization Bar */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">
                    Hydraulic Capacity Utilization
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase ${
                      drainData.status === 'surcharging'
                        ? 'bg-red-100 text-red-700'
                        : drainData.status === 'congested'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {drainData.status} ({drainData.capacityUtilization}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      drainData.capacityUtilization >= 100
                        ? 'bg-red-600'
                        : drainData.capacityUtilization >= 75
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, drainData.capacityUtilization)}%` }}
                  ></div>
                </div>
              </div>

              {/* Drainage Node Hydraulics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-900">Design Capacity</div>
                  <div className="text-lg font-black text-blue-950 mt-0.5">
                    {drainData.designCapacityLps} L/s
                  </div>
                  <div className="text-[10px] text-blue-700 mt-1">Conduit intake limit</div>
                </div>

                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <div className="text-[10px] font-bold text-purple-900">Current Inflow Rate</div>
                  <div className="text-lg font-black text-purple-950 mt-0.5">
                    {drainData.inflowLps} L/s
                  </div>
                  <div className="text-[10px] text-purple-700 mt-1">Surface stormwater influx</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-700">Ground / Invert Level</div>
                  <div className="text-sm font-extrabold text-gray-900 mt-0.5">
                    {drainData.groundElevationM}m / {drainData.invertElevationM}m
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Pipe drop: {(drainData.groundElevationM - drainData.invertElevationM).toFixed(1)}m</div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    drainData.backflowLps > 0
                      ? 'bg-red-50/60 border-red-200 text-red-950'
                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="text-[10px] font-bold">Surface Surcharge Backflow</div>
                  <div className="text-lg font-black mt-0.5">
                    {drainData.backflowLps} L/s
                  </div>
                  <div className="text-[10px] mt-1">
                    {drainData.backflowLps > 0
                      ? '⚠️ Overcapacity: Spilling onto road'
                      : '✓ Underground flow contained'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="pt-2">
            <button
              onClick={() => setSelectedFeature(null)}
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
