import { Feature, LineString, Polygon, Point } from 'geojson';

export type LeadTimeWindow = '0h' | '1h' | '2h' | '3h';

export interface InundationProperties {
  segmentId: string;
  streetName: string;
  waterDepthCm: number;
  riskLevel: 'safe' | 'warning' | 'critical';
  predictedTimeWindow: LeadTimeWindow;
  // Micro-topography & DEM
  elevationM: number;
  slopePct: number;
  imperviousnessPct: number; // Concrete / asphalt fraction (e.g. 90%)
  catchmentAreaHa: number;
  // Hydraulic coupling
  runoffLps?: number;
  nearestDrainNodeId?: string;
  drainBackflowLps?: number;
  flowVelocityMs?: number;
  timeToPeakMins?: number;
}

export type InundationFeature = Feature<LineString | Polygon, InundationProperties>;

export type DrainageNodeType = 'inlet' | 'manhole' | 'outfall' | 'pumping_station';

export interface DrainageNodeProperties {
  nodeId: string;
  nodeName: string;
  type: DrainageNodeType;
  groundElevationM: number;
  invertElevationM: number;
  designCapacityLps: number;
  inflowLps: number;
  capacityUtilization: number; // percentage (0 - 200%)
  status: 'normal' | 'congested' | 'surcharging';
  backflowLps: number; // Volume spilling back onto streets
  depthToWaterM?: number;
}

export type DrainageNodeFeature = Feature<Point, DrainageNodeProperties>;

export interface DrainagePipeProperties {
  pipeId: string;
  fromNode: string;
  toNode: string;
  diameterMm: number;
  lengthM: number;
  slopePct: number;
  hydraulicCapacityLps: number;
  currentFlowLps: number;
  utilizationPct: number;
  isChoked: boolean;
}

export type DrainagePipeFeature = Feature<LineString, DrainagePipeProperties>;

export interface RouteProperties {
  type: 'primary' | 'alternate';
  status: 'blocked' | 'inundated' | 'safe' | 'passable';
  distanceKm: number;
  estimatedTimeMins: number;
  message: string;
  maxFloodDepthCm?: number;
  elevationGainM?: number;
}

export type RouteFeature = Feature<LineString, RouteProperties>;

// Major Indian Metro Basins
export type MetroCity =
  | 'mumbai'
  | 'delhi'
  | 'chennai'
  | 'bengaluru'
  | 'kolkata'
  | 'hyderabad'
  | 'kochi';

export type LocationMode = 'gps' | 'metro';

export interface MetroBasinConfig {
  id: MetroCity;
  name: string;
  regionName: string; // e.g. "Mumbai Metropolitan Region", "National Capital Region (NCR)"
  basinName: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  demRangeM: [number, number]; // [min, max]
  radarStation: string;
  primaryOutfall: string;
  description: string;
  searchKeywords?: string[];
}

export type TidalState = 'low_tide' | 'normal' | 'high_tide';

// Emergency Services Model (Preserved for Flood Evacuation)
export type EmergencyServiceType = 'hospital' | 'police' | 'fire_station' | 'shelter';

export interface EmergencyService {
  id: string;
  type: EmergencyServiceType;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  distanceFormatted: string;
  travelTimeMins?: number;
  address?: string;
  phone?: string;
  capacity?: number;
  isDemoFallback?: boolean;
  source?: string; // e.g. "Official Government Data" | "OpenStreetMap Verified Geospatial Data"
  verification_status?: 'verified' | 'unverified';
  last_verified?: string;
  category?: EmergencyServiceType;
}

export interface NearbyEmergencyServices {
  hospitals: EmergencyService[];
  policeStations: EmergencyService[];
  fireStations: EmergencyService[];
  shelters: EmergencyService[];
  loading: boolean;
  error: string | null;
  lastUpdated?: number;
}

// User Geolocation State
export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unavailable';
  isRealGps: boolean;
}

// Flood Safety Status
export type SafetyLevel = 'safe' | 'warning' | 'danger';

export interface UserSafetyStatus {
  level: SafetyLevel;
  title: string;
  message: string;
  waterDepthCm: number;
  activeNowcastHorizon: LeadTimeWindow;
  nearestHotspot?: string;
}

export type SelectedEntity =
  | { type: 'street'; data: InundationProperties }
  | { type: 'drain'; data: DrainageNodeProperties }
  | { type: 'emergency'; data: EmergencyService }
  | null;

