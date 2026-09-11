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
  BackendSafeRouteFeature,
  AlertLevel,
  NowcastWindowKey,
  NowcastWindowData,
  ExtremeRainfallEvent,
  RunoffEstimate,
  DrainageStressMetric,
  WaterloggingHotspot,
  MunicipalAuthority,
  MunicipalAlert,
  ContinuousUpdateCycle,
  ForecastReliabilityMetric,
  LocationMode,
} from '../types';
import type { FeatureCollection } from 'geojson';
import { calculateHaversineDistance, formatDistance, calculateEstimatedTravelTime } from '@/utils/geoDistance';
import { METRO_CONFIGS, METRO_DATASETS, getMetroGeoJSON } from '@/data/metroFloodData';
import {
  checkBackendHealth,
  fetchSafeRoute,
  fetchFloodRiskGeoJSON,
  fetchCurrentWeather,
} from '@/utils/apiClient';
import { calculateProbabilisticNowcast, detectExtremeRainfall } from '@/utils/nowcastEngine';
import { estimateUrbanRunoff } from '@/utils/runoffEngine';
import { calculateDrainageStress } from '@/utils/drainageStressEngine';
import { getNearestMunicipalAuthority } from '@/utils/municipalAuthorities';
import { dispatchMunicipalAlert } from '@/utils/municipalAlertService';
import { evaluateUpdateCycle } from '@/utils/continuousUpdateEngine';
import { getWaterloggingHotspots } from '@/utils/waterloggingHotspotsData';
import { INITIAL_FORECAST_RELIABILITY } from '@/utils/forecastReliability';

export type ExtendedLayerKey =
  | 'streets'
  | 'drainage'
  | 'hospitals'
  | 'police'
  | 'fire'
  | 'shelters'
  | 'routes'
  | 'hotspots';

export interface WeatherSummary {
  temp: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  radarReflectivityDbz: number;
  alert?: string;
}

interface FloodState {
  // Metro Selection & Location Mode
  activeMetro: MetroCity;
  setActiveMetro: (metro: MetroCity) => void;
  locationMode: LocationMode;
  setLocationMode: (mode: LocationMode) => void;
  switchToGps: () => void;

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

  layerVisibility: Record<ExtendedLayerKey, boolean>;
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

  // Backend Integration State & Telemetry
  backendStatus: 'connected' | 'connecting' | 'fallback';
  backendLatencyMs: number | null;
  backendError: string | null;
  liveSafeRoute: BackendSafeRouteFeature | null;
  isCalculatingRoute: boolean;
  liveFloodRiskGeoJSON: FeatureCollection | null;
  isSyncingFloodRisk: boolean;

  // --- SIH EXTENSIONS ---
  // Demo Mode for Presentation
  isDemoMode: boolean;
  toggleDemoMode: () => void;

  // Alert & Early Warning State
  alertLevel: AlertLevel;
  setAlertLevel: (level: AlertLevel) => void;
  nowcastData: Record<NowcastWindowKey, NowcastWindowData>;
  extremeRainfall: ExtremeRainfallEvent;
  runoffEstimate: RunoffEstimate;
  drainageStress: DrainageStressMetric;
  waterloggingHotspots: WaterloggingHotspot[];
  selectedHotspot: WaterloggingHotspot | null;
  setSelectedHotspot: (h: WaterloggingHotspot | null) => void;

  // Municipal Command & Alert System
  nearestMunicipality: MunicipalAuthority;
  municipalAlerts: MunicipalAlert[];
  triggerMunicipalAlert: (
    channels?: Array<'dashboard' | 'push' | 'sms' | 'email' | 'webhook'>
  ) => Promise<MunicipalAlert>;
  acknowledgeMunicipalAlert: (alertId: string) => void;

  // Continuous Update & False-Alert Downgrade Cycle
  updateCycle: ContinuousUpdateCycle;
  downgradeAlertState: (reason?: string) => void;

  // Forecast Reliability Metrics
  forecastReliability: ForecastReliabilityMetric;

  // Safety Disclaimer Modal State
  disclaimerModalOpen: boolean;
  openDisclaimerModal: () => void;
  closeDisclaimerModal: () => void;

  // Unified Hydrological Recalculation
  recalculateHydrologicalRisk: () => void;

  // Asynchronous Backend API Actions
  checkBackendConnection: () => Promise<void>;
  requestSafeRoute: (
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    avoidFloods?: boolean
  ) => Promise<void>;
  syncBackendFloodRisk: () => Promise<void>;
  syncBackendWeather: () => Promise<void>;
}

