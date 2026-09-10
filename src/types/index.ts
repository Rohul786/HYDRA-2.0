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

export type SelectedEntity = 
  | { type: 'street'; data: InundationProperties }
  | { type: 'drain'; data: DrainageNodeProperties }
  | null;
