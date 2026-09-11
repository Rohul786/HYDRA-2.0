'use client';

import { useFloodStore } from '@/store/useFloodStore';
import { CloudRain, Thermometer, AlertTriangle, Wind } from 'lucide-react';

export default function WeatherPill() {
  const { currentWeather, activePlaceName } = useFloodStore();

  const alertMessage = currentWeather.alert || 'Backflow detected at BKC Drainage Node 1';

  return (
    <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 max-w-sm flex flex-col gap-2.5">
      {/* Location tag */}
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
        {activePlaceName || 'Live Weather Conditions'}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-700">
          <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold text-xs">{currentWeather.precipitation} mm/hr</span>
        </div>

        <div className="h-3.5 w-[1px] bg-gray-200"></div>

        <div className="flex items-center gap-1.5 text-gray-700">
          <Thermometer className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="font-semibold text-xs">{Math.round(currentWeather.temp)}°C</span>
        </div>

        <div className="h-3.5 w-[1px] bg-gray-200"></div>

        <div className="flex items-center gap-1.5 text-gray-700">
          <Wind className="w-4 h-4 text-cyan-600 shrink-0" />
          <span className="font-semibold text-xs">{Math.round(currentWeather.windSpeed)} km/h</span>
        </div>
      </div>
      
      {/* Alert Notice */}
      <div className="flex items-start gap-2 bg-red-50 border border-red-100 p-2 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-red-800">
            {currentWeather.alert ? 'Hazard Advisory' : 'Critical Alert'}
          </span>
          <span className="text-[11px] text-red-600 leading-tight line-clamp-2">
            {alertMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
