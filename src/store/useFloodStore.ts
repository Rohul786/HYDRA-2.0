import { create } from 'zustand';
import {
  SelectedEntity,
  HazardType,
  HazardItem,
  EmergencyService,
  NearbyEmergencyServices,
  UserLocationState,
  UserSafetyStatus,
} from '../types';
import { MOCK_HAZARDS } from '@/data/mockHazards';
import { calculateHaversineDistance, formatDistance, calculateEstimatedTravelTime } from '@/utils/geoDistance';
import { DEFAULT_MOCK_SERVICES } from '@/data/mockEmergencyServices';
import { PRE_SEEDED_GLOBAL_HAZARDS } from '@/utils/globalHazards';

export type ExtendedLayerKey = 'streets' | 'drainage' | 'hospitals' | 'police' | 'fire' | 'shelters';

const INITIAL_SERVICES = DEFAULT_MOCK_SERVICES.map((s) => {
  const dist = calculateHaversineDistance(19.0596, 72.8626, s.latitude, s.longitude);
  return {
    ...s,
    distanceMeters: dist,
    distanceFormatted: formatDistance(dist),
    travelTimeMins: calculateEstimatedTravelTime(dist, 'driving'),
  };
});

export interface WeatherSummary {
  temp: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  alert?: string;
}

interface FloodState {
  // Existing state preserved 100%
  selectedTimeWindow: '0h' | '1h' | '2h' | '3h';
  activeRoute: 'primary' | 'alternate' | 'both';
  selectedFeature: SelectedEntity;
  layerVisibility: {
    streets: boolean;
    drainage: boolean;
    hospitals: boolean;
    police: boolean;
    fire: boolean;
    shelters: boolean;
    hazards: Record<HazardType, boolean>;
  };
  setTimeWindow: (window: '0h' | '1h' | '2h' | '3h') => void;
  setActiveRoute: (route: 'primary' | 'alternate' | 'both') => void;
  setSelectedFeature: (feature: SelectedEntity) => void;
  toggleLayerVisibility: (layer: ExtendedLayerKey) => void;
  toggleHazardLayer: (hazard: HazardType) => void;

  // Geolocation State
  userLocation: UserLocationState;
  setUserLocation: (location: Partial<UserLocationState>) => void;

  // Nearby Emergency Services
  nearbyServices: NearbyEmergencyServices;
  setNearbyServices: (services: Partial<NearbyEmergencyServices>) => void;

  // Active Emergency Navigation & Route
  activeNavigationDestination: EmergencyService | null;
  setActiveNavigationDestination: (dest: EmergencyService | null) => void;

  // Multi-Disaster Hazard State
  selectedHazard: HazardItem | null;
  setSelectedHazard: (hazard: HazardItem | null) => void;

  // Global Multi-Disaster Hazards (USGS + Global Meteorological feeds)
  globalHazards: HazardItem[];
  setGlobalHazards: (hazards: HazardItem[]) => void;
  addGlobalHazards: (newHazards: HazardItem[]) => void;

  // Dynamic Weather
  currentWeather: WeatherSummary;
  setCurrentWeather: (w: WeatherSummary) => void;

  // Active Place Searched (Worldwide)
  activePlaceName: string;
  setActivePlaceName: (name: string) => void;

  // Live Safety Status
  safetyStatus: UserSafetyStatus;
  evaluateSafetyStatus: (lat: number, lng: number) => void;

  // Map center target for smooth panning
  mapCenterTarget: [number, number] | null;
  setMapCenterTarget: (target: [number, number] | null) => void;
}

