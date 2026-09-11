'use client';

import { useState, useEffect, useRef } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { searchWorldPlaces, GeocodedPlace, GLOBAL_MONITORING_HUBS } from '@/utils/geocoding';
import { Globe, MapPin, X, Radio, ChevronRight } from 'lucide-react';
import { HAZARD_CONFIG } from '@/data/mockHazards';

export default function GlobalSearchTicker() {
  const {
    globalHazards,
    setMapCenterTarget,
    setSelectedHazard,
    setActivePlaceName,
  } = useFloodStore();

  const { updateLocationContext } = useUserLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Rotate ticker every 4 seconds
  useEffect(() => {
    if (globalHazards.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % globalHazards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [globalHazards.length]);

  // Debounced search effect (only runs when query is at least 2 chars)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      const places = await searchWorldPlaces(query);
      setResults(places);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    if (!val || val.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: GeocodedPlace) => {
    setActivePlaceName(place.name);
    setMapCenterTarget([place.latitude, place.longitude]);
    updateLocationContext(place.latitude, place.longitude, place.name);
    setShowDropdown(false);
    setQuery('');
    setResults([]);
  };

  const currentTickerHazard = globalHazards[tickerIndex];
  const tickerConfig = currentTickerHazard ? HAZARD_CONFIG[currentTickerHazard.type] : null;

  return (
    <div
      ref={containerRef}
      className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[420px] max-w-[calc(100vw-3rem)] flex flex-col gap-2"
    >
      {/* Search Bar */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-2 flex items-center gap-2">
        <div className="pl-2 text-gray-400">
          <Globe className="w-4 h-4 text-blue-600" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search any place in the world..."
          className="flex-1 bg-transparent text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-wide">
          World Live
        </div>
      </div>

      {/* Global Live Ticker Bar */}
      {currentTickerHazard && (
        <div
          onClick={() => {
            setMapCenterTarget([currentTickerHazard.latitude, currentTickerHazard.longitude]);
            setSelectedHazard(currentTickerHazard);
          }}
          className="bg-gray-900/90 hover:bg-gray-900 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-md flex items-center justify-between text-[11px] cursor-pointer border border-gray-700 transition-all"
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="flex items-center gap-1 text-red-400 font-bold uppercase tracking-wider text-[9px] shrink-0">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              Live Alert:
            </span>
            <span className="text-sm shrink-0">{tickerConfig?.icon}</span>
            <span className="truncate font-medium text-gray-200">
              {currentTickerHazard.name}
            </span>
          </div>
          <span className="text-[10px] text-blue-400 font-bold shrink-0 flex items-center gap-0.5">
            Fly to <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Auto-suggest Search Results & Fast Presets Dropdown */}
      {showDropdown && (
        <div className="bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 max-h-72 overflow-y-auto">
          {/* Preset Global Monitoring Hubs */}
          {!query && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                Global Crisis Monitoring Hubs:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {GLOBAL_MONITORING_HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => handleSelectPlace(hub)}
                    className="flex items-center gap-1.5 text-left p-1.5 rounded-lg hover:bg-blue-50 border border-gray-100 transition-colors cursor-pointer text-xs font-medium text-gray-700"
                  >
                    <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{hub.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-3 text-xs text-gray-400 animate-pulse">
              Searching global places...
            </div>
          )}

          {!isSearching && query && results.length === 0 && (
            <div className="text-center py-3 text-xs text-gray-400">
              No matching places found. Try another city name.
            </div>
          )}

          {!isSearching &&
            results.map((place) => (
              <button
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                className="flex items-start gap-2 p-2 rounded-xl hover:bg-blue-50/80 transition-colors text-left cursor-pointer border border-transparent hover:border-blue-100"
              >
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {place.name}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {place.fullName}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
