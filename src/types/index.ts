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
export type MetroCity = 'mumbai' | 'delhi' | 'chennai';

export interface MetroBasinConfig {
  id: MetroCity;
  name: string;
  basinName: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  demRangeM: [number, number]; // [min, max]
  radarStation: string;
  primaryOutfall: string;
  description: string;
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
