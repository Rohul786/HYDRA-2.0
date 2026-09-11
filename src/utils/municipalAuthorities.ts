import { MunicipalAuthority } from '@/types';
import { calculateHaversineDistance } from './geoDistance';

/**
 * Verified Indian Municipal Authorities & Emergency Control Rooms
 *
 * All emergency phone numbers listed here are official, verified public helplines:
 * - BMC Disaster Management: 1916 / 022-22694727
 * - MCD Central Control Room: 155305 / 011-23220010
 * - GCC Ripon Building Flood Control: 1913 / 044-25619206
 * - State Disaster Management: 1070 / 1077
 *
 * If outside these jurisdictions or unverified, HYDRA strictly displays:
 * "Contact information unavailable — please use the official municipal/disaster-management directory."
 */

export interface MunicipalAuthorityData {
  id: string;
  name: string;
  jurisdiction: string;
  controlRoomName: string;
  centerCoords: [number, number]; // [lat, lng]
  verifiedContact: string;
  emergencyPhone: string;
  hasVerifiedContact: boolean;
  address: string;
  status: 'Available' | 'Active Monitoring' | 'Emergency Operations Active';
}

export const VERIFIED_MUNICIPALITIES: MunicipalAuthorityData[] = [
  {
    id: 'bmc-mumbai',
    name: 'Brihanmumbai Municipal Corporation (BMC)',
    jurisdiction: 'Mumbai City & Mumbai Suburban Districts',
    controlRoomName: 'BMC Central Disaster Management Cell',
    centerCoords: [18.9401, 72.8347], // BMC Headquarters, CST Mumbai
    verifiedContact: '022-22694727',
    emergencyPhone: '1916',
    hasVerifiedContact: true,
    address: 'Mahapalika Marg, Dhobi Talao, Chhatrapati Shivaji Terminus Area, Fort, Mumbai 400001',
    status: 'Emergency Operations Active',
  },
  {
    id: 'mcd-delhi',
    name: 'Municipal Corporation of Delhi (MCD)',
    jurisdiction: 'National Capital Territory of Delhi (12 Zones)',
    controlRoomName: 'MCD Central Flood Control & Disaster Room',
    centerCoords: [28.6436, 77.2288], // Civic Centre, Minto Road, New Delhi
    verifiedContact: '011-23220010',
    emergencyPhone: '155305',
    hasVerifiedContact: true,
    address: 'Dr. S.P. Mukherjee Civic Centre, J.L.N. Marg, New Delhi 110002',
    status: 'Active Monitoring',
  },
  {
    id: 'gcc-chennai',
    name: 'Greater Chennai Corporation (GCC)',
    jurisdiction: 'Chennai Metropolitan Area (15 Zones)',
    controlRoomName: 'GCC Disaster Management & Integrated Command Control Centre (ICCC)',
    centerCoords: [13.0827, 80.2707], // Ripon Building, Chennai
    verifiedContact: '044-25619206',
    emergencyPhone: '1913',
    hasVerifiedContact: true,
    address: 'Ripon Building, Raja Muthiah Road, Kannappar Thidal, Periyamet, Chennai 600003',
    status: 'Emergency Operations Active',
  },
];

/**
 * Finds the nearest municipal authority to the given coordinates
 */
export function getNearestMunicipalAuthority(
  userLat: number,
  userLng: number
): MunicipalAuthority {
  let nearest: MunicipalAuthorityData | null = null;
  let minDistance = Infinity;

  VERIFIED_MUNICIPALITIES.forEach((muni) => {
    const dist = calculateHaversineDistance(
      userLat,
      userLng,
      muni.centerCoords[0],
      muni.centerCoords[1]
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = muni;
    }
  });

  const distKm = Number((minDistance / 1000).toFixed(1));

  // If user is within 75 km of known Indian metro corporation, return verified authority
  if (nearest && distKm <= 75) {
    const authority = nearest as MunicipalAuthorityData;
    return {
      id: authority.id,
      name: authority.name,
      jurisdiction: authority.jurisdiction,
      controlRoomName: authority.controlRoomName,
      distanceKm: distKm,
      status: authority.status,
      contact: authority.verifiedContact,
      emergencyPhone: authority.emergencyPhone,
      hasVerifiedContact: true,
      address: authority.address,
    };
  }

  // Outside verified metros: strictly adhere to requirement 11
  return {
    id: 'unverified-regional',
    name: 'Regional Municipal Authority',
    jurisdiction: 'Local Administrative Ward',
    controlRoomName: 'Regional Emergency Control Center',
    distanceKm: distKm,
    status: 'Available',
    contact: '',
    emergencyPhone: '112 / 1070',
    hasVerifiedContact: false,
    directoryGuidance:
      'Contact information unavailable — please use the official municipal/disaster-management directory.',
    address: 'Regional Administrative Headquarters',
  };
}
