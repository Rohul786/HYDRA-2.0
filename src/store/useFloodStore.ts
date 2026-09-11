import { create } from 'zustand';
import {
  SelectedEntity,
  LeadTimeWindow,
  MetroCity,
  TidalState,
  EmergencyService,
  NearbyEmergencyServices,
  UserLocationState,
  UserSafetyStatus,
  InundationProperties,
} from '../types';
import { calculateHaversineDistance, formatDistance, calculateEstimatedTravelTime } from '@/utils/geoDistance';
import { METRO_CONFIGS, METRO_DATASETS, getMetroGeoJSON } from '@/data/metroFloodData';

export type ExtendedLayerKey =
  | 'streets'
  | 'drainage'
  | 'hospitals'
  | 'police'
  | 'fire'
  | 'shelters'
  | 'routes';

export interface WeatherSummary {
  temp: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  radarReflectivityDbz: number;
  alert?: string;
}

interface FloodState {
  // Metro Selection
  activeMetro: MetroCity;
  setActiveMetro: (metro: MetroCity) => void;

  // Real-time Doppler Radar & Hydraulic Parameters
  rainfallIntensity: number; // mm/hr (0 - 120)
  setRainfallIntensity: (intensity: number) => void;

  tidalState: TidalState;
  setTidalState: (state: TidalState) => void;

  selectedTimeWindow: LeadTimeWindow;
  setTimeWindow: (window: LeadTimeWindow) => void;

  activeRoute: 'primary' | 'alternate' | 'both';
  setActiveRoute: (route: 'primary' | 'alternate' | 'both') => void;

  selectedFeature: SelectedEntity;
  setSelectedFeature: (feature: SelectedEntity) => void;

  layerVisibility: {
    streets: boolean;
    drainage: boolean;
    hospitals: boolean;
    police: boolean;
    fire: boolean;
    shelters: boolean;
    routes: boolean;
  };
  toggleLayerVisibility: (layer: ExtendedLayerKey) => void;

  // Geolocation State
  userLocation: UserLocationState;
  setUserLocation: (location: Partial<UserLocationState>) => void;

  // Nearby Emergency Services (Shelters & Rescue)
  nearbyServices: NearbyEmergencyServices;
  setNearbyServices: (services: Partial<NearbyEmergencyServices>) => void;

  // Active Emergency Navigation
  activeNavigationDestination: EmergencyService | null;
  setActiveNavigationDestination: (dest: EmergencyService | null) => void;

  // Doppler Weather Summary
  currentWeather: WeatherSummary;
  setCurrentWeather: (w: WeatherSummary) => void;

  // Live Location-Aware Flood Safety Status
  safetyStatus: UserSafetyStatus;
  evaluateSafetyStatus: (lat: number, lng: number) => void;

  // Map panning target [lat, lng]
  mapCenterTarget: [number, number] | null;
  setMapCenterTarget: (target: [number, number] | null) => void;
}

