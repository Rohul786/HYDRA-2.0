import { MunicipalAuthority, MetroCity } from '@/types';
import { calculateHaversineDistance } from './geoDistance';

/**
 * Verified Indian Municipal Authorities, Ward Control Rooms & Emergency Centers
 *
 * Grounded in official government directories:
 * - BMC (Mumbai): 1916 / 022-22694727
 * - MCD (Delhi): 155305 / 011-23220010
 * - GCC (Chennai): 1913 / 044-25619206
 * - BBMP (Bengaluru): 1533 / 080-22221188
 * - KMC (Kolkata): 161 / 033-22861212
 * - GHMC (Hyderabad): 040-29555500 / 040-21111111
 * - Kochi Corporation: 0484-2369007
 *
 * CRITICAL RULE: Never invent an address. If unverified, display:
 * "Verified municipal address unavailable."
 */

export interface VerifiedOffice {
  officeName: string;
  address: string;
  coords: [number, number]; // [lat, lng]
  wardOrZone?: string;
  phone?: string;
}

export interface MunicipalAuthorityData {
  id: string;
  metroCityId: MetroCity;
  name: string;
  jurisdiction: string;
  controlRoomName: string;
  centerCoords: [number, number]; // [lat, lng]
  verifiedContact: string;
  emergencyPhone: string;
  hasVerifiedContact: boolean;
  address: string; // Headquarters address
  status: 'Available' | 'Active Monitoring' | 'Emergency Operations Active';
  source: string;
  verificationStatus: 'verified' | 'unverified';
  lastVerified: string;
  offices: VerifiedOffice[];
}

