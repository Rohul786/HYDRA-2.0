import FloodMap from '@/components/map/FloodMap';
import HeaderBranding from '@/components/ui/HeaderBranding';
import WeatherPill from '@/components/ui/WeatherPill';
import LocationSafetyCard from '@/components/ui/LocationSafetyCard';
import EmergencyServicesPanel from '@/components/ui/EmergencyServicesPanel';
import RouteInspector from '@/components/ui/RouteInspector';
import InspectorModal from '@/components/ui/InspectorModal';
import HazardDetailModal from '@/components/ui/HazardDetailModal';
import GlobalSearchTicker from '@/components/ui/GlobalSearchTicker';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      {/* Interactive Map (Preserved & Extended with GPS, Services, Hazards, Navigation) */}
      <FloodMap />

      {/* Worldwide Place Search & Live Global Alert Ticker */}
      <GlobalSearchTicker />

      {/* Left Control Column: Branding, Weather, Safety, Emergency Services */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3.5 max-h-[calc(100vh-48px)] overflow-y-auto pr-1">
        {/* App Title & Subtitle Branding */}
        <HeaderBranding />

        {/* Environmental Live Conditions (Preserved & Reactive to Location) */}
        <WeatherPill />

        {/* User GPS Geolocation & Live Safety Assessment */}
        <LocationSafetyCard />

        {/* Nearby Emergency Services Panel */}
        <EmergencyServicesPanel />
      </div>

      {/* Forecasting Nowcast, Map Layers, Route Navigation (Preserved & Extended) */}
      <RouteInspector />

      {/* Inundation & Drainage Inspection Modal (Preserved) */}
      <InspectorModal />

      {/* Multi-Disaster Hazard Detail Modal */}
      <HazardDetailModal />
    </main>
  );
}