export const useFloodStore = create<FloodState>((set, get) => {
  const initialMetro: MetroCity = 'mumbai';
  const initialServices = METRO_DATASETS[initialMetro].emergencyServices.map((s) => {
    const dist = calculateHaversineDistance(
      METRO_CONFIGS[initialMetro].center[0],
      METRO_CONFIGS[initialMetro].center[1],
      s.latitude,
      s.longitude
    );
    return {
      ...s,
      distanceMeters: dist,
      distanceFormatted: formatDistance(dist),
      travelTimeMins: calculateEstimatedTravelTime(dist, 'driving'),
    };
  });

  return {
    activeMetro: initialMetro,
    setActiveMetro: (metro) => {
      const config = METRO_CONFIGS[metro];
      const metroServices = METRO_DATASETS[metro].emergencyServices.map((s) => {
        const dist = calculateHaversineDistance(config.center[0], config.center[1], s.latitude, s.longitude);
        return {
          ...s,
          distanceMeters: dist,
          distanceFormatted: formatDistance(dist),
          travelTimeMins: calculateEstimatedTravelTime(dist, 'driving'),
        };
      });

      set({
        activeMetro: metro,
        mapCenterTarget: config.center,
        selectedFeature: null,
        activeNavigationDestination: null,
        nearbyServices: {
          hospitals: metroServices.filter((s) => s.type === 'hospital').sort((a, b) => a.distanceMeters - b.distanceMeters),
          policeStations: metroServices.filter((s) => s.type === 'police').sort((a, b) => a.distanceMeters - b.distanceMeters),
          fireStations: metroServices.filter((s) => s.type === 'fire_station').sort((a, b) => a.distanceMeters - b.distanceMeters),
          shelters: metroServices.filter((s) => s.type === 'shelter').sort((a, b) => a.distanceMeters - b.distanceMeters),
          loading: false,
          error: null,
        },
      });

      get().evaluateSafetyStatus(config.center[0], config.center[1]);
    },

    rainfallIntensity: 45, // 45 mm/hr Heavy monsoonal rain
    setRainfallIntensity: (intensity) => {
      set({ rainfallIntensity: intensity });
      const { userLocation } = get();
      if (userLocation.latitude && userLocation.longitude) {
        get().evaluateSafetyStatus(userLocation.latitude, userLocation.longitude);
      }
    },

    tidalState: 'normal',
    setTidalState: (tidalState) => set({ tidalState }),

    selectedTimeWindow: '0h',
    setTimeWindow: (selectedTimeWindow) => {
      set({ selectedTimeWindow });
      const { userLocation } = get();
      if (userLocation.latitude && userLocation.longitude) {
        get().evaluateSafetyStatus(userLocation.latitude, userLocation.longitude);
      }
    },

    activeRoute: 'both',
    setActiveRoute: (activeRoute) => set({ activeRoute }),

    selectedFeature: null,
    setSelectedFeature: (selectedFeature) => set({ selectedFeature }),

    layerVisibility: {
      streets: true,
      drainage: true,
      hospitals: true,
      police: true,
      fire: true,
      shelters: true,
      routes: true,
    },
    toggleLayerVisibility: (layer) =>
      set((state) => ({
        layerVisibility: {
          ...state.layerVisibility,
          [layer]: !state.layerVisibility[layer],
        },
      })),

    userLocation: {
      latitude: 19.0626, // Default BKC Mumbai
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

    nearbyServices: {
      hospitals: initialServices.filter((s) => s.type === 'hospital').sort((a, b) => a.distanceMeters - b.distanceMeters),
      policeStations: initialServices.filter((s) => s.type === 'police').sort((a, b) => a.distanceMeters - b.distanceMeters),
      fireStations: initialServices.filter((s) => s.type === 'fire_station').sort((a, b) => a.distanceMeters - b.distanceMeters),
      shelters: initialServices.filter((s) => s.type === 'shelter').sort((a, b) => a.distanceMeters - b.distanceMeters),
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

    activeNavigationDestination: null,
    setActiveNavigationDestination: (activeNavigationDestination) =>
      set({ activeNavigationDestination }),

    currentWeather: {
      temp: 28,
      precipitation: 45,
      windSpeed: 16,
      radarReflectivityDbz: 48,
      condition: 'Heavy Monsoonal Rain',
      alert: 'Doppler Warning: Rapid street inundation (+45cm) forecast in low micro-DEM zones',
    },
    setCurrentWeather: (currentWeather) => set({ currentWeather }),

    safetyStatus: {
      level: 'danger',
      title: 'DANGER',
      message: 'Severe street inundation (+45 cm) detected near your location.',
      waterDepthCm: 45,
      activeNowcastHorizon: '0h',
      nearestHotspot: 'BKC Road (Diamond Bourse Section)',
    },

    evaluateSafetyStatus: (lat: number, lng: number) => {
      const { activeMetro, selectedTimeWindow, rainfallIntensity, tidalState } = get();
      const geo = getMetroGeoJSON(activeMetro, selectedTimeWindow, rainfallIntensity, tidalState);

      // Find nearest street inundation
      let nearestStreet: InundationProperties | null = null;
      let minDistance = Infinity;

      geo.inundation.features.forEach((feat) => {
        const coords = feat.geometry.coordinates;
        // Check midpoint distance
        const midIdx = Math.floor(coords.length / 2);
        const [sLng, sLat] = coords[midIdx];
        const dist = calculateHaversineDistance(lat, lng, sLat, sLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestStreet = feat.properties;
        }
      });

      if (!nearestStreet || minDistance > 1500) {
        set({
          safetyStatus: {
            level: 'safe',
            title: 'SAFE',
            message: 'No immediate street flooding detected near your coordinates.',
            waterDepthCm: 0,
            activeNowcastHorizon: selectedTimeWindow,
          },
        });
        return;
      }

      const street = nearestStreet as InundationProperties;
      if (street.waterDepthCm >= 25) {
        set({
          safetyStatus: {
            level: 'danger',
            title: 'CRITICAL INUNDATION',
            message: `${street.streetName} submerged under ${street.waterDepthCm} cm water. Avoid road travel.`,
            waterDepthCm: street.waterDepthCm,
            activeNowcastHorizon: selectedTimeWindow,
            nearestHotspot: street.streetName,
          },
        });
      } else if (street.waterDepthCm >= 10) {
        set({
          safetyStatus: {
            level: 'warning',
            title: 'WATERLOGGING CAUTION',
            message: `Moderate waterlogging (${street.waterDepthCm} cm) on ${street.streetName}. Two-wheelers use caution.`,
            waterDepthCm: street.waterDepthCm,
            activeNowcastHorizon: selectedTimeWindow,
            nearestHotspot: street.streetName,
          },
        });
      } else {
        set({
          safetyStatus: {
            level: 'safe',
            title: 'CLEAR CORRIDOR',
            message: `Road surface passable (${street.waterDepthCm} cm depth) on ${street.streetName}.`,
            waterDepthCm: street.waterDepthCm,
            activeNowcastHorizon: selectedTimeWindow,
            nearestHotspot: street.streetName,
          },
        });
      }
    },

    mapCenterTarget: null,
    setMapCenterTarget: (mapCenterTarget) => set({ mapCenterTarget }),
  };
});
