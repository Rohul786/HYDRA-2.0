import FloodMap from '@/components/map/FloodMap';
import LiveOperationsDock from '@/components/ui/LiveOperationsDock';
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

      {/* Left Mission Control: Collapsible Live Operations Dock (Branding, GPS, Telemetry & Real Emergency Facilities) */}
      <LiveOperationsDock />

      {/* Predictive Nowcast Horizon, Hydraulic Layers & Flood-Safe Navigation */}
      <RouteInspector />

      {/* Coupled ML Inundation & Drainage Surcharge Inspector */}
      <InspectorModal />
    </main>
  );
}