// Backend API Integration Types
export interface BackendHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  timestamp: string;
  uptime_seconds: number;
  in_memory_graphs: {
    road_network: {
      loaded: boolean;
      nodes: number;
      edges: number;
      source?: string;
    };
    drainage_network: {
      loaded: boolean;
      nodes: number;
      edges: number;
      source?: string;
    };
  };
}

export interface BackendSafeRouteProperties {
  distance_m: number;
  distance_km: number;
  baseline_distance_m: number;
  detour_additional_m: number;
  safe: boolean;
  routing_strategy: string;
  pathfinding_algorithm: string;
  flooded_segments_avoided: number;
  flooded_segments_traversed: number;
  total_flooded_edges_in_network: number;
  flood_risk_source: string;
  drainage_network_loaded: boolean;
  nodes_count: number;
  start: {
    lat: number;
    lon: number;
    geojson_coords: [number, number];
    leaflet_coords: [number, number];
    snapped_node?: number;
  };
  end: {
    lat: number;
    lon: number;
    geojson_coords: [number, number];
    leaflet_coords: [number, number];
    snapped_node?: number;
  };
  calculation_time_ms: number;
}

export type BackendSafeRouteFeature = Feature<LineString, BackendSafeRouteProperties>;

export interface BackendWeatherCurrentResponse {
  status: string;
  provider: string;
  latitude: number;
  longitude: number;
  state_name: string;
  timezone: string;
  current: {
    temperature_c: number;
    feels_like_c?: number;
    humidity_pct: number;
    precipitation_mm_hr: number;
    weather_code: number;
    weather_description: string;
    wind_speed_kmh: number;
    wind_direction_deg?: number;
    uv_index?: number;
    pressure_hpa?: number;
  };
  hourly_next_6h?: Array<{
    time: string;
    temperature_c: number;
    humidity_pct: number;
    precipitation_mm: number;
    precipitation_probability_pct: number;
    weather_code: number;
    weather_description: string;
    wind_speed_kmh: number;
    uv_index?: number;
  }>;
  is_fallback: boolean;
  fallback_tier?: string;
  fetched_at: string;
}

// SIH Early Warning & Probabilistic Nowcasting Types
export type AlertLevel = 'MONITOR' | 'WATCH' | 'PRE_ALERT' | 'CRITICAL' | 'DOWNGRADED';

export type NowcastWindowKey = '30m' | '60m' | '120m';

export interface NowcastWindowData {
  timeWindow: string; // e.g. "Next 30 minutes", "Next 60 minutes", "Next 120 minutes"
  expectedRangeMmHr: string; // e.g. "55–85 mm/hour"
  minRainfallMmHr: number;
  maxRainfallMmHr: number;
  probabilityPct: number; // e.g. 78%
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  alertType: 'MONITOR' | 'WATCH' | 'PRE_ALERT' | 'CRITICAL';
  intensityLabel: 'Light' | 'Moderate' | 'Heavy' | 'Very Heavy / Extreme';
  dataSource: string;
  lastUpdated: string;
  isSimulated?: boolean;
}

export interface ExtremeRainfallEvent {
  detected: boolean;
  title: string; // "Potential Extreme Rainfall Event" | "Cloudburst-like rainfall risk"
  probabilityPct: number;
  expectedIntensity: 'Moderate' | 'Heavy' | 'Very Heavy / Extreme';
  estimatedArrivalMins: number;
  expectedDurationMins: number;
  confidence: 'Low' | 'Medium' | 'Medium-High' | 'High';
  affectedArea: string;
  movementDirection: string;
  isSimulated?: boolean;
}

export interface RunoffEstimate {
  rainfallMm: number; // e.g. 100 mm
  runoffVolumeM3: number; // e.g. 72,000 m3
  catchmentAreaHa: number;
  runoffCoefficient: number; // e.g. 0.72 (impervious vs pervious)
  imperviousAreaPct: number;
  isSimulated?: boolean;
  formulaDescription: string;
}

export interface DrainageStressMetric {
  inflowLps: number;
  capacityLps: number;
  stressPct: number; // e.g. 145%
  potentialExcessM3: number; // e.g. 25,000 m3
  classification: 'Normal' | 'Moderate' | 'High' | 'Critical';
  pumpsOperatingCount: number;
  pumpsTotalCount: number;
  isSimulated?: boolean;
}

