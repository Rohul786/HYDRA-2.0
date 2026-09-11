import { FeatureCollection, LineString, Point } from 'geojson';
import {
  MetroCity,
  MetroBasinConfig,
  InundationProperties,
  DrainageNodeProperties,
  DrainagePipeProperties,
  RouteProperties,
  EmergencyService,
} from '@/types';
import { DrainageGraphNode, DrainageGraphEdge } from '@/utils/drainageGraph';

export const METRO_CONFIGS: Record<MetroCity, MetroBasinConfig> = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    basinName: 'Mithi River & BKC Basin',
    state: 'Maharashtra',
    center: [19.0626, 72.8626], // BKC
    zoom: 14,
    demRangeM: [2, 14],
    radarStation: 'IMD Colaba Doppler (DWR)',
    primaryOutfall: 'Mahim Creek / Arabian Sea',
    description: 'Hyper-local flood nowcast for Mumbai financial district & Mithi River drainage bottleneck.',
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    basinName: 'Minto Bridge & Central Yamuna Basin',
    state: 'Delhi',
    center: [28.6342, 77.2255], // Minto Bridge / Connaught Place
    zoom: 14,
    demRangeM: [208, 222],
    radarStation: 'IMD Palam Doppler (DWR)',
    primaryOutfall: 'Najafgarh & Barapullah Drains / Yamuna River',
    description: 'Depression-driven urban flood nowcast for railway underpasses and Ring Road bottlenecks.',
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai',
    basinName: 'Velachery & Adyar Basin',
    state: 'Tamil Nadu',
    center: [12.9785, 80.2185], // Velachery
    zoom: 14,
    demRangeM: [4, 16],
    radarStation: 'IMD Chennai Port Doppler (DWR)',
    primaryOutfall: 'Adyar River Estuary / Bay of Bengal',
    description: 'Coastal marshland & lake overflow nowcasting system subject to tidal backwater choke.',
  },
};

export interface MetroDataset {
  streets: {
    coordinates: [number, number][]; // LineString
    properties: Omit<InundationProperties, 'waterDepthCm' | 'riskLevel' | 'predictedTimeWindow'>;
  }[];
  drainageNodes: DrainageGraphNode[];
  drainageEdges: DrainageGraphEdge[];
  routes: {
    coordinates: [number, number][];
    properties: RouteProperties;
  }[];
  emergencyServices: EmergencyService[];
}