export const useFloodStore = create<FloodState>((set, get) => {
  const initialMetro: MetroCity = 'mumbai';
  const initialConfig = METRO_CONFIGS[initialMetro];
  const initialServices = METRO_DATASETS[initialMetro].emergencyServices.map((s) => {
    const dist = calculateHaversineDistance(
      initialConfig.center[0],
      initialConfig.center[1],
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

  const initialIntensity = 45;
  const initialNowcast = calculateProbabilisticNowcast(initialIntensity, 85, 1004, false);
  const initialExtreme = detectExtremeRainfall(initialIntensity, initialConfig.name, false);
  const initialRunoff = estimateUrbanRunoff(initialIntensity, initialMetro, false);
  const initialStress = calculateDrainageStress(initialRunoff.runoffVolumeM3, initialMetro, 'normal', 1, false);
  const initialMunicipality = getNearestMunicipalAuthority(initialConfig.center[0], initialConfig.center[1]);
  const initialHotspots = getWaterloggingHotspots(initialMetro, initialIntensity);
  const initialUpdate = evaluateUpdateCycle(initialIntensity, 65, 'OBSERVE');

  return {
    locationMode: 'metro',
    setLocationMode: (locationMode) => set({ locationMode }),
    switchToGps: () => {
      set({ locationMode: 'gps' });
    },

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

      const muni = getNearestMunicipalAuthority(config.center[0], config.center[1]);
      const hotspots = getWaterloggingHotspots(metro, get().rainfallIntensity);

      set({
        locationMode: 'metro',
        activeMetro: metro,
        mapCenterTarget: config.center,
        selectedFeature: null,
        activeNavigationDestination: null,
        nearestMunicipality: muni,
        waterloggingHotspots: hotspots,
        userLocation: {
          latitude: config.center[0],
          longitude: config.center[1],
          accuracy: null,
          loading: false,
          error: null,
          permissionState: get().userLocation.permissionState,
          isRealGps: false,
        },
        nearbyServices: {
          hospitals: metroServices.filter((s) => s.type === 'hospital').sort((a, b) => a.distanceMeters - b.distanceMeters),
          policeStations: metroServices.filter((s) => s.type === 'police').sort((a, b) => a.distanceMeters - b.distanceMeters),
          fireStations: metroServices.filter((s) => s.type === 'fire_station').sort((a, b) => a.distanceMeters - b.distanceMeters),
          shelters: metroServices.filter((s) => s.type === 'shelter').sort((a, b) => a.distanceMeters - b.distanceMeters),
          loading: false,
          error: null,
        },
      });

      get().recalculateHydrologicalRisk();
      get().evaluateSafetyStatus(config.center[0], config.center[1]);
      get().syncBackendWeather();
    },

    rainfallIntensity: initialIntensity,
    setRainfallIntensity: (intensity) => {
      set({ rainfallIntensity: intensity });
      get().recalculateHydrologicalRisk();
      const { userLocation } = get();
      if (userLocation.latitude && userLocation.longitude) {
        get().evaluateSafetyStatus(userLocation.latitude, userLocation.longitude);
      }
    },

    tidalState: 'normal',
    setTidalState: (tidalState) => {
      set({ tidalState });
      get().recalculateHydrologicalRisk();
    },

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
      hotspots: true,
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
    setUserLocation: (updates) => {
      set((state) => ({
        userLocation: {
          ...state.userLocation,
          ...updates,
        },
      }));
      const current = get().userLocation;
      if (current.latitude && current.longitude) {
        const muni = getNearestMunicipalAuthority(current.latitude, current.longitude);
        const metroData = METRO_DATASETS[get().activeMetro];
        if (metroData) {
          const updatedServices = metroData.emergencyServices.map((s) => {
            const dist = calculateHaversineDistance(current.latitude!, current.longitude!, s.latitude, s.longitude);
            return {
              ...s,
              distanceMeters: dist,
              distanceFormatted: formatDistance(dist),
              travelTimeMins: calculateEstimatedTravelTime(dist, 'driving'),
            };
          });

          set({
            nearestMunicipality: muni,
            nearbyServices: {
              hospitals: updatedServices.filter((s) => s.type === 'hospital').sort((a, b) => a.distanceMeters - b.distanceMeters),
              policeStations: updatedServices.filter((s) => s.type === 'police').sort((a, b) => a.distanceMeters - b.distanceMeters),
              fireStations: updatedServices.filter((s) => s.type === 'fire_station').sort((a, b) => a.distanceMeters - b.distanceMeters),
              shelters: updatedServices.filter((s) => s.type === 'shelter').sort((a, b) => a.distanceMeters - b.distanceMeters),
              loading: false,
              error: null,
            },
          });
        } else {
          set({ nearestMunicipality: muni });
        }
      }
    },

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
    setActiveNavigationDestination: (activeNavigationDestination) => {
      set({ activeNavigationDestination });
      if (activeNavigationDestination) {
        const { userLocation, activeMetro } = get();
        const cfg = METRO_CONFIGS[activeMetro];
        const sLat = userLocation.latitude ?? cfg.center[0];
        const sLon = userLocation.longitude ?? cfg.center[1];
        get().requestSafeRoute(
          sLat,
          sLon,
          activeNavigationDestination.latitude,
          activeNavigationDestination.longitude,
          true
        );
      } else {
        set({ liveSafeRoute: null });
      }
    },

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

      let nearestStreet: InundationProperties | null = null;
      let minDistance = Infinity;

      geo.inundation.features.forEach((feat) => {
        const coords = feat.geometry.coordinates;
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

    backendStatus: 'connecting',
    backendLatencyMs: null,
    backendError: null,
    liveSafeRoute: null,
    isCalculatingRoute: false,
    liveFloodRiskGeoJSON: null,
    isSyncingFloodRisk: false,

    // --- SIH PROTOTYPE EXTENSIONS ---
    isDemoMode: false,
    toggleDemoMode: () => {
      const nextDemo = !get().isDemoMode;
      set({ isDemoMode: nextDemo });
      if (nextDemo) {
        // Switch to SIH demo cloudburst scenario (80 mm/hr, high-tide surcharge)
        get().setRainfallIntensity(80);
        get().setTidalState('high_tide');
      } else {
        // Revert to normal monsoonal baseline (45 mm/hr)
        get().setRainfallIntensity(45);
        get().setTidalState('normal');
      }
    },

    alertLevel: initialUpdate.alertLevel,
    setAlertLevel: (alertLevel) => set({ alertLevel }),

    nowcastData: initialNowcast,
    extremeRainfall: initialExtreme,
    runoffEstimate: initialRunoff,
    drainageStress: initialStress,
    waterloggingHotspots: initialHotspots,
    selectedHotspot: null,
    setSelectedHotspot: (selectedHotspot) => set({ selectedHotspot }),

    nearestMunicipality: initialMunicipality,
    municipalAlerts: [],

    triggerMunicipalAlert: async (
      channels = ['dashboard', 'push', 'sms', 'email']
    ) => {
      const {
        activeMetro,
        nowcastData,
        drainageStress,
        alertLevel,
        nearestMunicipality,
      } = get();
      const cfg = METRO_CONFIGS[activeMetro];
      const eventId = `HYDRA-EVENT-${activeMetro.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;

      const alert = await dispatchMunicipalAlert({
        location: `${cfg.name} (${cfg.basinName})`,
        severity: alertLevel,
        expectedRainfallRange: nowcastData['60m'].expectedRangeMmHr,
        probabilityPct: nowcastData['60m'].probabilityPct,
        drainageStressPct: drainageStress.stressPct,
        waterloggingRisk:
          drainageStress.classification === 'Critical'
            ? 'CRITICAL'
            : drainageStress.classification === 'High'
            ? 'HIGH'
            : 'MODERATE',
        estimatedLeadTimeMins: 45,
        channels,
        recipientAuthorityName: nearestMunicipality.name,
        eventId,
        nearestOfficeName: nearestMunicipality.officeName,
      });

      set((state) => ({
        municipalAlerts: [alert, ...state.municipalAlerts],
      }));

      return alert;
    },

    acknowledgeMunicipalAlert: (alertId) => {
      set((state) => ({
        municipalAlerts: state.municipalAlerts.map((a) =>
          a.alertId === alertId
            ? {
                ...a,
                acknowledgementStatus: 'acknowledged' as const,
                acknowledgedAt: new Date().toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }) + ' IST',
              }
            : a
        ),
      }));
    },

    updateCycle: initialUpdate.cycle,

    downgradeAlertState: (reason) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      set((state) => ({
        alertLevel: 'DOWNGRADED',
        rainfallIntensity: Math.min(20, state.rainfallIntensity * 0.4),
        updateCycle: {
          stage: 'DOWNGRADED',
          previousProbabilityPct: state.updateCycle.currentProbabilityPct,
          currentProbabilityPct: 38,
          lastRecalculatedAt: `${timeStr} IST`,
          downgradeReason:
            reason ||
            'Conditions have weakened. Previous warning has been downgraded.',
          cycleHistory: [
            ...state.updateCycle.cycleHistory,
            { timeLabel: 'NOW', probabilityPct: 38, status: 'DOWNGRADED' },
          ],
        },
      }));
    },

    forecastReliability: INITIAL_FORECAST_RELIABILITY,

    disclaimerModalOpen: false,
    openDisclaimerModal: () => set({ disclaimerModalOpen: true }),
    closeDisclaimerModal: () => set({ disclaimerModalOpen: false }),

    // Unified Hydrological Recalculation across all coupled modules
    recalculateHydrologicalRisk: () => {
      const {
        rainfallIntensity,
        activeMetro,
        tidalState,
        isDemoMode,
        updateCycle,
      } = get();
      const config = METRO_CONFIGS[activeMetro];

      const nowcast = calculateProbabilisticNowcast(
        rainfallIntensity,
        85,
        1004,
        isDemoMode
      );
      const extreme = detectExtremeRainfall(
        rainfallIntensity,
        config.name,
        isDemoMode
      );
      const runoff = estimateUrbanRunoff(rainfallIntensity, activeMetro, isDemoMode);
      const stress = calculateDrainageStress(
        runoff.runoffVolumeM3,
        activeMetro,
        tidalState,
        1,
        isDemoMode
      );
      const hotspots = getWaterloggingHotspots(activeMetro, rainfallIntensity);
      const update = evaluateUpdateCycle(
        rainfallIntensity,
        updateCycle.currentProbabilityPct,
        updateCycle.stage
      );

      set({
        nowcastData: nowcast,
        extremeRainfall: extreme,
        runoffEstimate: runoff,
        drainageStress: stress,
        waterloggingHotspots: hotspots,
        updateCycle: update.cycle,
        alertLevel: update.alertLevel,
      });
    },

    checkBackendConnection: async () => {
      set({ backendStatus: 'connecting' });
      try {
        const result = await checkBackendHealth();
        if (result.ok && result.data) {
          set({
            backendStatus: 'connected',
            backendLatencyMs: result.latencyMs,
            backendError: null,
          });
        } else {
          set({
            backendStatus: 'fallback',
            backendLatencyMs: result.latencyMs,
            backendError: result.error || 'FastAPI service offline',
          });
        }
      } catch {
        set({
          backendStatus: 'fallback',
          backendLatencyMs: null,
          backendError: 'Failed connecting to backend API',
        });
      }
    },

    requestSafeRoute: async (startLat, startLon, endLat, endLon, avoidFloods = true) => {
      set({ isCalculatingRoute: true });
      try {
        const res = await fetchSafeRoute({
          startLat,
          startLon,
          endLat,
          endLon,
          avoidFloods,
          penaltyMultiplier: 100.0,
          algorithm: 'dijkstra',
        });

        if (res.success && res.route) {
          set({
            liveSafeRoute: res.route,
            isCalculatingRoute: false,
            backendStatus: 'connected',
          });
        } else {
          set({
            liveSafeRoute: null,
            isCalculatingRoute: false,
          });
        }
      } catch {
        set({
          liveSafeRoute: null,
          isCalculatingRoute: false,
        });
      }
    },

    syncBackendFloodRisk: async () => {
      const { activeMetro, rainfallIntensity } = get();
      const config = METRO_CONFIGS[activeMetro];
      const severity = rainfallIntensity >= 60 ? 'extreme' : rainfallIntensity >= 30 ? 'heavy' : 'moderate';

      set({ isSyncingFloodRisk: true });
      try {
        const res = await fetchFloodRiskGeoJSON({
          location: `${config.name}, India`,
          rainfallSource: 'synthetic',
          stormSeverity: severity,
          forceRefresh: false,
        });

        if (res.success && res.data) {
          set({
            liveFloodRiskGeoJSON: res.data,
            isSyncingFloodRisk: false,
            backendStatus: 'connected',
          });
        } else {
          set({ isSyncingFloodRisk: false });
        }
      } catch {
        set({ isSyncingFloodRisk: false });
      }
    },

    syncBackendWeather: async () => {
      const { activeMetro, userLocation } = get();
      const config = METRO_CONFIGS[activeMetro];
      const lat = userLocation.latitude ?? config.center[0];
      const lon = userLocation.longitude ?? config.center[1];

      try {
        const res = await fetchCurrentWeather({ lat, lon, location: config.name });
        if (res.success && res.data) {
          const c = res.data.current;
          set((state) => ({
            backendStatus: 'connected',
            currentWeather: {
              ...state.currentWeather,
              temp: Math.round(c.temperature_c),
              precipitation: c.precipitation_mm_hr > 0 ? c.precipitation_mm_hr : state.rainfallIntensity,
              windSpeed: Math.round(c.wind_speed_kmh),
              condition: c.weather_description || state.currentWeather.condition,
            },
          }));
        }
      } catch {
        // Keep existing simulated or cached weather
      }
    },
  };
});