export interface WaterloggingHotspot {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  rainfallRange: string;
  expectedRunoffM3: string;
  drainageStressPct: number;
  estimatedWaterDepthRangeM: string; // e.g. "0.4–0.8 m"
  timeToImpactMins: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  nearbyCriticalInfrastructure: string[];
  recommendedAction: string;
}

export interface MunicipalAuthority {
  id: string;
  name: string;
  shortCode?: string;
  jurisdiction: string;
  coverageZone?: string;
  controlRoomName: string;
  officeName: string;
  officeAddress: string;
  officeCoords: [number, number]; // [lat, lng] for View on Map & Get Directions
  distanceKm: number;
  status: 'Available' | 'Active Monitoring' | 'Emergency Operations Active';
  contact: string;
  emergencyPhone: string;
  hasVerifiedContact: boolean;
  directoryGuidance?: string;
  address: string;
  source: string; // e.g. "Official Government Data / Municipal Gazette"
  verificationStatus: 'verified' | 'unverified';
  lastVerified?: string;
}

export interface MunicipalAlert {
  alertId: string; // e.g. "HYDRA-2026-00125"
  eventId?: string; // e.g. "HYDRA-EVENT-MUM-001" for deduplication
  timestamp: string;
  location: string;
  severity: AlertLevel;
  expectedRainfallRange: string;
  probabilityPct: number;
  drainageStressPct: number;
  waterloggingRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estimatedLeadTimeMins: number;
  channels: Array<'dashboard' | 'push' | 'sms' | 'email' | 'webhook'>;
  deliveryStatus: 'generated' | 'sending' | 'delivered' | 'failed';
  acknowledgementStatus: 'pending' | 'acknowledged' | 'escalated';
  acknowledgedAt?: string;
  recommendedActions: string[];
  responsibleAuthorityName?: string;
  nearestOfficeName?: string;
}

export type UpdateCycleStage =
  | 'OBSERVE'
  | 'ANALYZE'
  | 'ESTIMATE'
  | 'UPDATE'
  | 'VERIFY'
  | 'RECALCULATE'
  | 'ALERT'
  | 'DOWNGRADED';

export interface ContinuousUpdateCycle {
  stage: UpdateCycleStage;
  previousProbabilityPct: number;
  currentProbabilityPct: number;
  lastRecalculatedAt: string;
  downgradeReason?: string;
  cycleHistory: Array<{
    timeLabel: string;
    probabilityPct: number;
    status: string;
  }>;
}

export interface ForecastReliabilityMetric {
  historicalEventsCount: number;
  detectionRatePct: number;
  meanLeadTimeMins: number;
  meanErrorPct: number;
  recentEvaluations: Array<{
    eventId: string;
    date: string;
    predictedRange: string;
    observedMm: number;
    forecastErrorPct: number;
    leadTimeMins: number;
    result: string;
  }>;
}

export interface MultiDisasterEvent {
  id: string;
  type:
    | 'Flood'
    | 'Flash Flood'
    | 'Extreme Rainfall'
    | 'Cloudburst Risk'
    | 'Cyclone'
    | 'Landslide'
    | 'Lightning'
    | 'Storm'
    | 'Heatwave';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  location: string;
  time: string;
  probabilityPct: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedArea: string;
  officialSource: string;
}

export interface ExplainableRiskFactor {
  icon: string;
  label: string;
  value: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
}

// User Profile & Onboarding Types
export interface UserProfile {
  id: string;
  googleId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  phone?: string | null;
  phoneVerified: boolean;
  smsConsent: boolean;
  pushConsent: boolean;
  locationPermission: 'prompt' | 'granted' | 'denied' | 'manual';
  createdAt: string;
}

export interface UserAlertPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  severeRainfall: boolean;
  floodRisk: boolean;
  waterlogging: boolean;
  cyclone: boolean;
  extremeWeather: boolean;
  nearbyDisaster: boolean;
  municipalAlerts: boolean;
}

export interface UserAlertHistoryItem {
  id: string;
  eventId: string;
  timestamp: string;
  alertType: string;
  severity: AlertLevel;
  location: string;
  probabilityPct: number;
  channels: string[];
  deliveryStatus: 'Delivered' | 'Pending' | 'Suppressed';
  isDemo?: boolean;
}



