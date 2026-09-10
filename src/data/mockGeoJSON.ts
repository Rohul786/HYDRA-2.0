import { FeatureCollection, LineString, Polygon, Point } from 'geojson';
import { InundationProperties, DrainageNodeProperties, RouteProperties } from '../types';

// Near Bandra Kurla Complex (BKC), Mumbai
export const INUNDATION_DATA: FeatureCollection<LineString | Polygon, InundationProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8596, 19.0596],
          [72.8626, 19.0596],
          [72.8626, 19.0626],
        ],
      },
      properties: {
        segmentId: 'seg_1',
        streetName: 'BKC Road',
        waterDepthCm: 45,
        riskLevel: 'critical',
        predictedTimeWindow: '0h',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8626, 19.0626],
          [72.8656, 19.0656],
        ],
      },
      properties: {
        segmentId: 'seg_2',
        streetName: 'BKC Road Extension',
        waterDepthCm: 15,
        riskLevel: 'warning',
        predictedTimeWindow: '0h',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8656, 19.0656],
          [72.8686, 19.0686],
        ],
      },
      properties: {
        segmentId: 'seg_3',
        streetName: 'LBS Marg',
        waterDepthCm: 5,
        riskLevel: 'safe',
        predictedTimeWindow: '0h',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8596, 19.0596],
          [72.8626, 19.0596],
          [72.8626, 19.0626],
        ],
      },
      properties: {
        segmentId: 'seg_1_1h',
        streetName: 'BKC Road',
        waterDepthCm: 60,
        riskLevel: 'critical',
        predictedTimeWindow: '1h',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8626, 19.0626],
          [72.8656, 19.0656],
        ],
      },
      properties: {
        segmentId: 'seg_2_1h',
        streetName: 'BKC Road Extension',
        waterDepthCm: 35,
        riskLevel: 'critical',
        predictedTimeWindow: '1h',
      },
    },
  ],
};

export const DRAINAGE_DATA: FeatureCollection<Point | LineString, DrainageNodeProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.8610, 19.0596],
      },
      properties: {
        nodeId: 'node_1',
        status: 'surcharging',
        capacityUtilization: 110,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.8640, 19.0640],
      },
      properties: {
        nodeId: 'node_2',
        status: 'congested',
        capacityUtilization: 85,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.8670, 19.0670],
      },
      properties: {
        nodeId: 'node_3',
        status: 'normal',
        capacityUtilization: 40,
      },
    },
  ],
};

export const ROUTE_DATA: FeatureCollection<LineString, RouteProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8596, 19.0596],
          [72.8626, 19.0596],
          [72.8626, 19.0626],
          [72.8656, 19.0656],
        ],
      },
      properties: {
        type: 'primary',
        status: 'blocked',
        distanceKm: 2.5,
        estimatedTimeMins: 25,
        message: 'Blocked at BKC Road (+45 cm depth)',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.8596, 19.0596],
          [72.8596, 19.0656],
          [72.8656, 19.0656],
        ],
      },
      properties: {
        type: 'alternate',
        status: 'safe',
        distanceKm: 3.2,
        estimatedTimeMins: 12,
        message: 'Clear via Western Express Highway (+8 mins)',
      },
    },
  ],
};
