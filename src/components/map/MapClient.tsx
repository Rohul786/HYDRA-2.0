'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { useFloodStore } from '@/store/useFloodStore';
import { INUNDATION_DATA, DRAINAGE_DATA, ROUTE_DATA } from '@/data/mockGeoJSON';
import UserLocationMarker from './UserLocationMarker';
import EmergencyMarkers from './EmergencyMarkers';
import HazardMarkers from './HazardMarkers';
import EvacuationRouteLayer from './EvacuationRouteLayer';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater() {
  const map = useMap();
  const { mapCenterTarget, setMapCenterTarget } = useFloodStore();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  useEffect(() => {
    if (mapCenterTarget) {
      map.flyTo(mapCenterTarget, 14, { duration: 1.2 });
      setMapCenterTarget(null);
    }
  }, [mapCenterTarget, map, setMapCenterTarget]);

  return null;
}

const getInundationColor = (depth: number) => {
  if (depth >= 30) return '#ef4444'; // Red (critical)
  if (depth >= 10) return '#f59e0b'; // Amber (warning)
  return '#22c55e'; // Green (safe)
};

export default function MapClient() {
  const { selectedTimeWindow, activeRoute, layerVisibility, setSelectedFeature } = useFloodStore();

  const filteredInundation = {
    ...INUNDATION_DATA,
    features: INUNDATION_DATA.features.filter(
      (f) => f.properties.predictedTimeWindow === selectedTimeWindow
    ),
  };

  const getDrainageIcon = (status: string) => {
    const isSurcharging = status === 'surcharging';
    return L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${
        isSurcharging ? 'bg-red-600 animate-pulse' : status === 'congested' ? 'bg-amber-500' : 'bg-blue-500'
      }"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  return (
    <MapContainer
      center={[19.0596, 72.8626]}
      zoom={14}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      
      {/* Existing street inundation layer (preserved) */}
      {layerVisibility.streets && (
        <GeoJSON
          key={`inundation-${selectedTimeWindow}`}
          data={filteredInundation as GeoJsonObject}
          style={(feature) => ({
            color: getInundationColor(feature?.properties?.waterDepthCm || 0),
            weight: 6,
            opacity: 0.8,
          })}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: () => setSelectedFeature({ type: 'street', data: feature.properties }),
            });
          }}
        />
      )}

      {/* Existing drainage network layer (preserved) */}
      {layerVisibility.drainage && (
        <GeoJSON
          key="drainage"
          data={DRAINAGE_DATA as GeoJsonObject}
          pointToLayer={(feature, latlng) => {
            return L.marker(latlng, { icon: getDrainageIcon(feature.properties.status) });
          }}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: () => setSelectedFeature({ type: 'drain', data: feature.properties }),
            });
          }}
        />
      )}

      {/* Existing primary route (preserved) */}
      {(activeRoute === 'primary' || activeRoute === 'both') && (
        <GeoJSON
          key="route-primary"
          data={ROUTE_DATA.features.filter((f) => f.properties.type === 'primary') as unknown as GeoJsonObject}
          style={() => ({
            color: '#ef4444',
            weight: 8,
            opacity: 0.4,
            dashArray: '10, 10',
          })}
        />
      )}

      {/* Existing alternate route (preserved) */}
      {(activeRoute === 'alternate' || activeRoute === 'both') && (
        <GeoJSON
          key="route-alternate"
          data={ROUTE_DATA.features.filter((f) => f.properties.type === 'alternate') as unknown as GeoJsonObject}
          style={() => ({
            color: '#22c55e',
            weight: 6,
            opacity: 0.9,
            dashArray: '15, 10',
          })}
        />
      )}

      {/* Multi-Disaster Hazard Layers (New) */}
      <HazardMarkers />

      {/* Nearby Emergency Service Markers: 🏥, 👮, 🚒, 🏠 (New) */}
      <EmergencyMarkers />

      {/* Active Evacuation Route Navigation Layer (New) */}
      <EvacuationRouteLayer />

      {/* User GPS Location Marker: 📍 YOU ARE HERE (New) */}
      <UserLocationMarker />

      <MapUpdater />
    </MapContainer>
  );
}
