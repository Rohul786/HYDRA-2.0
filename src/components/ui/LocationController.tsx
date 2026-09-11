'use client';

import React, { useState, useMemo } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import { MetroCity } from '@/types';
import {
  MapPin,
  Crosshair,
  Loader2,
  Navigation2,
  Check,
  ChevronDown,
  Search,
  X,
  Building2,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export const PRESET_ZONES: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  mumbai: [
    { name: 'Bandra Kurla Complex (BKC)', lat: 19.0626, lng: 72.8626 },
    { name: 'Dadar TT / Hindmata', lat: 19.0178, lng: 72.8478 },
    { name: 'Santacruz / Milan Subway', lat: 19.0833, lng: 72.8428 },
    { name: 'Kurla West (Mithi Basin)', lat: 19.0726, lng: 72.8796 },
    { name: 'Andheri West (Veera Desai)', lat: 19.1352, lng: 72.8315 },
  ],
  delhi: [
    { name: 'Connaught Place (Inner Circle)', lat: 28.6328, lng: 77.2197 },
    { name: 'Minto Road Railway Bridge', lat: 28.6416, lng: 77.2258 },
    { name: 'ITO Junction / Vikas Marg', lat: 28.6304, lng: 77.2435 },
    { name: 'Pul Prahladpur Underpass', lat: 28.5115, lng: 77.2942 },
    { name: 'Kashmere Gate ISBT', lat: 28.6675, lng: 77.2285 },
  ],
  chennai: [
    { name: 'Velachery 100 Feet Road', lat: 12.9785, lng: 80.2185 },
    { name: 'Madipakkam Lake Margin', lat: 12.9642, lng: 80.1989 },
    { name: 'T. Nagar (Usman Road)', lat: 13.0418, lng: 80.2341 },
    { name: 'Saidapet / Adyar Riverbank', lat: 13.0213, lng: 80.2231 },
    { name: 'Vyasarpadi Jeeva Subway', lat: 13.1124, lng: 80.2589 },
  ],
  bengaluru: [
    { name: 'Silk Board Junction & ORR', lat: 12.9176, lng: 77.6233 },
    { name: 'Bellandur EcoSpace Corridor', lat: 12.9260, lng: 77.6844 },
    { name: 'Hebbal Flyover Underpass', lat: 13.0358, lng: 77.5970 },
    { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245 },
    { name: 'Whitefield Hope Farm Junction', lat: 12.9830, lng: 77.7510 },
  ],
  kolkata: [
    { name: 'College Street / Thanthania', lat: 22.5802, lng: 88.3685 },
    { name: 'Park Circus 7-Point Crossing', lat: 22.5448, lng: 88.3667 },
    { name: 'Ultadanga VIP Road Connector', lat: 22.5930, lng: 88.3888 },
    { name: 'Sector V Salt Lake', lat: 22.5735, lng: 88.4331 },
    { name: 'Kalighat SP Mukherjee Road', lat: 22.5186, lng: 88.3478 },
  ],
  hyderabad: [
    { name: 'Tolichowki & Al Jubail Colony', lat: 17.3995, lng: 78.4140 },
    { name: 'Begumpet Prakash Nagar Culvert', lat: 17.4447, lng: 78.4682 },
    { name: 'Hitec City Cyber Towers', lat: 17.4504, lng: 78.3808 },
    { name: 'Chaderghat Musi Riverbank', lat: 17.3792, lng: 78.4875 },
    { name: 'Nadeem Colony (Golconda)', lat: 17.3872, lng: 78.4010 },
  ],
  kochi: [
    { name: 'KSRTC Bus Terminal Karikkamuri', lat: 9.9723, lng: 76.2872 },
    { name: 'MG Road Jos Junction Corridor', lat: 9.9691, lng: 76.2828 },
    { name: 'Ernakulam South Railway Station', lat: 9.9678, lng: 76.2912 },
    { name: 'Marine Drive Foreshore', lat: 9.9816, lng: 76.2750 },
    { name: 'Aluva Periyar Riverbank', lat: 10.1076, lng: 76.3516 },
  ],
};

