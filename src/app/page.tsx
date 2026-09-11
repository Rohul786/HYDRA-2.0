import FloodMap from '@/components/map/FloodMap';
import HeaderBranding from '@/components/ui/HeaderBranding';
import WeatherPill from '@/components/ui/WeatherPill';
import LocationSafetyCard from '@/components/ui/LocationSafetyCard';
import EmergencyServicesPanel from '@/components/ui/EmergencyServicesPanel';
import RouteInspector from '@/components/ui/RouteInspector';
import InspectorModal from '@/components/ui/InspectorModal';
import MetroRadarBar from '@/components/ui/MetroRadarBar';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      {/* Interactive Map (Coupled ML Inundation, Drainage Network Graph, Evacuation Routing) */}
      <FloodMap />

      {/* Top Center: Indian Metro Basins & Live Doppler Radar Nowcast Controller */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-4 flex justify-center pointer-events-auto">
        <MetroRadarBar />
      </div>

      {/* Left Control Column: Branding, Live Weather, GPS Flood Safety, Nearby Evacuation Hubs */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3.5 max-h-[calc(100vh-48px)] overflow-y-auto pr-1">
        {/* App Title & Subtitle Branding with Circular Multi-Disaster Logo */}
        <HeaderBranding />

        {/* Environmental & Doppler Radar Conditions */}
        <WeatherPill />

        {/* User GPS Geolocation & Live Street Flood Safety Assessment */}
        <LocationSafetyCard />

        {/* Nearby Emergency Shelters & Flood Relief Facilities */}
        <EmergencyServicesPanel />
      </div>

      {/* Predictive Nowcast Horizon, Hydraulic Layers & Flood-Safe Navigation */}
      <RouteInspector />

      {/* Coupled ML Inundation & Drainage Surcharge Inspector */}
      <InspectorModal />
    </main>
  );
}
