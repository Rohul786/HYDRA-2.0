'use client';

import { CloudRain, Thermometer, AlertTriangle } from 'lucide-react';

export default function WeatherPill() {
  return (
    <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 max-w-sm flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <CloudRain className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">42 mm/hr</span>
        </div>
        <div className="h-4 w-[1px] bg-gray-300"></div>
        <div className="flex items-center gap-2 text-gray-700">
          <Thermometer className="w-5 h-5 text-orange-500" />
          <span className="font-semibold">28°C</span>
        </div>
      </div>
      
      <div className="flex items-start gap-2 bg-red-50 border border-red-100 p-2.5 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-red-800">Critical Alert</span>
          <span className="text-xs text-red-600">Backflow detected at BKC Drainage Node 1</span>
        </div>
      </div>
    </div>
  );
}