export const METRO_DATASETS: Record<MetroCity, MetroDataset> = {
  // ==========================================
  // MUMBAI BASIN (BKC & MITHI RIVER)
  // ==========================================
  mumbai: {
    streets: [
      {
        coordinates: [
          [72.8596, 19.0596],
          [72.8626, 19.0596],
          [72.8626, 19.0626],
        ],
        properties: {
          segmentId: 'mum_seg_1',
          streetName: 'BKC Road (Diamond Bourse Section)',
          elevationM: 4.2,
          slopePct: 0.8,
          imperviousnessPct: 94,
          catchmentAreaHa: 4.8,
          nearestDrainNodeId: 'mum_node_1',
        },
      },
      {
        coordinates: [
          [72.8626, 19.0626],
          [72.8656, 19.0656],
        ],
        properties: {
          segmentId: 'mum_seg_2',
          streetName: 'BKC Connector - Mithi Embankment',
          elevationM: 3.5,
          slopePct: 0.5,
          imperviousnessPct: 92,
          catchmentAreaHa: 6.2,
          nearestDrainNodeId: 'mum_node_2',
        },
      },
      {
        coordinates: [
          [72.8656, 19.0656],
          [72.8696, 19.0686],
        ],
        properties: {
          segmentId: 'mum_seg_3',
          streetName: 'LBS Marg (Kurla Junction)',
          elevationM: 2.8, // Bowl depression
          slopePct: 0.4,
          imperviousnessPct: 95,
          catchmentAreaHa: 8.5,
          nearestDrainNodeId: 'mum_node_2',
        },
      },
      {
        coordinates: [
          [72.8556, 19.0566],
          [72.8596, 19.0596],
        ],
        properties: {
          segmentId: 'mum_seg_4',
          streetName: 'Western Express Flyover Approach',
          elevationM: 11.4, // Elevated safe corridor
          slopePct: 2.8,
          imperviousnessPct: 88,
          catchmentAreaHa: 3.1,
          nearestDrainNodeId: 'mum_node_3',
        },
      },
      {
        coordinates: [
          [72.8696, 19.0686],
          [72.8736, 19.0716],
        ],
        properties: {
          segmentId: 'mum_seg_5',
          streetName: 'Santa Cruz-Chembur Link Road (SCLR)',
          elevationM: 9.8,
          slopePct: 2.1,
          imperviousnessPct: 90,
          catchmentAreaHa: 5.0,
          nearestDrainNodeId: 'mum_node_3',
        },
      },
    ],
    drainageNodes: [
      {
        nodeId: 'mum_node_1',
        nodeName: 'BKC Central Stormwater Sump #1',
        type: 'inlet',
        coordinates: [72.8610, 19.0596],
        groundElevationM: 4.2,
        invertElevationM: 1.2,
        designCapacityLps: 420,
        inflowLps: 380,
        capacityUtilization: 90,
        status: 'congested',
        backflowLps: 0,
        upstreamPipes: [],
        downstreamPipes: ['mum_pipe_1'],
      },
      {
        nodeId: 'mum_node_2',
        nodeName: 'Mithi River Gravity Surcharge Inlet',
        type: 'manhole',
        coordinates: [72.8640, 19.0640],
        groundElevationM: 3.2,
        invertElevationM: 0.5,
        designCapacityLps: 350,
        inflowLps: 480,
        capacityUtilization: 137,
        status: 'surcharging',
        backflowLps: 130,
        upstreamPipes: ['mum_pipe_1'],
        downstreamPipes: ['mum_pipe_2'],
      },
      {
        nodeId: 'mum_node_3',
        nodeName: 'Bandra Reclamation High-Level Trunk',
        type: 'pumping_station',
        coordinates: [72.8670, 19.0670],
        groundElevationM: 9.5,
        invertElevationM: 4.5,
        designCapacityLps: 850,
        inflowLps: 320,
        capacityUtilization: 38,
        status: 'normal',
        backflowLps: 0,
        upstreamPipes: [],
        downstreamPipes: ['mum_pipe_3'],
      },
      {
        nodeId: 'mum_node_outfall',
        nodeName: 'Mahim Creek Tidal Outfall Flap Gate',
        type: 'outfall',
        coordinates: [72.8680, 19.0610],
        groundElevationM: 1.5,
        invertElevationM: -0.8,
        designCapacityLps: 900,
        inflowLps: 800,
        capacityUtilization: 89,
        status: 'normal',
        backflowLps: 0,
        upstreamPipes: ['mum_pipe_2'],
        downstreamPipes: [],
      },
    ],
    drainageEdges: [
      {
        pipeId: 'mum_pipe_1',
        fromNode: 'mum_node_1',
        toNode: 'mum_node_2',
        diameterMm: 1200,
        lengthM: 450,
        slopePct: 0.4,
        hydraulicCapacityLps: 400,
        currentFlowLps: 380,
        utilizationPct: 95,
        isChoked: false,
        coordinates: [
          [72.8610, 19.0596],
          [72.8640, 19.0640],
        ],
      },
      {
        pipeId: 'mum_pipe_2',
        fromNode: 'mum_node_2',
        toNode: 'mum_node_outfall',
        diameterMm: 1600,
        lengthM: 600,
        slopePct: 0.2,
        hydraulicCapacityLps: 550,
        currentFlowLps: 550,
        utilizationPct: 100,
        isChoked: true,
        coordinates: [
          [72.8640, 19.0640],
          [72.8680, 19.0610],
        ],
      },
      {
        pipeId: 'mum_pipe_3',
        fromNode: 'mum_node_3',
        toNode: 'mum_node_outfall',
        diameterMm: 1800,
        lengthM: 700,
        slopePct: 0.8,
        hydraulicCapacityLps: 850,
        currentFlowLps: 320,
        utilizationPct: 38,
        isChoked: false,
        coordinates: [
          [72.8670, 19.0670],
          [72.8680, 19.0610],
        ],
      },
    ],
    routes: [
      {
        coordinates: [
          [72.8596, 19.0596],
          [72.8626, 19.0596],
          [72.8626, 19.0626],
          [72.8656, 19.0656],
        ],
        properties: {
          type: 'primary',
          status: 'blocked',
          distanceKm: 2.5,
          estimatedTimeMins: 32,
          message: 'Blocked: BKC Road submerged under +45 cm water due to Mithi backflow',
          maxFloodDepthCm: 45,
        },
      },
      {
        coordinates: [
          [72.8596, 19.0596],
          [72.8556, 19.0566],
          [72.8580, 19.0640],
          [72.8670, 19.0670],
        ],
        properties: {
          type: 'alternate',
          status: 'safe',
          distanceKm: 3.4,
          estimatedTimeMins: 14,
          message: 'Flood-Safe: Elevated Western Expressway via BKC Flyover (Clear / Dry)',
          maxFloodDepthCm: 4,
          elevationGainM: 7.2,
        },
      },
    ],
    emergencyServices: [
      {
        id: 'mum_hosp_1',
        type: 'hospital',
        name: 'Asian Heart Institute & Research Centre',
        latitude: 19.0664,
        longitude: 72.8681,
        distanceMeters: 480,
        distanceFormatted: '480 m',
        address: 'Plot No. C-25/26, G-N Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
        phone: '+91 22 6698 6666',
        capacity: 250,
      },
      {
        id: 'mum_hosp_2',
        type: 'hospital',
        name: 'Guru Nanak Hospital & Research Centre',
        latitude: 19.0572,
        longitude: 72.8492,
        distanceMeters: 1200,
        distanceFormatted: '1.2 km',
        address: 'S1, Gandhi Nagar, Bandra East, Mumbai, Maharashtra 400051',
        phone: '+91 22 4222 7777',
        capacity: 200,
      },
      {
        id: 'mum_hosp_3',
        type: 'hospital',
        name: 'Lilavati Hospital & Research Centre',
        latitude: 19.0514,
        longitude: 72.8295,
        distanceMeters: 3800,
        distanceFormatted: '3.8 km',
        address: 'A-791, Bandra Reclamation, K.C. Marg, Bandra West, Mumbai, Maharashtra 400050',
        phone: '+91 22 2675 1000',
        capacity: 320,
      },
      {
        id: 'mum_police_1',
        type: 'police',
        name: 'BKC Police Station',
        latitude: 19.0652,
        longitude: 72.8682,
        distanceMeters: 620,
        distanceFormatted: '620 m',
        address: 'Plot No. C-62, G Block, Behind Asian Heart Institute, BKC, Bandra East, Mumbai 400051',
        phone: '+91 22 2650 4008',
      },
      {
        id: 'mum_police_2',
        type: 'police',
        name: 'Kherwadi Police Station',
        latitude: 19.0583,
        longitude: 72.8509,
        distanceMeters: 1100,
        distanceFormatted: '1.1 km',
        address: 'A. K. Marg, Western Express Highway, Kherwadi, Bandra East, Mumbai 400051',
        phone: '+91 22 2647 1673',
      },
      {
        id: 'mum_fire_1',
        type: 'fire_station',
        name: 'BKC Fire Station (Mumbai Fire Brigade Headquarters)',
        latitude: 19.0678,
        longitude: 72.8614,
        distanceMeters: 920,
        distanceFormatted: '920 m',
        address: 'Plot No. C-65, G Block, Near ICICI Bank Towers, BKC, Bandra East, Mumbai 400051',
        phone: '+91 22 2659 0101',
      },
      {
        id: 'mum_shelter_1',
        type: 'shelter',
        name: 'MMRDA Elevated Flood Evacuation Centre',
        latitude: 19.0645,
        longitude: 72.8710,
        distanceMeters: 850,
        distanceFormatted: '850 m',
        address: 'MMRDA Exhibition Grounds, Elevated Pavilion Hall 2, G Block, BKC, Mumbai 400051',
        phone: '+91 22 2659 4000',
        capacity: 1500,
      },
      {
        id: 'mum_shelter_2',
        type: 'shelter',
        name: 'Kherwadi Municipal High School Relief Centre',
        latitude: 19.0592,
        longitude: 72.8488,
        distanceMeters: 1400,
        distanceFormatted: '1.4 km',
        address: 'Municipal Complex Building, Kherwadi Road, Bandra East, Mumbai 400051',
        phone: '+91 22 2647 1122',
        capacity: 800,
      },
    ],
  },

  // ==========================================
  // DELHI BASIN (MINTO BRIDGE & YAMUNA)
  // ==========================================
  delhi: {
    streets: [
      {
        coordinates: [
          [77.2215, 28.6325],
          [77.2255, 28.6342],
          [77.2295, 28.6358],
        ],
        properties: {
          segmentId: 'del_seg_1',
          streetName: 'Minto Road Underpass (Railway Bridge)',
          elevationM: 208.5, // Severe depression bowl
          slopePct: 3.5,
          imperviousnessPct: 96,
          catchmentAreaHa: 5.2,
          nearestDrainNodeId: 'del_node_1',
        },
      },
      {
        coordinates: [
          [77.2295, 28.6358],
          [77.2355, 28.6375],
        ],
        properties: {
          segmentId: 'del_seg_2',
          streetName: 'Deen Dayal Upadhyaya Marg',
          elevationM: 212.0,
          slopePct: 1.1,
          imperviousnessPct: 92,
          catchmentAreaHa: 4.1,
          nearestDrainNodeId: 'del_node_2',
        },
      },
      {
        coordinates: [
          [77.2355, 28.6375],
          [77.2425, 28.6295],
        ],
        properties: {
          segmentId: 'del_seg_3',
          streetName: 'ITO Junction & Vikas Marg Flyover Base',
          elevationM: 209.8,
          slopePct: 0.6,
          imperviousnessPct: 95,
          catchmentAreaHa: 7.8,
          nearestDrainNodeId: 'del_node_2',
        },
      },
      {
        coordinates: [
          [77.2185, 28.6315],
          [77.2235, 28.6285],
          [77.2325, 28.6310],
        ],
        properties: {
          segmentId: 'del_seg_4',
          streetName: 'Connaught Outer Circle (Elevated Ridge Route)',
          elevationM: 218.4, // Elevated safe route
          slopePct: 1.2,
          imperviousnessPct: 88,
          catchmentAreaHa: 3.5,
          nearestDrainNodeId: 'del_node_3',
        },
      },
    ],
    drainageNodes: [
      {
        nodeId: 'del_node_1',
        nodeName: 'Minto Underpass Automatic Sump & Pump',
        type: 'pumping_station',
        coordinates: [77.2255, 28.6342],
        groundElevationM: 208.5,
        invertElevationM: 204.0,
        designCapacityLps: 600,
        inflowLps: 780,
        capacityUtilization: 130,
        status: 'surcharging',
        backflowLps: 180,
        upstreamPipes: [],
        downstreamPipes: ['del_pipe_1'],
      },
      {
        nodeId: 'del_node_2',
        nodeName: 'Barapullah Trunk Culvert Junction',
        type: 'manhole',
        coordinates: [77.2335, 28.6365],
        groundElevationM: 211.5,
        invertElevationM: 207.2,
        designCapacityLps: 950,
        inflowLps: 910,
        capacityUtilization: 95,
        status: 'congested',
        backflowLps: 0,
        upstreamPipes: ['del_pipe_1'],
        downstreamPipes: ['del_pipe_2'],
      },
      {
        nodeId: 'del_node_3',
        nodeName: 'Connaught Place High Ridge Storm Main',
        type: 'inlet',
        coordinates: [77.2235, 28.6285],
        groundElevationM: 218.4,
        invertElevationM: 215.0,
        designCapacityLps: 750,
        inflowLps: 280,
        capacityUtilization: 37,
        status: 'normal',
        backflowLps: 0,
        upstreamPipes: [],
        downstreamPipes: ['del_pipe_2'],
      },
      {
        nodeId: 'del_node_outfall',
        nodeName: 'Yamuna River Bank Gravity Outfall',
        type: 'outfall',
        coordinates: [77.2485, 28.6290],
        groundElevationM: 206.5,
        invertElevationM: 202.0,
        designCapacityLps: 1800,
        inflowLps: 1650,
        capacityUtilization: 92,
        status: 'normal',
        backflowLps: 0,
        upstreamPipes: ['del_pipe_2'],
        downstreamPipes: [],
      },
    ],
    drainageEdges: [
      {
        pipeId: 'del_pipe_1',
        fromNode: 'del_node_1',
        toNode: 'del_node_2',
        diameterMm: 1400,
        lengthM: 800,
        slopePct: 0.5,
        hydraulicCapacityLps: 600,
        currentFlowLps: 600,
        utilizationPct: 100,
        isChoked: true,
        coordinates: [
          [77.2255, 28.6342],
          [77.2335, 28.6365],
        ],
      },
      {
        pipeId: 'del_pipe_2',
        fromNode: 'del_node_2',
        toNode: 'del_node_outfall',
        diameterMm: 2200,
        lengthM: 1500,
        slopePct: 0.3,
        hydraulicCapacityLps: 1600,
        currentFlowLps: 1190,
        utilizationPct: 74,
        isChoked: false,
        coordinates: [
          [77.2335, 28.6365],
          [77.2485, 28.6290],
        ],
      },
    ],
    routes: [
      {
        coordinates: [
          [77.2215, 28.6325],
          [77.2255, 28.6342],
          [77.2295, 28.6358],
          [77.2355, 28.6375],
        ],
        properties: {
          type: 'primary',
          status: 'blocked',
          distanceKm: 2.1,
          estimatedTimeMins: 38,
          message: 'DANGER: Minto Bridge underpass submerged under 90 cm water (Buses stalled)',
          maxFloodDepthCm: 90,
        },
      },
      {
        coordinates: [
          [77.2215, 28.6325],
          [77.2185, 28.6315],
          [77.2235, 28.6285],
          [77.2325, 28.6310],
          [77.2355, 28.6375],
        ],
        properties: {
          type: 'alternate',
          status: 'safe',
          distanceKm: 2.9,
          estimatedTimeMins: 11,
          message: 'Safe Alternative: High elevation Connaught Outer Circle & Barakhamba Road',
          maxFloodDepthCm: 2,
          elevationGainM: 9.9,
        },
      },
    ],
    emergencyServices: [
      {
        id: 'del_hosp_1',
        type: 'hospital',
        name: 'Lok Nayak Hospital (LNJP - Associated with MAMC)',
        latitude: 28.6385,
        longitude: 77.2405,
        distanceMeters: 1400,
        distanceFormatted: '1.4 km',
        address: 'Delhi Gate, Jawaharlal Nehru Marg, New Delhi, Delhi 110002',
        phone: '+91 11 2323 3000',
        capacity: 1500,
      },
      {
        id: 'del_hosp_2',
        type: 'hospital',
        name: 'Dr. Ram Manohar Lohia (RML) Hospital',
        latitude: 28.6248,
        longitude: 77.2005,
        distanceMeters: 2800,
        distanceFormatted: '2.8 km',
        address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi, Delhi 110001',
        phone: '+91 11 2336 5525',
        capacity: 1400,
      },
      {
        id: 'del_police_1',
        type: 'police',
        name: 'Connaught Place Police Station',
        latitude: 28.6320,
        longitude: 77.2180,
        distanceMeters: 750,
        distanceFormatted: '750 m',
        address: 'Shaheed Bhagat Singh Marg, Connaught Place, New Delhi, Delhi 110001',
        phone: '+91 11 2336 3385',
      },
      {
        id: 'del_police_2',
        type: 'police',
        name: 'Kamla Market Police Station (Minto Road Hub)',
        latitude: 28.6410,
        longitude: 77.2285,
        distanceMeters: 850,
        distanceFormatted: '850 m',
        address: 'Asaf Ali Road, Kamla Market, Near Minto Bridge, New Delhi, Delhi 110002',
        phone: '+91 11 2323 0101',
      },
      {
        id: 'del_fire_1',
        type: 'fire_station',
        name: 'Connaught Place Fire Station (Delhi Fire Service DFS)',
        latitude: 28.6295,
        longitude: 77.2210,
        distanceMeters: 800,
        distanceFormatted: '800 m',
        address: 'Barakhamba Road, Connaught Place, New Delhi, Delhi 110001',
        phone: '+91 11 2341 2222',
      },
      {
        id: 'del_shelter_1',
        type: 'shelter',
        name: 'NDMC Multi-Purpose Flood Evacuation Centre',
        latitude: 28.6310,
        longitude: 77.2150,
        distanceMeters: 1100,
        distanceFormatted: '1.1 km',
        address: 'Palika Kendra Complex, Sansad Marg, Connaught Place, New Delhi, Delhi 110001',
        phone: '+91 11 2374 2747',
        capacity: 2500,
      },
      {
        id: 'del_shelter_2',
        type: 'shelter',
        name: 'Rouse Avenue Municipal Relief Centre',
        latitude: 28.6345,
        longitude: 77.2340,
        distanceMeters: 1300,
        distanceFormatted: '1.3 km',
        address: 'DDU Marg Municipal Hall, Deen Dayal Upadhyaya Marg, New Delhi 110002',
        phone: '+91 11 2323 7788',
        capacity: 1200,
      },
    ],
  },

  // ==========================================
  // CHENNAI BASIN (VELACHERY & ADYAR)
  // ==========================================
  chennai: {
    streets: [
      {
        coordinates: [
          [80.2150, 12.9750],
          [80.2185, 12.9785],
          [80.2220, 12.9820],
        ],
        properties: {
          segmentId: 'che_seg_1',
          streetName: 'Velachery Main Road (Lake Marsh Section)',
          elevationM: 4.8,
          slopePct: 0.3,
          imperviousnessPct: 93,
          catchmentAreaHa: 9.5,
          nearestDrainNodeId: 'che_node_1',
        },
      },
      {
        coordinates: [
          [80.2185, 12.9785],
          [80.2120, 12.9840],
        ],
        properties: {
          segmentId: 'che_seg_2',
          streetName: 'Madipakkam Lake Link Road',
          elevationM: 3.9, // Low-lying marshland
          slopePct: 0.2,
          imperviousnessPct: 91,
          catchmentAreaHa: 11.2,
          nearestDrainNodeId: 'che_node_2',
        },
      },
      {
        coordinates: [
          [80.2220, 12.9820],
          [80.2290, 12.9880],
        ],
        properties: {
          segmentId: 'che_seg_3',
          streetName: '100 Feet Bypass Road (Velachery Bypass)',
          elevationM: 11.2, // Elevated four-lane corridor
          slopePct: 1.8,
          imperviousnessPct: 89,
          catchmentAreaHa: 4.2,
          nearestDrainNodeId: 'che_node_3',
        },
      },
    ],
    drainageNodes: [
      {
        nodeId: 'che_node_1',
        nodeName: 'Velachery Lake Storm Surplus Inlet',
        type: 'inlet',
        coordinates: [80.2185, 12.9785],
        groundElevationM: 4.8,
        invertElevationM: 1.5,
        designCapacityLps: 550,
        inflowLps: 720,
        capacityUtilization: 131,
        status: 'surcharging',
        backflowLps: 170,
        upstreamPipes: [],
        downstreamPipes: ['che_pipe_1'],
      },
      {
        nodeId: 'che_node_2',
        nodeName: 'Pallikaranai Marsh Drainage Channel Sump',
        type: 'manhole',
        coordinates: [80.2135, 12.9810],
        groundElevationM: 3.8,
        invertElevationM: 0.8,
        designCapacityLps: 600,
        inflowLps: 580,
        capacityUtilization: 96,
        status: 'congested',
        backflowLps: 0,
        upstreamPipes: ['che_pipe_1'],
        downstreamPipes: ['che_pipe_2'],
      },
      {
        nodeId: 'che_node_3',
        nodeName: '100 Feet Bypass Elevated Pump Mains',
        type: 'pumping_station',
        coordinates: [80.2250, 12.9850],
        groundElevationM: 11.2,
        invertElevationM: 6.5,
        designCapacityLps: 800,
        inflowLps: 240,
        capacityUtilization: 30,
        status: 'normal',
        backflowLps: 0,
        upstreamPipes: [],
        downstreamPipes: ['che_pipe_2'],
      },
      {
        nodeId: 'che_node_outfall',
        nodeName: 'Adyar River Coastal Estuary Flap Barrier',
        type: 'outfall',
        coordinates: [80.2450, 12.9950],
        groundElevationM: 1.8,
        invertElevationM: -0.4,
        designCapacityLps: 1500,
        inflowLps: 1350,
        capacityUtilization: 90,
        status: 'normal',
        backflowLps: 0,
        upstreamPipes: ['che_pipe_2'],
        downstreamPipes: [],
      },
    ],
    drainageEdges: [
      {
        pipeId: 'che_pipe_1',
        fromNode: 'che_node_1',
        toNode: 'che_node_2',
        diameterMm: 1500,
        lengthM: 650,
        slopePct: 0.2,
        hydraulicCapacityLps: 550,
        currentFlowLps: 550,
        utilizationPct: 100,
        isChoked: true,
        coordinates: [
          [80.2185, 12.9785],
          [80.2135, 12.9810],
        ],
      },
      {
        pipeId: 'che_pipe_2',
        fromNode: 'che_node_2',
        toNode: 'che_node_outfall',
        diameterMm: 2000,
        lengthM: 2100,
        slopePct: 0.15,
        hydraulicCapacityLps: 1200,
        currentFlowLps: 820,
        utilizationPct: 68,
        isChoked: false,
        coordinates: [
          [80.2135, 12.9810],
          [80.2450, 12.9950],
        ],
      },
    ],
    routes: [
      {
        coordinates: [
          [80.2150, 12.9750],
          [80.2185, 12.9785],
          [80.2220, 12.9820],
        ],
        properties: {
          type: 'primary',
          status: 'blocked',
          distanceKm: 2.2,
          estimatedTimeMins: 35,
          message: 'CRITICAL: Velachery Main Road flooded under 55 cm water from lake breach',
          maxFloodDepthCm: 55,
        },
      },
      {
        coordinates: [
          [80.2150, 12.9750],
          [80.2190, 12.9730],
          [80.2250, 12.9810],
          [80.2290, 12.9880],
        ],
        properties: {
          type: 'alternate',
          status: 'safe',
          distanceKm: 3.1,
          estimatedTimeMins: 12,
          message: 'Flood-Safe: Elevated 100 Feet Bypass Corridor (Passable & Dry)',
          maxFloodDepthCm: 5,
          elevationGainM: 6.4,
        },
      },
    ],
    emergencyServices: [
      {
        id: 'che_hosp_1',
        type: 'hospital',
        name: 'Prashanth Super Speciality Hospital (Velachery)',
        latitude: 12.9815,
        longitude: 80.2210,
        distanceMeters: 450,
        distanceFormatted: '450 m',
        address: 'No. 36 & 36A, Velachery Main Road, Dhandeeswaram Nagar, Velachery, Chennai, Tamil Nadu 600042',
        phone: '+91 44 4680 5555',
        capacity: 250,
      },
      {
        id: 'che_hosp_2',
        type: 'hospital',
        name: 'Dr. Kamakshi Memorial Hospital',
        latitude: 12.9555,
        longitude: 80.2010,
        distanceMeters: 3200,
        distanceFormatted: '3.2 km',
        address: '1, 200 Feet Radial Road, Dandeeswaram, Pallikaranai, Chennai, Tamil Nadu 600100',
        phone: '+91 44 6630 0300',
        capacity: 350,
      },
      {
        id: 'che_police_1',
        type: 'police',
        name: 'Velachery Police Station (J-7)',
        latitude: 12.9802,
        longitude: 80.2225,
        distanceMeters: 520,
        distanceFormatted: '520 m',
        address: 'Velachery Bypass Road, Dhandeeswaram Nagar, Velachery, Chennai, Tamil Nadu 600042',
        phone: '+91 44 2345 2631',
      },
      {
        id: 'che_police_2',
        type: 'police',
        name: 'Madipakkam Police Station (S-10)',
        latitude: 12.9645,
        longitude: 80.1985,
        distanceMeters: 1400,
        distanceFormatted: '1.4 km',
        address: 'Medavakkam Main Road, Madipakkam, Chennai, Tamil Nadu 600091',
        phone: '+91 44 2345 2814',
      },
      {
        id: 'che_fire_1',
        type: 'fire_station',
        name: 'Velachery Fire & Rescue Station (TNFRS)',
        latitude: 12.9770,
        longitude: 80.2160,
        distanceMeters: 350,
        distanceFormatted: '350 m',
        address: 'Velachery Main Road, Near Velachery Bus Terminus, Chennai, Tamil Nadu 600042',
        phone: '+91 44 2244 0101',
      },
      {
        id: 'che_shelter_1',
        type: 'shelter',
        name: 'Greater Chennai Corporation Cyclone & Flood Relief Centre',
        latitude: 12.9825,
        longitude: 80.2250,
        distanceMeters: 800,
        distanceFormatted: '800 m',
        address: 'Zone 13 Community Hall, 100 Feet Bypass Road, Velachery, Chennai, Tamil Nadu 600042',
        phone: '+91 44 2561 9206',
        capacity: 1800,
      },
      {
        id: 'che_shelter_2',
        type: 'shelter',
        name: 'Madipakkam Community Flood Relief Shelter',
        latitude: 12.9690,
        longitude: 80.2050,
        distanceMeters: 1200,
        distanceFormatted: '1.2 km',
        address: 'Kuberan Nagar Community Hall, Madipakkam, Chennai, Tamil Nadu 600091',
        phone: '+91 44 2561 9214',
        capacity: 1000,
      },
    ],
  },
};