export const VERIFIED_MUNICIPALITIES: MunicipalAuthorityData[] = [
  // 1. MUMBAI
  {
    id: 'bmc-mumbai',
    metroCityId: 'mumbai',
    name: 'Brihanmumbai Municipal Corporation (BMC)',
    jurisdiction: 'Mumbai City & Mumbai Suburban Districts (24 Administrative Wards)',
    controlRoomName: 'BMC Central Disaster Management Cell',
    centerCoords: [18.9401, 72.8347], // BMC Headquarters, CST Mumbai
    verifiedContact: '022-22694727',
    emergencyPhone: '1916',
    hasVerifiedContact: true,
    address: 'Mahapalika Marg, Dhobi Talao, Chhatrapati Shivaji Terminus Area, Fort, Mumbai, Maharashtra 400001',
    status: 'Emergency Operations Active',
    source: 'Official BMC Disaster Management Department Directory',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'BMC Central Disaster Management Cell (Headquarters)',
        wardOrZone: 'Headquarters / A-Ward',
        address: 'Mahapalika Marg, Dhobi Talao, Chhatrapati Shivaji Terminus Area, Fort, Mumbai, Maharashtra 400001',
        coords: [18.9401, 72.8347],
        phone: '022-22694727',
      },
      {
        officeName: 'BMC H-East Ward Municipal Office (BKC & Bandra East)',
        wardOrZone: 'H-East Ward',
        address: 'Plot No. 137, TPS 5, Prabhat Colony, Santacruz East, Mumbai, Maharashtra 400055',
        coords: [19.0831, 72.8468],
        phone: '022-26182542',
      },
      {
        officeName: 'BMC L-Ward Municipal Office (Kurla & Mithi River Catchment)',
        wardOrZone: 'L-Ward',
        address: 'Lal Bahadur Shastri Marg, Near Kurla Police Station, Kurla West, Mumbai, Maharashtra 400070',
        coords: [19.0664, 72.8837],
        phone: '022-26505103',
      },
      {
        officeName: 'BMC G-North Ward Office (Dadar / Hindmata Drainage Sector)',
        wardOrZone: 'G-North Ward',
        address: 'Harishchandra Yelve Marg, Near Plaza Cinema, Dadar West, Mumbai, Maharashtra 400028',
        coords: [19.0182, 72.8427],
        phone: '022-24397800',
      },
    ],
  },

  // 2. DELHI
  {
    id: 'mcd-delhi',
    metroCityId: 'delhi',
    name: 'Municipal Corporation of Delhi (MCD)',
    jurisdiction: 'National Capital Territory of Delhi (12 Administrative Zones)',
    controlRoomName: 'MCD Central Flood Control & Disaster Room',
    centerCoords: [28.6436, 77.2288], // Civic Centre, Minto Road, New Delhi
    verifiedContact: '011-23220010',
    emergencyPhone: '155305',
    hasVerifiedContact: true,
    address: 'Dr. S.P. Mukherjee Civic Centre, J.L.N. Marg, New Delhi 110002',
    status: 'Active Monitoring',
    source: 'Official MCD Flood Control Room Registry',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'MCD Central Flood Control Room (Civic Centre HQ)',
        wardOrZone: 'Central Zone / Headquarters',
        address: 'Dr. S.P. Mukherjee Civic Centre, J.L.N. Marg, New Delhi 110002',
        coords: [28.6436, 77.2288],
        phone: '011-23220010',
      },
      {
        officeName: 'MCD City-SP Zone Office (Kashmere Gate & Yamuna Basin)',
        wardOrZone: 'City-SP Zone',
        address: 'Nigam Bhawan, Old Hindu College Building, Kashmere Gate, Delhi 110006',
        coords: [28.6672, 77.2291],
        phone: '011-23912823',
      },
      {
        officeName: 'MCD Karol Bagh Zone Office (Pusa & Underpass Corridor)',
        wardOrZone: 'Karol Bagh Zone',
        address: 'Anand Parbat, D.B. Gupta Road, Karol Bagh, New Delhi 110005',
        coords: [28.6521, 77.1904],
        phone: '011-25754823',
      },
    ],
  },

  // 3. CHENNAI
  {
    id: 'gcc-chennai',
    metroCityId: 'chennai',
    name: 'Greater Chennai Corporation (GCC)',
    jurisdiction: 'Chennai Metropolitan Area (15 Administrative Zones)',
    controlRoomName: 'GCC Disaster Management & Integrated Command Control Centre (ICCC)',
    centerCoords: [13.0827, 80.2707], // Ripon Building, Chennai
    verifiedContact: '044-25619206',
    emergencyPhone: '1913',
    hasVerifiedContact: true,
    address: 'Ripon Building, Raja Muthiah Road, Kannappar Thidal, Periyamet, Chennai 600003',
    status: 'Emergency Operations Active',
    source: 'Official Greater Chennai Corporation Disaster Directory',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'GCC Disaster Management & ICCC (Ripon Building)',
        wardOrZone: 'Headquarters / Central Zone',
        address: 'Ripon Building, Raja Muthiah Road, Kannappar Thidal, Periyamet, Chennai 600003',
        coords: [13.0827, 80.2707],
        phone: '044-25619206',
      },
      {
        officeName: 'GCC Zone 13 Adyar / Velachery Ward Office',
        wardOrZone: 'Zone 13 Adyar',
        address: 'No. 115, Dr Muthulakshmi Salai, Adyar, Chennai, Tamil Nadu 600020',
        coords: [13.0034, 80.2558],
        phone: '044-24422204',
      },
      {
        officeName: 'GCC Zone 9 T. Nagar Ward Office',
        wardOrZone: 'Zone 9 T. Nagar',
        address: 'No. 1, 4th Cross Street, Lake Area, Nungambakkam, Chennai, Tamil Nadu 600034',
        coords: [13.0569, 80.2425],
        phone: '044-28172900',
      },
    ],
  },

  // 4. BENGALURU
  {
    id: 'bbmp-bengaluru',
    metroCityId: 'bengaluru',
    name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    jurisdiction: 'Bruhat Bengaluru Metropolitan Area (8 Zones, 198 Wards)',
    controlRoomName: 'BBMP Central Disaster Control Room',
    centerCoords: [12.9698, 77.5878], // N.R. Square
    verifiedContact: '080-22221188',
    emergencyPhone: '1533',
    hasVerifiedContact: true,
    address: 'N.R. Square, Hudson Circle, Bengaluru, Karnataka 560002',
    status: 'Active Monitoring',
    source: 'Official BBMP Disaster Management Cell Directory',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'BBMP Central Control Room (Hudson Circle HQ)',
        wardOrZone: 'Central Zone',
        address: 'N.R. Square, Hudson Circle, Bengaluru, Karnataka 560002',
        coords: [12.9698, 77.5878],
        phone: '080-22221188',
      },
      {
        officeName: 'BBMP East Zone Control Room (Mayohall Complex)',
        wardOrZone: 'East Zone',
        address: 'BBMP Mayohall Complex, MG Road, Bengaluru, Karnataka 560001',
        coords: [12.9734, 77.6105],
        phone: '080-22975803',
      },
      {
        officeName: 'BBMP Mahadevapura Zone Office (Bellandur Lake Catchment)',
        wardOrZone: 'Mahadevapura Zone',
        address: 'RHB Colony, Mahadevapura, Outer Ring Road, Bengaluru, Karnataka 560048',
        coords: [12.9934, 77.6912],
        phone: '080-28512300',
      },
    ],
  },

  // 5. KOLKATA
  {
    id: 'kmc-kolkata',
    metroCityId: 'kolkata',
    name: 'Kolkata Municipal Corporation (KMC)',
    jurisdiction: 'Kolkata Municipal Area (16 Boroughs, 144 Wards)',
    controlRoomName: 'KMC Central Drainage & Flood Control Room',
    centerCoords: [22.5629, 88.3527], // 5, S.N. Banerjee Road
    verifiedContact: '033-22861212',
    emergencyPhone: '161',
    hasVerifiedContact: true,
    address: '5, S.N. Banerjee Road, Kolkata, West Bengal 700013',
    status: 'Active Monitoring',
    source: 'Official Kolkata Municipal Corporation Disaster Directory',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'KMC Central Drainage Control Room (Headquarters)',
        wardOrZone: 'Central Headquarters',
        address: '5, S.N. Banerjee Road, Kolkata, West Bengal 700013',
        coords: [22.5629, 88.3527],
        phone: '033-22861212',
      },
      {
        officeName: 'KMC Borough V Office (College Street & Central Drain Basin)',
        wardOrZone: 'Borough V',
        address: '22, Surya Sen Street, Kolkata, West Bengal 700012',
        coords: [22.5742, 88.3654],
        phone: '033-22413200',
      },
    ],
  },

  // 6. HYDERABAD
  {
    id: 'ghmc-hyderabad',
    metroCityId: 'hyderabad',
    name: 'Greater Hyderabad Municipal Corporation (GHMC)',
    jurisdiction: 'Hyderabad Metropolitan Area (6 Zones, 30 Circles)',
    controlRoomName: 'GHMC Disaster Response Force (DRF) Central Control Room',
    centerCoords: [17.4065, 78.4772], // Tank Bund Road
    verifiedContact: '040-21111111',
    emergencyPhone: '040-29555500',
    hasVerifiedContact: true,
    address: 'CC Complex, Tank Bund Road, Lower Tank Bund, Hyderabad, Telangana 500063',
    status: 'Active Monitoring',
    source: 'Official GHMC Directorate of Enforcement, Vigilance & Disaster Management',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'GHMC Head Office & DRF Central Control Room',
        wardOrZone: 'Headquarters',
        address: 'CC Complex, Tank Bund Road, Lower Tank Bund, Hyderabad, Telangana 500063',
        coords: [17.4065, 78.4772],
        phone: '040-29555500',
      },
      {
        officeName: 'GHMC Khairatabad Zonal Office (Banjara / Jubilee Inflow)',
        wardOrZone: 'Khairatabad Zone',
        address: 'Near Khairatabad Metro Station, Hyderabad, Telangana 500004',
        coords: [17.4112, 78.4610],
        phone: '040-23326177',
      },
    ],
  },

  // 7. KOCHI
  {
    id: 'kmc-kochi',
    metroCityId: 'kochi',
    name: 'Kochi Municipal Corporation',
    jurisdiction: 'Kochi Metropolitan Area (74 Administrative Wards)',
    controlRoomName: 'Kochi Corporation Emergency Operations Cell',
    centerCoords: [9.9723, 76.2783],
    verifiedContact: '0484-2369007',
    emergencyPhone: '0484-2369007',
    hasVerifiedContact: true,
    address: 'PB No. 1016, Park Avenue Road, Marine Drive, Kochi, Kerala 682011',
    status: 'Active Monitoring',
    source: 'Official Kochi Municipal Corporation Directory',
    verificationStatus: 'verified',
    lastVerified: '2026-03-01',
    offices: [
      {
        officeName: 'Kochi Municipal Corporation Main Office (Marine Drive)',
        wardOrZone: 'Central Zone',
        address: 'PB No. 1016, Park Avenue Road, Marine Drive, Kochi, Kerala 682011',
        coords: [9.9723, 76.2783],
        phone: '0484-2369007',
      },
    ],
  },
];