const ALL_METRO_CITIES: Array<{
  id: MetroCity;
  name: string;
  regionName: string;
  radarStation: string;
  searchKeywords: string[];
}> = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    regionName: 'Mumbai Metropolitan Region (MMR)',
    radarStation: 'IMD Colaba & Veravali DWR S-Band',
    searchKeywords: ['mumbai', 'bombay', 'mmr', 'bkc', 'thane', 'navi mumbai'],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    regionName: 'National Capital Region',
    radarStation: 'IMD Palam & Mausam Bhawan X/C-Band',
    searchKeywords: ['delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'faridabad'],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    regionName: 'Chennai Metropolitan Area (CMA)',
    radarStation: 'IMD Chennai Port Trust DWR S-Band',
    searchKeywords: ['chennai', 'madras', 'velachery', 'adyar', 'omr', 'tambaram'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    regionName: 'Greater Bengaluru Area (BBMP)',
    radarStation: 'IMD Bengaluru DWR S-Band',
    searchKeywords: ['bengaluru', 'bangalore', 'karnataka', 'silk board', 'whitefield', 'bellandur'],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    regionName: 'Kolkata Metropolitan Area (KMA)',
    radarStation: 'IMD Kolkata Alipore DWR S-Band',
    searchKeywords: ['kolkata', 'calcutta', 'west bengal', 'howrah', 'salt lake', 'bidhannagar'],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    regionName: 'Hyderabad Metropolitan Area (GHMC)',
    radarStation: 'IMD Begumpet DWR S-Band',
    searchKeywords: ['hyderabad', 'secunderabad', 'telangana', 'cyberabad', 'hitec city'],
  },
  {
    id: 'kochi',
    name: 'Kochi',
    regionName: 'Greater Cochin Coastal Zone (KMC)',
    radarStation: 'IMD Kochi Naval Base C-Band DWR',
    searchKeywords: ['kochi', 'cochin', 'ernakulam', 'kerala', 'aluva', 'mattancherry'],
  },
];