/**
 * Builds dynamically evaluated GeoJSON for the specified metro,
 * using the Coupled Physics-Informed ML Inundation Model.
 */
export function getMetroGeoJSON(
  city: MetroCity,
  timeWindow: '0h' | '1h' | '2h' | '3h',
  rainfallMmHr: number,
  tidalState: 'low_tide' | 'normal' | 'high_tide' = 'normal'
): {
  inundation: FeatureCollection<LineString, InundationProperties>;
  drainageNodes: FeatureCollection<Point, DrainageNodeProperties>;
  drainagePipes: FeatureCollection<LineString, DrainagePipeProperties>;
  routes: FeatureCollection<LineString, RouteProperties>;
} {
  const dataset = METRO_DATASETS[city];

  // 1. Calculate drainage network flow
  const surfaceInflows = new Map<string, number>();
  dataset.streets.forEach((s) => {
    if (s.properties.nearestDrainNodeId) {
      const C = s.properties.imperviousnessPct / 100;
      const runoff = (C * rainfallMmHr * s.properties.catchmentAreaHa) / 0.36;
      surfaceInflows.set(
        s.properties.nearestDrainNodeId,
        (surfaceInflows.get(s.properties.nearestDrainNodeId) || 0) + runoff
      );
    }
  });

  // 2. Build Inundation Features via ML Model
  const inundationFeatures = dataset.streets.map((street) => {
    const drainNode = dataset.drainageNodes.find(
      (n) => n.nodeId === street.properties.nearestDrainNodeId
    );
    const drainCapacity = drainNode ? drainNode.designCapacityLps : 400;

    // ML surrogate prediction
    const timeMult = timeWindow === '0h' ? 0.75 : timeWindow === '1h' ? 1.15 : timeWindow === '2h' ? 1.45 : 1.30;
    const effectiveRainfall = rainfallMmHr * timeMult;
    const C = street.properties.imperviousnessPct / 100;
    const runoffLps = Math.round((C * effectiveRainfall * street.properties.catchmentAreaHa) / 0.36);

    const tidalPenalty = (city === 'mumbai' || city === 'chennai') && tidalState === 'high_tide' ? 0.5 : 0.85;
    const effectiveDrain = drainCapacity * tidalPenalty;
    const backflowLps = Math.max(0, Math.round(runoffLps - effectiveDrain));

    const elevationVulnerability = Math.max(0, (city === 'delhi' ? 220 - street.properties.elevationM : 18 - street.properties.elevationM) * 1.5);
    const slopeTrapping = Math.max(0.4, (5 - Math.min(5, street.properties.slopePct)) / 5);

    let waterDepthCm = 0;
    if (effectiveRainfall > 3) {
      const rainComp = effectiveRainfall * 0.30 * C;
      const surchargeComp = backflowLps * 0.04;
      const demComp = elevationVulnerability * slopeTrapping * 0.7;
      waterDepthCm = Math.round(rainComp + surchargeComp + demComp);
    }
    waterDepthCm = Math.max(0, Math.min(180, waterDepthCm));

    let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
    if (waterDepthCm >= 25) riskLevel = 'critical';
    else if (waterDepthCm >= 10) riskLevel = 'warning';

    const props: InundationProperties = {
      ...street.properties,
      waterDepthCm,
      riskLevel,
      predictedTimeWindow: timeWindow,
      runoffLps,
      drainBackflowLps: backflowLps,
      flowVelocityMs: Math.round(Math.sqrt(Math.max(0.1, street.properties.slopePct)) * 4.5) / 10,
      timeToPeakMins: Math.max(10, Math.round(45 - street.properties.slopePct * 3 - effectiveRainfall * 0.2)),
    };

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: street.coordinates,
      },
      properties: props,
    };
  });

  // 3. Drainage Node GeoJSON
  const drainageNodeFeatures = dataset.drainageNodes.map((node) => {
    const inflow = surfaceInflows.get(node.nodeId) || 0;
    const effectiveCap = (node.type === 'outfall' && tidalState === 'high_tide') ? node.designCapacityLps * 0.5 : node.designCapacityLps;
    const util = Math.min(200, Math.round((inflow / Math.max(1, effectiveCap)) * 100));
    const backflow = Math.max(0, Math.round(inflow - effectiveCap));
    const status: 'normal' | 'congested' | 'surcharging' = util >= 100 ? 'surcharging' : util >= 75 ? 'congested' : 'normal';

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: node.coordinates,
      },
      properties: {
        ...node,
        inflowLps: Math.round(inflow),
        capacityUtilization: util,
        status,
        backflowLps: backflow,
      },
    };
  });

  // 4. Drainage Pipe GeoJSON
  const drainagePipeFeatures = dataset.drainageEdges.map((edge) => {
    const fromNodeInflow = surfaceInflows.get(edge.fromNode) || 0;
    const util = Math.min(200, Math.round((fromNodeInflow / Math.max(1, edge.hydraulicCapacityLps)) * 100));
    const isChoked = util >= 100;

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: edge.coordinates,
      },
      properties: {
        ...edge,
        currentFlowLps: Math.round(Math.min(edge.hydraulicCapacityLps, fromNodeInflow)),
        utilizationPct: util,
        isChoked,
      },
    };
  });

  // 5. Route Features GeoJSON
  const routeFeatures = dataset.routes.map((route) => {
    const isPrimaryBlocked = rainfallMmHr >= 25;
    const status: 'safe' | 'blocked' | 'inundated' | 'passable' =
      route.properties.type === 'primary'
        ? isPrimaryBlocked
          ? 'blocked'
          : 'passable'
        : 'safe';

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: route.coordinates,
      },
      properties: {
        ...route.properties,
        status,
      },
    };
  });

  return {
    inundation: {
      type: 'FeatureCollection',
      features: inundationFeatures,
    },
    drainageNodes: {
      type: 'FeatureCollection',
      features: drainageNodeFeatures,
    },
    drainagePipes: {
      type: 'FeatureCollection',
      features: drainagePipeFeatures,
    },
    routes: {
      type: 'FeatureCollection',
      features: routeFeatures,
    },
  };
}
