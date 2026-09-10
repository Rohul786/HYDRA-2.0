'use client';

import { useFloodStore } from '@/store/useFloodStore';
import { X, Activity, Waves } from 'lucide-react';

export default function InspectorModal() {
  const { selectedFeature, setSelectedFeature } = useFloodStore();

  if (!selectedFeature) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-5 w-80 animate-in slide-in-from-bottom-4">
      <button 
        onClick={() => setSelectedFeature(null)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>

      {selectedFeature.type === 'street' && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Street Segment</h3>
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-4">{selectedFeature.data.streetName}</div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Water Depth</span>
              <span className={`text-sm font-bold ${
                selectedFeature.data.waterDepthCm >= 30 ? 'text-red-600' :
                selectedFeature.data.waterDepthCm >= 10 ? 'text-amber-600' : 'text-green-600'
              }`}>{selectedFeature.data.waterDepthCm} cm</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Risk Level</span>
              <span className="text-sm font-bold text-gray-700 capitalize">{selectedFeature.data.riskLevel}</span>
            </div>
          </div>
        </>
      )}

      {selectedFeature.type === 'drain' && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Drainage Node</h3>
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-4">Node {selectedFeature.data.nodeId.replace('node_', '')}</div>
          
          <div className="space-y-3">
             <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Status</span>
              <span className={`text-sm font-bold capitalize ${
                selectedFeature.data.status === 'surcharging' ? 'text-red-600' :
                selectedFeature.data.status === 'congested' ? 'text-amber-600' : 'text-blue-600'
              }`}>{selectedFeature.data.status}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Capacity</span>
              <span className="text-sm font-bold text-gray-700">{selectedFeature.data.capacityUtilization}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
