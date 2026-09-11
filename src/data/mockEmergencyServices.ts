import { EmergencyService } from '@/types';

// Verified realistic facilities around default coordinates (BKC Mumbai)
export const DEFAULT_MOCK_SERVICES: Omit<EmergencyService, 'distanceMeters' | 'distanceFormatted'>[] = [
  // Hospitals
  {
    id: 'hosp_asian_heart',
    type: 'hospital',
    name: 'Asian Heart Institute',
    latitude: 19.0664,
    longitude: 72.8681,
    address: 'G / N Block, BKC, Bandra East, Mumbai, Maharashtra 400051',
    phone: '+91 22 6698 6666',
    isDemoFallback: true,
  },
  {
    id: 'hosp_gurunanak',
    type: 'hospital',
    name: 'Guru Nanak Hospital',
    latitude: 19.0572,
    longitude: 72.8492,
    address: 'S1, Gandhi Nagar, Bandra East, Mumbai, Maharashtra 400051',
    phone: '+91 22 4222 7777',
    isDemoFallback: true,
  },
  {
    id: 'hosp_lilavati',
    type: 'hospital',
    name: 'Lilavati Hospital & Research Centre',
    latitude: 19.0514,
    longitude: 72.8295,
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 22 2675 1000',
    isDemoFallback: true,
  },
  {
    id: 'hosp_bhabha',
    type: 'hospital',
    name: 'KB Bhabha Municipal General Hospital',
    latitude: 19.0558,
    longitude: 72.8354,
    address: 'Waterfield Road, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 22 2642 2775',
    isDemoFallback: true,
  },

  // Police Stations
  {
    id: 'police_bkc',
    type: 'police',
    name: 'BKC Police Station',
    latitude: 19.0635,
    longitude: 72.8622,
    address: 'Near Asian Heart Institute, BKC, Bandra East, Mumbai 400051',
    phone: '+91 22 2650 4008',
    isDemoFallback: true,
  },
  {
    id: 'police_kherwadi',
    type: 'police',
    name: 'Kherwadi Police Station',
    latitude: 19.0583,
    longitude: 72.8509,
    address: 'Western Express Hwy, Kherwadi, Bandra East, Mumbai 400051',
    phone: '+91 22 2647 1673',
    isDemoFallback: true,
  },
  {
    id: 'police_bandra',
    type: 'police',
    name: 'Bandra Police Station',
    latitude: 19.0536,
    longitude: 72.8340,
    address: 'Hill Road, Bandra West, Mumbai 400050',
    phone: '+91 22 2642 2042',
    isDemoFallback: true,
  },

  // Fire Stations
  {
    id: 'fire_bkc',
    type: 'fire_station',
    name: 'BKC Fire Station',
    latitude: 19.0675,
    longitude: 72.8710,
    address: 'G Block, Bandra Kurla Complex, Mumbai 400051',
    phone: '101',
    isDemoFallback: true,
  },
  {
    id: 'fire_dharavi',
    type: 'fire_station',
    name: 'Dharavi Fire Station',
    latitude: 19.0435,
    longitude: 72.8568,
    address: 'Sion-Bandra Link Road, Dharavi, Mumbai 400017',
    phone: '101',
    isDemoFallback: true,
  },
  {
    id: 'fire_kurla',
    type: 'fire_station',
    name: 'Kurla Fire Station',
    latitude: 19.0705,
    longitude: 72.8780,
    address: 'Near LBS Marg, Kurla West, Mumbai 400070',
    phone: '101',
    isDemoFallback: true,
  },

  // Shelters & Relief Centers
  {
    id: 'shelter_bkc_relief',
    type: 'shelter',
    name: 'BKC MMRDA Disaster Relief Camp',
    latitude: 19.0610,
    longitude: 72.8580,
    address: 'Ground 2, BKC, Bandra East, Mumbai 400051',
    capacity: 500, // Explicitly documented demo capacity
    isDemoFallback: true,
  },
  {
    id: 'shelter_bandra_community',
    type: 'shelter',
    name: 'Bandra East Community Evacuation Center',
    latitude: 19.0545,
    longitude: 72.8480,
    address: 'Municipal Complex, Gandhi Nagar, Bandra East, Mumbai 400051',
    capacity: 350, // Explicitly documented demo capacity
    isDemoFallback: true,
  },
  {
    id: 'shelter_kurla_hall',
    type: 'shelter',
    name: 'Kurla Municipal School Shelter',
    latitude: 19.0680,
    longitude: 72.8690,
    address: 'SG Barve Marg, Kurla West, Mumbai 400070',
    capacity: 250, // Explicitly documented demo capacity
    isDemoFallback: true,
  },
];