export const useFloodStore = create<FloodState>((set, get) => ({
  selectedTimeWindow: '0h',
  activeRoute: 'both',
  selectedFeature: null,
  layerVisibility: {
    streets: true,
    drainage: true,
    hospitals: true,
    police: true,
    fire: true,
    shelters: true,
    hazards: {
      flood: true,
      cyclone: true,
      earthquake: true,
      landslide: true,
      wildfire: true,
      tsunami: true,
      severe_storm: true,
      extreme_rainfall: true,
      heatwave: true,
    },
  },
  setTimeWindow: (window) => set({ selectedTimeWindow: window }),
  setActiveRoute: (route) => set({ activeRoute: route }),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),

  toggleLayerVisibility: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer],
      },
    })),

  toggleHazardLayer: (hazard) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        hazards: {
          ...state.layerVisibility.hazards,
          [hazard]: !state.layerVisibility.hazards[hazard],
        },
      },
    })),

  // Geolocation state
  userLocation: {
    latitude: 19.0596, // Default demo coordinates (BKC Mumbai)
    longitude: 72.8626,
    accuracy: null,
    loading: false,
    error: null,
    permissionState: 'prompt',
    isRealGps: false,
  },
  setUserLocation: (updates) =>
    set((state) => ({
      userLocation: {
        ...state.userLocation,
        ...updates,
      },
    })),

  // Emergency Services state
  nearbyServices: {
    hospitals: INITIAL_SERVICES.filter((s) => s.type === 'hospital').sort((a, b) => a.distanceMeters - b.distanceMeters),
    policeStations: INITIAL_SERVICES.filter((s) => s.type === 'police').sort((a, b) => a.distanceMeters - b.distanceMeters),
    fireStations: INITIAL_SERVICES.filter((s) => s.type === 'fire_station').sort((a, b) => a.distanceMeters - b.distanceMeters),
    shelters: INITIAL_SERVICES.filter((s) => s.type === 'shelter').sort((a, b) => a.distanceMeters - b.distanceMeters),
    loading: false,
    error: null,
  },
  setNearbyServices: (updates) =>
    set((state) => ({
      nearbyServices: {
        ...state.nearbyServices,
        ...updates,
      },
    })),

  // Active navigation
  activeNavigationDestination: null,
  setActiveNavigationDestination: (dest) => set({ activeNavigationDestination: dest }),

  // Selected hazard modal
  selectedHazard: null,
  setSelectedHazard: (hazard) => set({ selectedHazard: hazard }),

  // Global hazards feed
  globalHazards: PRE_SEEDED_GLOBAL_HAZARDS,
  setGlobalHazards: (hazards) => set({ globalHazards: hazards }),
  addGlobalHazards: (newHazards) =>
    set((state) => {
      const existingIds = new Set(state.globalHazards.map((h) => h.id));
      const filtered = newHazards.filter((h) => !existingIds.has(h.id));
      return { globalHazards: [...state.globalHazards, ...filtered] };
    }),

  // Live weather
  currentWeather: {
    temp: 28,
    precipitation: 42,
    windSpeed: 14,
    condition: 'Heavy Rain',
    alert: 'Critical Alert: Backflow detected at BKC Drainage Node 1',
  },
  setCurrentWeather: (currentWeather) => set({ currentWeather }),

  // Active searched place
  activePlaceName: 'Bandra Kurla Complex, Mumbai',
  setActivePlaceName: (activePlaceName) => set({ activePlaceName }),

  // Safety status for active coordinates
  safetyStatus: {
    level: 'danger',
    title: 'DANGER',
    message: 'High disaster risk detected near you.',
    hazardCount: 1,
    primaryHazard: MOCK_HAZARDS[0],
  },

  evaluateSafetyStatus: (lat: number, lng: number) => {
    const allKnownHazards = [...MOCK_HAZARDS, ...get().globalHazards];

    // Check intersection with all active hazards
    const intersectingHazards = allKnownHazards.filter((hazard) => {
      const dist = calculateHaversineDistance(lat, lng, hazard.latitude, hazard.longitude);
      return dist <= hazard.radius;
    });

    if (intersectingHazards.length === 0) {
      set({
        safetyStatus: {
          level: 'safe',
          title: 'SAFE',
          message: 'No major disaster detected near you.',
          hazardCount: 0,
        },
      });
      return;
    }

    const hasDanger = intersectingHazards.some(
      (h) => h.severity === 'critical' || h.severity === 'high'
    );
    const primary = intersectingHazards[0];

    if (hasDanger) {
      set({
        safetyStatus: {
          level: 'danger',
          title: 'DANGER',
          message: 'High disaster risk detected near you.',
          hazardCount: intersectingHazards.length,
          primaryHazard: primary,
        },
      });
    } else {
      set({
        safetyStatus: {
          level: 'warning',
          title: 'BE CAREFUL',
          message: 'Moderate disaster risk detected nearby.',
          hazardCount: intersectingHazards.length,
          primaryHazard: primary,
        },
      });
    }
  },

  mapCenterTarget: null,
  setMapCenterTarget: (target) => set({ mapCenterTarget: target }),
}));
