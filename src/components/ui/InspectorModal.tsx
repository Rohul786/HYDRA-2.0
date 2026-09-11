'use client';

import { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { X, Activity, Waves, Droplets, ChevronRight } from 'lucide-react';
import MLHydraulicInspector from './MLHydraulicInspector';

export default function InspectorModal() {
  const { selectedFeature, setSelectedFeature } = useFloodStore();
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  if (!selectedFeature) return null;

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 w-96 animate-in slide-in-from-bottom-4 text-xs">
        <button
          onClick={() => {
            setSelectedFeature(null);
            setShowFullAnalysis(false);
          }}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {selectedFeature.type === 'street' && (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <Waves className="w-4 h-4 text-blue-600" />
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Street Inundation Profile
              </h3>
            </div>
            <div className="text-sm font-black text-gray-900 mb-3 truncate">
              {selectedFeature.data.streetName}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold block">Water Depth</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-lg font-black ${
                      selectedFeature.data.waterDepthCm >= 25
                        ? 'text-red-600'
                        : selectedFeature.data.waterDepthCm >= 10
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}
                  >
                    {selectedFeature.data.waterDepthCm} cm
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">
                    ({selectedFeature.data.riskLevel})
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold block">DEM Elevation</span>
                <div className="text-lg font-black text-gray-800 mt-0.5">
                  {selectedFeature.data.elevationM} m MSL
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFullAnalysis(true)}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Coupled ML &amp; Hydraulic Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {selectedFeature.type === 'drain' && (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Stormwater Drainage Node
              </h3>
            </div>
            <div className="text-sm font-black text-gray-900 mb-3 truncate">
              {selectedFeature.data.nodeName || `Node ${selectedFeature.data.nodeId}`}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold block">Hydraulic Status</span>
                <span
                  className={`text-xs font-black uppercase inline-block mt-1 ${
                    selectedFeature.data.status === 'surcharging'
                      ? 'text-red-600'
                      : selectedFeature.data.status === 'congested'
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`}
                >
                  {selectedFeature.data.status} ({selectedFeature.data.capacityUtilization}%)
                </span>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold block">Surcharge Backflow</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-sm font-black ${
                      (selectedFeature.data.backflowLps || 0) > 0 ? 'text-red-600' : 'text-gray-700'
                    }`}
                  >
                    {selectedFeature.data.backflowLps || 0} L/s
                  </span>
                  <Droplets className="w-3 h-3 text-red-500" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFullAnalysis(true)}
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Hydraulic Pipe Graph Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {showFullAnalysis && <MLHydraulicInspector />}
    </>
  );
}
