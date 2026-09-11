'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { useFloodStore } from '@/store/useFloodStore';
import { getMetroGeoJSON, METRO_CONFIGS } from '@/data/metroFloodData';
import UserLocationMarker from './UserLocationMarker';
import EmergencyMarkers from './EmergencyMarkers';
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
  const { mapCenterTarget, setMapCenterTarget, activeMetro } = useFloodStore();

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

  // Center on active metro basin if not explicitly panning
  useEffect(() => {
    const config = METRO_CONFIGS[activeMetro];
    map.flyTo(config.center, config.zoom, { duration: 1.2 });
  }, [activeMetro, map]);

  return null;
}

const getInundationColor = (depth: number) => {
  if (depth >= 25) return '#dc2626'; // Red (critical: engine stall hazard)
  if (depth >= 10) return '#f59e0b'; // Amber (warning: low sedan hazard)
  return '#16a34a'; // Green (safe / clear road)
};

export default function MapClient() {
  const {
    activeMetro,
    selectedTimeWindow,
    rainfallIntensity,
    tidalState,
    activeRoute,
    layerVisibility,
    setSelectedFeature,
  } = useFloodStore();

  // Dynamically compute coupled ML Inundation and Drainage Graph GeoJSON
  const geoData = useMemo(() => {
    return getMetroGeoJSON(activeMetro, selectedTimeWindow, rainfallIntensity, tidalState);
  }, [activeMetro, selectedTimeWindow, rainfallIntensity, tidalState]);

  const getDrainageIcon = (status: string, backflow: number) => {
    const isSurcharging = status === 'surcharging';
    return L.divIcon({
      className: 'bg-transparent',
      html: `<div class="relative flex items-center justify-center">
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${
          isSurcharging ? 'bg-red-600 animate-ping' : status === 'congested' ? 'bg-amber-500' : 'bg-blue-600'
        }"></div>
        <div class="absolute w-3.5 h-3.5 rounded-full border-2 border-white ${
          isSurcharging ? 'bg-red-600' : status === 'congested' ? 'bg-amber-500' : 'bg-blue-600'
        }"></div>
        ${
          backflow > 0
            ? '<span class="absolute -top-3 text-[9px] font-black bg-red-600 text-white px-1 rounded-full shadow-sm">▲ backflow</span>'
            : ''
        }
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <MapContainer
      center={METRO_CONFIGS[activeMetro].center}
      zoom={METRO_CONFIGS[activeMetro].zoom}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />

      {/* 1. Underground Drainage Pipes (Directed Graph Edges) */}
      {layerVisibility.drainage && (
        <GeoJSON
          key={`pipes-${activeMetro}-${rainfallIntensity}`}
          data={geoData.drainagePipes as unknown as GeoJsonObject}
          style={(feature) => ({
            color: feature?.properties?.isChoked ? '#dc2626' : '#2563eb',
            weight: 3,
            opacity: 0.6,
            dashArray: '4, 4',
          })}
        />
      )}

      {/* 2. Street Inundation Depth Segments (Coupled ML Model Output) */}
      {layerVisibility.streets && (
        <GeoJSON
          key={`inundation-${activeMetro}-${selectedTimeWindow}-${rainfallIntensity}-${tidalState}`}
          data={geoData.inundation as unknown as GeoJsonObject}
          style={(feature) => ({
            color: getInundationColor(feature?.properties?.waterDepthCm || 0),
            weight: 7,
            opacity: 0.85,
          })}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: () => setSelectedFeature({ type: 'street', data: feature.properties }),
            });
            // Tooltip on hover showing live water depth
            layer.bindTooltip(
              `<strong>${feature.properties.streetName}</strong><br/>Depth: <b>${feature.properties.waterDepthCm} cm</b> (${feature.properties.riskLevel.toUpperCase()})<br/>DEM: ${feature.properties.elevationM}m MSL`,
              { sticky: true, opacity: 0.9 }
            );
          }}
        />
      )}

      {/* 3. Underground Drainage Graph Nodes (Inlets / Surcharging Manholes) */}
      {layerVisibility.drainage && (
        <GeoJSON
          key={`nodes-${activeMetro}-${rainfallIntensity}-${tidalState}`}
          data={geoData.drainageNodes as unknown as GeoJsonObject}
          pointToLayer={(feature, latlng) => {
            return L.marker(latlng, {
              icon: getDrainageIcon(feature.properties.status, feature.properties.backflowLps),
            });
          }}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: () => setSelectedFeature({ type: 'drain', data: feature.properties }),
            });
            layer.bindTooltip(
              `<strong>${feature.properties.nodeName}</strong><br/>Status: <b>${feature.properties.status.toUpperCase()}</b> (${feature.properties.capacityUtilization}%)<br/>Backflow: ${feature.properties.backflowLps} L/s`,
              { sticky: true, opacity: 0.9 }
            );
          }}
        />
      )}

      {/* 4. Primary Route (Potentially Flooded Corridor) */}
      {(activeRoute === 'primary' || activeRoute === 'both') && (
        <GeoJSON
          key={`route-primary-${activeMetro}-${rainfallIntensity}`}
          data={
            geoData.routes.features.filter(
              (f) => f.properties.type === 'primary'
            ) as unknown as GeoJsonObject
          }
          style={() => ({
            color: '#ef4444',
            weight: 8,
            opacity: 0.45,
            dashArray: '10, 10',
          })}
        />
      )}

      {/* 5. Alternate Route (Recommended Flood-Safe Corridor) */}
      {(activeRoute === 'alternate' || activeRoute === 'both') && (
        <GeoJSON
          key={`route-alternate-${activeMetro}-${rainfallIntensity}`}
          data={
            geoData.routes.features.filter(
              (f) => f.properties.type === 'alternate'
            ) as unknown as GeoJsonObject
          }
          style={() => ({
            color: '#16a34a',
            weight: 6,
            opacity: 0.95,
            dashArray: '12, 8',
          })}
        />
      )}

      {/* 6. Nearby Flood Relief & Emergency Markers: 🏥, 👮, 🚒, 🏠 */}
      <EmergencyMarkers />

      {/* 7. Active Evacuation Route Navigation Layer */}
      <EvacuationRouteLayer />

      {/* 8. User GPS Location Marker: 📍 YOU ARE HERE */}
      <UserLocationMarker />

      <MapUpdater />
    </MapContainer>
  );
}
