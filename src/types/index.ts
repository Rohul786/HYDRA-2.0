import { Feature, LineString, Polygon, Point } from 'geojson';

export interface InundationProperties {
  segmentId: string;
  streetName: string;
  waterDepthCm: number;
  riskLevel: 'safe' | 'warning' | 'critical';
  predictedTimeWindow: '0h' | '1h' | '2h' | '3h';
}

export type InundationFeature = Feature<LineString | Polygon, InundationProperties>;

export interface DrainageNodeProperties {
  nodeId: string;
  status: 'normal' | 'congested' | 'surcharging';
  capacityUtilization: number;
}

export type DrainageNodeFeature = Feature<Point | LineString, DrainageNodeProperties>;

export interface RouteProperties {
  type: 'primary' | 'alternate';
  status: 'blocked' | 'inundated' | 'safe' | 'passable';
  distanceKm: number;
  estimatedTimeMins: number;
  message: string;
}

export type RouteFeature = Feature<LineString, RouteProperties>;

// Multi-Disaster Hazard Model
export type HazardType =
  | 'flood'
  | 'cyclone'
  | 'earthquake'
  | 'landslide'
  | 'wildfire'
  | 'tsunami'
  | 'severe_storm'
  | 'extreme_rainfall'
  | 'heatwave';

export type HazardSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface HazardItem {
  id: string;
  type: HazardType;
  name: string;
  severity: HazardSeverity;
  riskScore: number; // 0-100
  latitude: number;
  longitude: number;
  radius: number; // in meters (radius of impact zone)
  timestamp: string;
  description: string;
  recommendedAction: string;
}

// Emergency Services Model
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
  capacity?: number; // strictly only if real data or explicit mock
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

// User Safety Status
export type SafetyLevel = 'safe' | 'warning' | 'danger';

export interface UserSafetyStatus {
  level: SafetyLevel;
  title: string;
  message: string;
  hazardCount: number;
  primaryHazard?: HazardItem;
}

export type SelectedEntity = 
  | { type: 'street'; data: InundationProperties }
  | { type: 'drain'; data: DrainageNodeProperties }
  | { type: 'hazard'; data: HazardItem }
  | { type: 'emergency'; data: EmergencyService }
  | null;
