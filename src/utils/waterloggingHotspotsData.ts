import { WaterloggingHotspot } from '@/types';

/**
 * Curated Waterlogging Hotspot Locations for Indian Metros
 *
 * Grounded in historical urban flooding points:
 * - Mumbai: Hindmata, Milan Subway, Kurla/BKC, Gandhi Market
 * - Delhi: Minto Bridge, Pul Prahladpur, ITO, Kashmere Gate
 * - Chennai: Velachery, Madipakkam, Vyasarpadi, T. Nagar
 */

export const METRO_HOTSPOTS: Record<string, WaterloggingHotspot[]> = {
  mumbai: [
    {
      id: 'mb-hotspot-1',
      name: 'Hindmata Junction & Dadar TT',
      coordinates: [19.0178, 72.8478],
      riskLevel: 'critical',
      rainfallRange: '75–95 mm/h',
      expectedRunoffM3: '48,000 m³',
      drainageStressPct: 142,
      estimatedWaterDepthRangeM: '0.5–0.9 m',
      timeToImpactMins: 35,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'KEM Hospital & Seth GS Medical College (650m)',
        'Central Railway Line Sub-culverts',
        'Dadar Fire Station (800m)',
      ],
      recommendedAction: 'Barricade arterial low points; run Britannia pumping outfall.',
    },
    {
      id: 'mb-hotspot-2',
      name: 'Milan Subway (Santacruz West)',
      coordinates: [19.0833, 72.8428],
      riskLevel: 'critical',
      rainfallRange: '60–85 mm/h',
      expectedRunoffM3: '36,000 m³',
      drainageStressPct: 155,
      estimatedWaterDepthRangeM: '0.8–1.4 m',
      timeToImpactMins: 28,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Western Express Highway Flyover Pier',
        'Santacruz Suburban Railway Station',
      ],
      recommendedAction: 'Vehicular underpass closure; initiate emergency dewatering pumps.',
    },
    {
      id: 'mb-hotspot-3',
      name: 'BKC Diamond Bourse & Mithi Culvert',
      coordinates: [19.0626, 72.8626],
      riskLevel: 'high',
      rainfallRange: '55–75 mm/h',
      expectedRunoffM3: '42,000 m³',
      drainageStressPct: 128,
      estimatedWaterDepthRangeM: '0.3–0.6 m',
      timeToImpactMins: 45,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Asian Heart Institute (400m)',
        'BKC Metro Line 3 Underground Station',
      ],
      recommendedAction: 'Monitor Mithi River tidal gates; diversion via elevated BKC corridor.',
    },
    {
      id: 'mb-hotspot-4',
      name: 'Gandhi Market (Kings Circle)',
      coordinates: [19.0315, 72.8592],
      riskLevel: 'moderate',
      rainfallRange: '40–60 mm/h',
      expectedRunoffM3: '28,000 m³',
      drainageStressPct: 98,
      estimatedWaterDepthRangeM: '0.2–0.4 m',
      timeToImpactMins: 55,
      confidence: 'MEDIUM',
      nearbyCriticalInfrastructure: [
        'Harbour Line Kings Circle Station',
        'Sion Municipal Hospital (1.2km)',
      ],
      recommendedAction: 'Traffic police deployment for bus lane diversion.',
    },
  ],
  delhi: [
    {
      id: 'dl-hotspot-1',
      name: 'Minto Road Railway Underpass',
      coordinates: [28.6416, 77.2258],
      riskLevel: 'critical',
      rainfallRange: '65–85 mm/h',
      expectedRunoffM3: '39,000 m³',
      drainageStressPct: 168,
      estimatedWaterDepthRangeM: '1.2–2.0 m',
      timeToImpactMins: 25,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'New Delhi Railway Station (Ajmeri Gate)',
        'MCD Civic Centre Headquarters',
      ],
      recommendedAction: 'Automatic boom barrier closure; emergency pump deployment.',
    },
    {
      id: 'dl-hotspot-2',
      name: 'Pul Prahladpur Underpass',
      coordinates: [28.5115, 77.2942],
      riskLevel: 'high',
      rainfallRange: '50–70 mm/h',
      expectedRunoffM3: '32,000 m³',
      drainageStressPct: 132,
      estimatedWaterDepthRangeM: '0.6–1.1 m',
      timeToImpactMins: 40,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Mehrauli-Badarpur Arterial Road',
        'Tughlakabad Inland Container Depot',
      ],
      recommendedAction: 'Divert heavy transport vehicles via Mathura Road.',
    },
    {
      id: 'dl-hotspot-3',
      name: 'ITO Junction & Ring Road Culvert',
      coordinates: [28.6304, 77.2435],
      riskLevel: 'moderate',
      rainfallRange: '40–55 mm/h',
      expectedRunoffM3: '26,000 m³',
      drainageStressPct: 92,
      estimatedWaterDepthRangeM: '0.2–0.4 m',
      timeToImpactMins: 50,
      confidence: 'MEDIUM',
      nearbyCriticalInfrastructure: [
        'Delhi Police Headquarters (300m)',
        'Yamuna Floodplain Bund Regulator 12',
      ],
      recommendedAction: 'Inspect storm regulators; keep standby suction tankers ready.',
    },
  ],
  chennai: [
    {
      id: 'ch-hotspot-1',
      name: 'Velachery Lake Catchment & 100 Ft Road',
      coordinates: [12.9785, 80.2185],
      riskLevel: 'critical',
      rainfallRange: '70–95 mm/h',
      expectedRunoffM3: '52,000 m³',
      drainageStressPct: 148,
      estimatedWaterDepthRangeM: '0.6–1.2 m',
      timeToImpactMins: 30,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Velachery MRTS Railway Station',
        'Prashanth Super Speciality Hospital (800m)',
      ],
      recommendedAction: 'Relocate residents in ground floor settlements; open surplus weir.',
    },
    {
      id: 'ch-hotspot-2',
      name: 'Madipakkam Lake Surplus Channel',
      coordinates: [12.9642, 80.1989],
      riskLevel: 'high',
      rainfallRange: '55–75 mm/h',
      expectedRunoffM3: '34,000 m³',
      drainageStressPct: 124,
      estimatedWaterDepthRangeM: '0.4–0.7 m',
      timeToImpactMins: 45,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'St. Thomas Mount Substation',
        'Madipakkam Bus Depot',
      ],
      recommendedAction: 'Position sandbags along micro-bunds; clear plastic choke points.',
    },
    {
      id: 'ch-hotspot-3',
      name: 'Vyasarpadi GKM Underpass',
      coordinates: [13.1124, 80.2589],
      riskLevel: 'moderate',
      rainfallRange: '35–50 mm/h',
      expectedRunoffM3: '22,000 m³',
      drainageStressPct: 88,
      estimatedWaterDepthRangeM: '0.2–0.5 m',
      timeToImpactMins: 55,
      confidence: 'MEDIUM',
      nearbyCriticalInfrastructure: [
        'Vyasarpadi Jeeva Railway Station',
        'Stanley Medical College Hospital (1.8km)',
      ],
      recommendedAction: 'Traffic diversion to Perambur High Road.',
    },
  ],
};

export function getWaterloggingHotspots(
  metroCity: string,
  intensityMmHr: number
): WaterloggingHotspot[] {
  const baseHotspots = METRO_HOTSPOTS[metroCity] || METRO_HOTSPOTS.mumbai;

  // Dynamically escalate or de-escalate hotspot risk based on current Doppler intensity
  return baseHotspots.map((h) => {
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = h.riskLevel;
    let stress = h.drainageStressPct;

    if (intensityMmHr < 20) {
      riskLevel = 'low';
      stress = Math.round(stress * 0.4);
    } else if (intensityMmHr < 40) {
      riskLevel = riskLevel === 'critical' ? 'moderate' : 'low';
      stress = Math.round(stress * 0.7);
    } else if (intensityMmHr >= 70) {
      riskLevel = 'critical';
      stress = Math.round(stress * 1.25);
    }

    return {
      ...h,
      riskLevel,
      drainageStressPct: stress,
    };
  });
}
