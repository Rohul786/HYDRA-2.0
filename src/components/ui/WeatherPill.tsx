'use client';

import { useFloodStore } from '@/store/useFloodStore';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { CloudRain, Thermometer, AlertTriangle, Radio } from 'lucide-react';

export default function WeatherPill() {
  const { currentWeather, activeMetro, rainfallIntensity } = useFloodStore();
  const config = METRO_CONFIGS[activeMetro];

  const alertMessage =
    rainfallIntensity >= 60
      ? `Cloudburst Alert: Severe inundation (>50 cm) predicted in ${config.name} lowlands.`
      : rainfallIntensity >= 25
      ? `Heavy Monsoonal Rain: Drainage surcharging in ${config.basinName}.`
      : `Normal Conditions: Stormwater drains operating within design capacity.`;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 max-w-sm w-80 flex flex-col gap-2.5 text-xs">
      {/* Location & Radar Station Tag */}
      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span className="truncate">{config.name} • {config.basinName}</span>
        <span className="flex items-center gap-1 text-blue-600 font-mono">
          <Radio className="w-3 h-3 animate-pulse" />
          DWR
        </span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-700">
          <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold text-xs">{rainfallIntensity} mm/hr</span>
        </div>

        <div className="h-3.5 w-[1px] bg-gray-200"></div>

        <div className="flex items-center gap-1.5 text-gray-700">
          <Thermometer className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="font-bold text-xs">{Math.round(currentWeather.temp)}°C</span>
        </div>

        <div className="h-3.5 w-[1px] bg-gray-200"></div>

        <div className="flex items-center gap-1 text-gray-600 text-[10px]">
          <span className="font-mono">{config.radarStation.split(' ')[0]}</span>
        </div>
      </div>

      {/* Alert Notice */}
      <div
        className={`flex items-start gap-2 p-2.5 rounded-xl border ${
          rainfallIntensity >= 40
            ? 'bg-red-50 border-red-200 text-red-950'
            : rainfallIntensity >= 20
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}
      >
        <AlertTriangle
          className={`w-4 h-4 shrink-0 mt-0.5 ${
            rainfallIntensity >= 40
              ? 'text-red-600'
              : rainfallIntensity >= 20
              ? 'text-amber-600'
              : 'text-emerald-600'
          }`}
        />
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase">
            {rainfallIntensity >= 40
              ? 'Flash Flood Warning'
              : rainfallIntensity >= 20
              ? 'Waterlogging Advisory'
              : 'Hydraulic Status Clear'}
          </span>
          <span className="text-[10px] font-medium leading-tight mt-0.5">
            {alertMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
