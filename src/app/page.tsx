import FloodMap from '@/components/map/FloodMap';
import WeatherPill from '@/components/ui/WeatherPill';
import LocationSafetyCard from '@/components/ui/LocationSafetyCard';
import EmergencyServicesPanel from '@/components/ui/EmergencyServicesPanel';
import RouteInspector from '@/components/ui/RouteInspector';
import InspectorModal from '@/components/ui/InspectorModal';
import HazardDetailModal from '@/components/ui/HazardDetailModal';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      {/* Interactive Map (Preserved & Extended with GPS, Services, Hazards, Navigation) */}
      <FloodMap />

      {/* Environmental Live Conditions (Preserved) */}
      <WeatherPill />

      {/* User GPS Geolocation & Live Safety Assessment (New) */}
      <LocationSafetyCard />

      {/* Nearby Emergency Services Panel (New) */}
      <EmergencyServicesPanel />

      {/* Forecasting Nowcast, Map Layers, Route Navigation (Preserved & Extended) */}
      <RouteInspector />

      {/* Inundation & Drainage Inspection Modal (Preserved) */}
      <InspectorModal />

      {/* Multi-Disaster Hazard Detail Modal (New) */}
      <HazardDetailModal />
    </main>
  );
}