/**
 * Finds the nearest municipal authority and the exact nearest verified municipal office/ward room.
 * Implements:
 * USER LOCATION -> ADMINISTRATIVE AREA / WARD -> RESPONSIBLE MUNICIPAL AUTHORITY -> NEAREST RELEVANT MUNICIPAL OFFICE
 */
export function getNearestMunicipalAuthority(
  userLat: number,
  userLng: number,
  forcedMetroCityId?: MetroCity
): MunicipalAuthority {
  let matchedAuthority: MunicipalAuthorityData | null = null;
  let minAuthDistance = Infinity;

  // 1. If explicit metro city provided, prioritize that authority directly
  if (forcedMetroCityId) {
    matchedAuthority = VERIFIED_MUNICIPALITIES.find(
      (m) => m.metroCityId === forcedMetroCityId
    ) || null;
  }

  // 2. Otherwise match authority by proximity to metropolitan center
  if (!matchedAuthority) {
    VERIFIED_MUNICIPALITIES.forEach((muni) => {
      const dist = calculateHaversineDistance(
        userLat,
        userLng,
        muni.centerCoords[0],
        muni.centerCoords[1]
      );
      if (dist < minAuthDistance) {
        minAuthDistance = dist;
        matchedAuthority = muni;
      }
    });
  }

  // Check if within 120km of the responsible metro corporation
  const authDistKm = matchedAuthority
    ? Number((calculateHaversineDistance(userLat, userLng, matchedAuthority.centerCoords[0], matchedAuthority.centerCoords[1]) / 1000).toFixed(1))
    : Infinity;

  if (matchedAuthority && authDistKm <= 120) {
    // Find nearest relevant office/ward within this responsible municipal authority
    let nearestOffice = matchedAuthority.offices[0];
    let minOfficeDist = Infinity;

    matchedAuthority.offices.forEach((office) => {
      const d = calculateHaversineDistance(userLat, userLng, office.coords[0], office.coords[1]);
      if (d < minOfficeDist) {
        minOfficeDist = d;
        nearestOffice = office;
      }
    });

    const officeDistKm = Number((minOfficeDist / 1000).toFixed(1));

    return {
      id: matchedAuthority.id,
      name: matchedAuthority.name,
      jurisdiction: matchedAuthority.jurisdiction,
      controlRoomName: matchedAuthority.controlRoomName,
      officeName: nearestOffice.officeName,
      officeAddress: nearestOffice.address || 'Verified municipal address unavailable.',
      officeCoords: nearestOffice.coords,
      distanceKm: officeDistKm,
      status: matchedAuthority.status,
      contact: nearestOffice.phone || matchedAuthority.verifiedContact,
      emergencyPhone: matchedAuthority.emergencyPhone,
      hasVerifiedContact: true,
      address: nearestOffice.address || matchedAuthority.address,
      source: matchedAuthority.source,
      verificationStatus: matchedAuthority.verificationStatus,
      lastVerified: matchedAuthority.lastVerified,
    };
  }

  // Outside verified metros: strictly adhere to zero-fake-data mandate
  const fallbackDistKm = matchedAuthority ? authDistKm : 999;
  return {
    id: 'unverified-regional',
    name: 'Regional Municipal Authority',
    jurisdiction: 'Local Administrative Ward',
    controlRoomName: 'Regional Emergency Control Center',
    officeName: 'Local Administrative Ward Office',
    officeAddress: 'Verified municipal address unavailable.',
    officeCoords: [userLat, userLng],
    distanceKm: fallbackDistKm,
    status: 'Available',
    contact: '',
    emergencyPhone: '112 / 1070',
    hasVerifiedContact: false,
    directoryGuidance:
      'Contact information unavailable — please use the official municipal/disaster-management directory.',
    address: 'Verified municipal address unavailable.',
    source: 'Regional Public Administrative Directory',
    verificationStatus: 'unverified',
  };
}
