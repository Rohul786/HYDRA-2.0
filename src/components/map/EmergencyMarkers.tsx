'use client';

import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useFloodStore } from '@/store/useFloodStore';
import { EmergencyService, EmergencyServiceType } from '@/types';
import { Navigation, Phone, ExternalLink, ShieldCheck } from 'lucide-react';

export default function EmergencyMarkers() {
  const {
    layerVisibility,
    nearbyServices,
    userLocation,
    nearestMunicipality,
    setActiveNavigationDestination,
    setMapCenterTarget,
  } = useFloodStore();

  const createServiceIcon = (type: EmergencyServiceType) => {
    const config: Record<
      EmergencyServiceType,
      { emoji: string; bg: string; border: string }
    > = {
      hospital: { emoji: '🏥', bg: 'bg-red-500', border: 'border-white' },
      police: { emoji: '👮', bg: 'bg-blue-600', border: 'border-white' },
      fire_station: { emoji: '🚒', bg: 'bg-amber-600', border: 'border-white' },
      shelter: { emoji: '🏠', bg: 'bg-emerald-600', border: 'border-white' },
    };

    const c = config[type];

    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110">
          <div class="w-8 h-8 ${c.bg} rounded-full border-2 ${c.border} shadow-lg flex items-center justify-center text-sm">
            <span>${c.emoji}</span>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 ${c.bg} transform rotate-45"></div>
        </div>
      `,
      iconSize: [32, 36],
      iconAnchor: [16, 36],
      popupAnchor: [0, -32],
    });
  };

  const icons = useMemo(() => ({
    hospital: createServiceIcon('hospital'),
    police: createServiceIcon('police'),
    fire_station: createServiceIcon('fire_station'),
    shelter: createServiceIcon('shelter'),
  }), []);

  const handleDirections = (service: EmergencyService) => {
    setActiveNavigationDestination(service);
    setMapCenterTarget([service.latitude, service.longitude]);
  };

  const getGoogleMapsUrl = (service: EmergencyService) => {
    const originLat = userLocation.latitude ?? 19.0596;
    const originLng = userLocation.longitude ?? 72.8626;
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${service.latitude},${service.longitude}`;
  };

  const renderServicePopup = (service: EmergencyService, categoryLabel: string) => (
    <Popup className="emergency-service-popup rounded-2xl shadow-xl">
      <div className="p-2 min-w-[220px] max-w-[280px]">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 mb-2">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
            {categoryLabel}
          </span>
          {service.isDemoFallback && (
            <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
              Demo Service
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">
          {service.name}
        </h4>

        <div className="text-xs text-blue-700 font-semibold mb-2">
          {service.distanceFormatted} away
          {service.travelTimeMins ? ` • ~${service.travelTimeMins} mins travel` : ''}
        </div>

        {service.address && (
          <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">
            {service.address}
          </p>
        )}

        {service.capacity !== undefined && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-2 py-1 rounded-lg font-medium mb-3 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Available Capacity: {service.capacity} people</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => handleDirections(service)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </button>

          <a
            href={getGoogleMapsUrl(service)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {service.phone && (
            <a
              href={`tel:${service.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
          )}
        </div>
      </div>
    </Popup>
  );

  return (
    <>
      {layerVisibility.hospitals &&
        nearbyServices.hospitals.map((hosp) => (
          <Marker
            key={hosp.id}
            position={[hosp.latitude, hosp.longitude]}
            icon={icons.hospital}
          >
            {renderServicePopup(hosp, 'HOSPITAL')}
          </Marker>
        ))}

      {layerVisibility.police &&
        nearbyServices.policeStations.map((police) => (
          <Marker
            key={police.id}
            position={[police.latitude, police.longitude]}
            icon={icons.police}
          >
            {renderServicePopup(police, 'POLICE STATION')}
          </Marker>
        ))}

      {layerVisibility.fire &&
        nearbyServices.fireStations.map((fire) => (
          <Marker
            key={fire.id}
            position={[fire.latitude, fire.longitude]}
            icon={icons.fire_station}
          >
            {renderServicePopup(fire, 'FIRE STATION')}
          </Marker>
        ))}

      {layerVisibility.shelters &&
        nearbyServices.shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.latitude, shelter.longitude]}
            icon={icons.shelter}
          >
            {renderServicePopup(shelter, 'SHELTER')}
          </Marker>
        ))}

      {/* 🏛️ Nearest Municipal Authority & Ward Control Room Marker */}
      {nearestMunicipality.officeCoords && (
        <Marker
          position={nearestMunicipality.officeCoords}
          icon={
            L.divIcon({
              className: 'bg-transparent',
              html: `
                <div class="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110">
                  <div class="w-8 h-8 bg-purple-700 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-sm">
                    <span>🏛️</span>
                  </div>
                  <div class="absolute -bottom-1 w-2 h-2 bg-purple-700 transform rotate-45"></div>
                </div>
              `,
              iconSize: [32, 36],
              iconAnchor: [16, 36],
              popupAnchor: [0, -32],
            })
          }
        >
          <Popup className="emergency-service-popup rounded-2xl shadow-xl">
            <div className="p-2 min-w-[240px] max-w-[290px]">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-purple-700 uppercase">
                  🏛️ Municipal Authority
                </span>
                <span className="text-[9px] bg-purple-50 text-purple-700 font-extrabold px-1.5 py-0.5 rounded border border-purple-200">
                  {nearestMunicipality.shortCode || 'MUNICIPAL'}
                </span>
              </div>

              <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">
                {nearestMunicipality.officeName || nearestMunicipality.name}
              </h4>

              <div className="text-[11px] text-blue-700 font-semibold mb-1.5">
                ~{nearestMunicipality.distanceKm} km away • {nearestMunicipality.controlRoomName}
              </div>

              {nearestMunicipality.officeAddress && (
                <p className="text-[11px] text-gray-600 mb-2 leading-relaxed bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  {nearestMunicipality.officeAddress}
                </p>
              )}

              <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestMunicipality.officeCoords[0]},${nearestMunicipality.officeCoords[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg transition-colors shadow-2xs"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Directions</span>
                </a>

                {nearestMunicipality.emergencyPhone && (
                  <a
                    href={`tel:${nearestMunicipality.emergencyPhone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
