'use client';

import { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { EmergencyService, EmergencyServiceType } from '@/types';
import {
  HeartHandshake,
  Navigation,
  Phone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';

export default function EmergencyServicesPanel() {
  const {
    nearbyServices,
    userLocation,
    activeNavigationDestination,
    setActiveNavigationDestination,
    setMapCenterTarget,
  } = useFloodStore();

  const [expandedCategory, setExpandedCategory] = useState<EmergencyServiceType | null>(null);

  const nearestHospital = nearbyServices.hospitals[0];
  const nearestPolice = nearbyServices.policeStations[0];
  const nearestFire = nearbyServices.fireStations[0];
  const nearestShelter = nearbyServices.shelters[0];

  const handleDirections = (service: EmergencyService) => {
    setActiveNavigationDestination(service);
    setMapCenterTarget([service.latitude, service.longitude]);
  };

  const getGoogleMapsUrl = (service: EmergencyService) => {
    const originLat = userLocation.latitude ?? 19.0596;
    const originLng = userLocation.longitude ?? 72.8626;
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${service.latitude},${service.longitude}`;
  };

  const serviceCategories: {
    type: EmergencyServiceType;
    label: string;
    emoji: string;
    nearest?: EmergencyService;
    items: EmergencyService[];
    color: string;
  }[] = [
    {
      type: 'hospital',
      label: 'Hospital',
      emoji: '🏥',
      nearest: nearestHospital,
      items: nearbyServices.hospitals,
      color: 'text-red-600 bg-red-50 border-red-100',
    },
    {
      type: 'police',
      label: 'Police',
      emoji: '👮',
      nearest: nearestPolice,
      items: nearbyServices.policeStations,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      type: 'fire_station',
      label: 'Fire Station',
      emoji: '🚒',
      nearest: nearestFire,
      items: nearbyServices.fireStations,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      type: 'shelter',
      label: 'Shelter',
      emoji: '🏠',
      nearest: nearestShelter,
      items: nearbyServices.shelters,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 max-w-sm w-80 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-red-600" />
          NEARBY HELP
        </h3>
        {nearbyServices.loading && (
          <span className="text-[10px] text-blue-600 font-medium animate-pulse">
            Updating...
          </span>
        )}
      </div>

      {/* Active Route Notice if an emergency destination is selected */}
      {activeNavigationDestination && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex flex-col gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              Active Route to Destination
            </span>
            <button
              onClick={() => setActiveNavigationDestination(null)}
              className="text-blue-500 hover:text-blue-700 p-0.5 rounded cursor-pointer"
              title="Clear Route"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs font-semibold text-gray-900 truncate">
            {activeNavigationDestination.name}
          </div>
          <div className="flex items-center justify-between text-[11px] text-blue-700">
            <span>{activeNavigationDestination.distanceFormatted} away</span>
            <a
              href={getGoogleMapsUrl(activeNavigationDestination)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold hover:underline"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Emergency Service Cards */}
      <div className="space-y-2.5">
        {serviceCategories.map((cat) => {
          const service = cat.nearest;
          const isExpanded = expandedCategory === cat.type;

          if (!service) {
            return (
              <div key={cat.type} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-400">
                Searching for nearest {cat.label.toLowerCase()}...
              </div>
            );
          }

          const isCurrentlyActive = activeNavigationDestination?.id === service.id;

          return (
            <div
              key={cat.type}
              className={`rounded-xl border transition-all ${
                isCurrentlyActive
                  ? 'border-blue-300 bg-blue-50/50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              } p-2.5`}
            >
              {/* Category Header & Distance */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="text-xs font-bold text-gray-700">{cat.label}</span>
                </div>
                <span className="text-xs font-bold text-blue-700">
                  {service.distanceFormatted}
                </span>
              </div>

              {/* Service Name */}
              <div className="text-xs font-semibold text-gray-900 leading-tight mb-2 truncate" title={service.name}>
                {service.name}
              </div>

              {/* Capacity info for shelter */}
              {service.type === 'shelter' && service.capacity !== undefined && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium mb-2 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Capacity: {service.capacity}
                </div>
              )}

              {/* Actions: Directions & Call */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDirections(service)}
                  className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    isCurrentlyActive
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isCurrentlyActive ? 'Routing' : 'DIRECTIONS'}</span>
                </button>

                {/* Call button ONLY if real phone exists */}
                {service.phone && (
                  <a
                    href={`tel:${service.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-sm"
                    title={`Call ${service.phone}`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>CALL</span>
                  </a>
                )}

                {/* Expand other items toggle */}
                {cat.items.length > 1 && (
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.type)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isExpanded ? 'Collapse list' : `View all ${cat.items.length} ${cat.label.toLowerCase()}s`}
                  >
                    <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>

              {/* Expanded alternate facilities */}
              {isExpanded && cat.items.length > 1 && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Other Nearby {cat.label}s:
                  </div>
                  {cat.items.slice(1, 4).map((alt) => (
                    <div
                      key={alt.id}
                      className="flex items-center justify-between text-[11px] p-1.5 rounded-md hover:bg-gray-50 border border-gray-100"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-gray-800 truncate">{alt.name}</div>
                        <div className="text-gray-400 text-[10px]">{alt.distanceFormatted}</div>
                      </div>
                      <button
                        onClick={() => handleDirections(alt)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[10px] px-2 py-0.5 border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                      >
                        Route
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
