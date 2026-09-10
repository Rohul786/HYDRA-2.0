import FloodMap from '@/components/map/FloodMap';
import WeatherPill from '@/components/ui/WeatherPill';
import RouteInspector from '@/components/ui/RouteInspector';
import InspectorModal from '@/components/ui/InspectorModal';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      <FloodMap />
      <WeatherPill />
      <RouteInspector />
      <InspectorModal />
    </main>
  );
}