export default function LocationController() {
  const {
    activeMetro,
    setActiveMetro,
    locationMode,
    userLocation,
    setUserLocation,
    setMapCenterTarget,
    evaluateSafetyStatus,
  } = useFloodStore();

  const { loading: gpsLoading, requestLocation } = useUserLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showZonesDropdown, setShowZonesDropdown] = useState(false);

  const zones = PRESET_ZONES[activeMetro] || PRESET_ZONES.mumbai;
  const cfg = METRO_CONFIGS[activeMetro];

  // Filtered metro list based on real-time search
  const filteredMetros = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_METRO_CITIES;

    return ALL_METRO_CITIES.filter((city) => {
      const matchName = city.name.toLowerCase().includes(q);
      const matchRegion = city.regionName.toLowerCase().includes(q);
      const matchId = city.id.toLowerCase().includes(q);
      const matchKeyword = city.searchKeywords.some((kw) => kw.includes(q));
      return matchName || matchRegion || matchId || matchKeyword;
    });
  }, [searchQuery]);

  // Filtered preset zones for current search
  const filteredZones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.name.toLowerCase().includes(q));
  }, [zones, searchQuery]);

  // Handler for manual metro selection
  const handleSelectMetro = (metroId: MetroCity) => {
    setActiveMetro(metroId);
    setModalOpen(false);
    setSearchQuery('');
  };

  // Handler for choosing GPS
  const handleUseGps = () => {
    requestLocation(true);
    setModalOpen(false);
    setSearchQuery('');
  };

  // Handler for preset zone click
  const handleSelectPreset = (zone: { name: string; lat: number; lng: number }) => {
    setUserLocation({
      latitude: zone.lat,
      longitude: zone.lng,
      isRealGps: false,
    });
    setMapCenterTarget([zone.lat, zone.lng]);
    evaluateSafetyStatus(zone.lat, zone.lng);
    setShowZonesDropdown(false);
    setModalOpen(false);
  };

  const centerOnUser = () => {
    if (userLocation.latitude && userLocation.longitude) {
      setMapCenterTarget([userLocation.latitude, userLocation.longitude]);
    }
  };

  const isGpsActive = locationMode === 'gps' && userLocation.isRealGps;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3 space-y-2.5 text-xs">
      {/* 1. Location Header & Current Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isGpsActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isGpsActive ? (
              <Crosshair className="w-4 h-4 animate-pulse" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {isGpsActive ? 'Current GPS Location' : 'Monitoring Metro Basin'}
            </div>
            <div className="font-extrabold text-xs text-gray-900 truncate">
              {isGpsActive ? (
                <span className="text-blue-700 flex items-center gap-1">
                  <span>📍 GPS Active</span>
                  {userLocation.accuracy && (
                    <span className="text-[10px] text-gray-400 font-normal">
                      (±{Math.round(userLocation.accuracy)}m)
                    </span>
                  )}
                </span>
              ) : (
                <span>🏙️ {cfg.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Change Location Button (Triggers Searchable Modal) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200/80 transition-colors cursor-pointer shadow-2xs"
            title="Change Location or Choose Metro City"
          >
            <span>Change</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {userLocation.latitude && (
            <button
              onClick={centerOnUser}
              className="p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              title="Center map on this position"
            >
              <Navigation2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Subtitle with Regional Basin & Active Sensor Network */}
      <div className="text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-100/80 pt-1.5">
        <span className="truncate">
          {isGpsActive ? (
            <span>
              Lat {userLocation.latitude?.toFixed(4)}, Lon {userLocation.longitude?.toFixed(4)}
            </span>
          ) : (
            <span>{cfg.regionName || cfg.basinName}</span>
          )}
        </span>
        <span className="shrink-0 flex items-center gap-1 text-emerald-600 font-semibold">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>Doppler Live</span>
        </span>
      </div>

      {/* 3. Preset Hotspot Zones Quick Switcher */}
      <div className="relative pt-0.5">
        <button
          onClick={() => setShowZonesDropdown(!showZonesDropdown)}
          className="w-full py-1.5 px-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold flex items-center justify-between text-[11px] border border-gray-200 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 truncate">
            <SlidersHorizontal className="w-3 h-3 text-gray-500 shrink-0" />
            <span className="truncate">Preset Zones ({zones.length} in {cfg.name})</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              showZonesDropdown ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showZonesDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 z-30 max-h-48 overflow-y-auto">
            {zones.map((zone, idx) => {
              const isSelected =
                userLocation.latitude?.toFixed(4) === zone.lat.toFixed(4) &&
                userLocation.longitude?.toFixed(4) === zone.lng.toFixed(4);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(zone)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{zone.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SEARCHABLE LOCATION SELECTION MODAL / DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-slate-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-sm text-gray-900">
                  Select Location or Metro Basin
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time Search Input */}
            <div className="p-3 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search metro (e.g. Mumbai, Delhi, Bangalore, Chennai)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Options List */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1">
              {/* Option 1: Use Current GPS Location */}
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                  Device Geolocation
                </div>
                <button
                  onClick={handleUseGps}
                  disabled={gpsLoading}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isGpsActive
                      ? 'border-blue-400 bg-blue-50/80 shadow-xs'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isGpsActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {gpsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Crosshair className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                        <span>Use My Current Location</span>
                        {isGpsActive && (
                          <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Acquires browser GPS coordinates & alerts nearest local ward
                      </div>
                    </div>
                  </div>
                  {isGpsActive && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </button>
              </div>

              {/* Option 2: Supported Metro Basins */}
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
                  <span>Supported Metro Basins ({filteredMetros.length})</span>
                  {searchQuery && (
                    <span className="text-blue-600 font-bold normal-case">
                      Filtered by &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {filteredMetros.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      No matching metro cities found. Try searching &ldquo;Bangalore&rdquo;, &ldquo;Delhi&rdquo;, or &ldquo;Chennai&rdquo;.
                    </div>
                  ) : (
                    filteredMetros.map((metro) => {
                      const isCurrentMetro =
                        locationMode === 'metro' && activeMetro === metro.id;

                      return (
                        <button
                          key={metro.id}
                          onClick={() => handleSelectMetro(metro.id)}
                          className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isCurrentMetro
                              ? 'border-blue-400 bg-blue-50/80 shadow-xs'
                              : 'border-gray-200/80 hover:border-blue-300 hover:bg-slate-50 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isCurrentMetro
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5 truncate">
                                <span>{metro.name}</span>
                                {isCurrentMetro && (
                                  <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md shrink-0">
                                    Monitoring
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate">
                                {metro.regionName}
                              </div>
                            </div>
                          </div>
                          {isCurrentMetro && (
                            <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Option 3: Preset Hotspot Zones in Active/Filtered Cities */}
              {filteredZones.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                    Preset Zones in {cfg.name} ({filteredZones.length})
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredZones.map((zone, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreset(zone)}
                        className="w-full text-left p-2 rounded-xl text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between border border-gray-100 cursor-pointer"
                      >
                        <span className="truncate">{zone.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                          [{zone.lat.toFixed(2)}, {zone.lng.toFixed(2)}]
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[10px] text-gray-500">
              <span>HYDRA 2.0 Real-Time Urban Basin Controller</span>
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
