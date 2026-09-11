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
  bengaluru: [
    {
      id: 'blr-hotspot-1',
      name: 'Silk Board Junction & Outer Ring Road',
      coordinates: [12.9176, 77.6233],
      riskLevel: 'critical',
      rainfallRange: '60–80 mm/h',
      expectedRunoffM3: '44,000 m³',
      drainageStressPct: 152,
      estimatedWaterDepthRangeM: '0.6–1.1 m',
      timeToImpactMins: 30,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Central Silk Board Metro Interchange',
        'Agara Lake Surplus Sluice Gate',
      ],
      recommendedAction: 'Deploy high-capacity dewatering pumps; divert vehicles to Hosur Road.',
    },
    {
      id: 'blr-hotspot-2',
      name: 'Bellandur EcoSpace Corridor (ORR)',
      coordinates: [12.926, 77.6844],
      riskLevel: 'high',
      rainfallRange: '50–70 mm/h',
      expectedRunoffM3: '38,000 m³',
      drainageStressPct: 136,
      estimatedWaterDepthRangeM: '0.4–0.8 m',
      timeToImpactMins: 40,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Bellandur Lake Outflow Canal',
        'Sakra World Hospital (1.2km)',
      ],
      recommendedAction: 'Clear primary storm drain trash racks; restrict slow lanes.',
    },
    {
      id: 'blr-hotspot-3',
      name: 'Hebbal Flyover Low-Lying Service Road',
      coordinates: [13.0358, 77.597],
      riskLevel: 'moderate',
      rainfallRange: '35–55 mm/h',
      expectedRunoffM3: '24,000 m³',
      drainageStressPct: 94,
      estimatedWaterDepthRangeM: '0.3–0.5 m',
      timeToImpactMins: 50,
      confidence: 'MEDIUM',
      nearbyCriticalInfrastructure: [
        'Hebbal Lake Sluice Control Room',
        'Baptist Hospital (1.5km)',
      ],
      recommendedAction: 'Regulate service road traffic heading towards Kempegowda Airport highway.',
    },
  ],
  kolkata: [
    {
      id: 'kol-hotspot-1',
      name: 'Thanthania Kalibari & College Street Bowl',
      coordinates: [22.5802, 88.3685],
      riskLevel: 'critical',
      rainfallRange: '65–85 mm/h',
      expectedRunoffM3: '46,000 m³',
      drainageStressPct: 158,
      estimatedWaterDepthRangeM: '0.7–1.3 m',
      timeToImpactMins: 25,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Calcutta Medical College & Hospital (400m)',
        'Mahatma Gandhi Road Metro Station',
      ],
      recommendedAction: 'Activate Palmer Bridge and Thanthania portable diesel suction pumps.',
    },
    {
      id: 'kol-hotspot-2',
      name: 'Park Circus 7-Point Crossing',
      coordinates: [22.5448, 88.3667],
      riskLevel: 'high',
      rainfallRange: '50–70 mm/h',
      expectedRunoffM3: '35,000 m³',
      drainageStressPct: 126,
      estimatedWaterDepthRangeM: '0.4–0.7 m',
      timeToImpactMins: 45,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Chittaranjan National Cancer Institute (700m)',
        'Maa Flyover Ramp',
      ],
      recommendedAction: 'Divert traffic through AJC Bose Road; activate Topsia canal pumps.',
    },
    {
      id: 'kol-hotspot-3',
      name: 'Ultadanga Underpass (VIP Road Connector)',
      coordinates: [22.593, 88.3888],
      riskLevel: 'moderate',
      rainfallRange: '40–60 mm/h',
      expectedRunoffM3: '27,000 m³',
      drainageStressPct: 96,
      estimatedWaterDepthRangeM: '0.3–0.6 m',
      timeToImpactMins: 50,
      confidence: 'MEDIUM',
      nearbyCriticalInfrastructure: [
        'Bidhannagar Road Railway Station',
        'Circular Canal Sluice Gates',
      ],
      recommendedAction: 'Close underpass lanes if depth exceeds 0.3m; divert via EM Bypass.',
    },
  ],
  hyderabad: [
    {
      id: 'hyd-hotspot-1',
      name: 'Tolichowki & Al Jubail Colony Basin',
      coordinates: [17.3995, 78.414],
      riskLevel: 'critical',
      rainfallRange: '60–85 mm/h',
      expectedRunoffM3: '42,000 m³',
      drainageStressPct: 146,
      estimatedWaterDepthRangeM: '0.6–1.2 m',
      timeToImpactMins: 30,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Shah Hatim Lake Nala Surplus Gate',
        'Tolichowki Flyover Underneath',
      ],
      recommendedAction: 'Barricade low-lying colony ingress; open GHMC primary nala shutters.',
    },
    {
      id: 'hyd-hotspot-2',
      name: 'Begumpet Brahmanwadi & Prakash Nagar Culvert',
      coordinates: [17.4447, 78.4682],
      riskLevel: 'high',
      rainfallRange: '45–65 mm/h',
      expectedRunoffM3: '31,000 m³',
      drainageStressPct: 122,
      estimatedWaterDepthRangeM: '0.4–0.8 m',
      timeToImpactMins: 40,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Begumpet Railway Station',
        'Prakash Nagar Metro Station',
      ],
      recommendedAction: 'Keep stationary suction pumps powered; divert traffic via SP Road.',
    },
  ],
  kochi: [
    {
      id: 'koc-hotspot-1',
      name: 'KSRTC Bus Terminal & Karikkamuri Low Basin',
      coordinates: [9.9723, 76.2872],
      riskLevel: 'critical',
      rainfallRange: '60–80 mm/h',
      expectedRunoffM3: '37,000 m³',
      drainageStressPct: 144,
      estimatedWaterDepthRangeM: '0.5–1.0 m',
      timeToImpactMins: 30,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Ernakulam South Railway Station (500m)',
        'Mullassery Canal Sluice',
      ],
      recommendedAction: 'Operate Mullassery canal regulator; relocate passenger bus bays.',
    },
    {
      id: 'koc-hotspot-2',
      name: 'MG Road & Jos Junction Corridor',
      coordinates: [9.9691, 76.2828],
      riskLevel: 'high',
      rainfallRange: '45–65 mm/h',
      expectedRunoffM3: '26,000 m³',
      drainageStressPct: 118,
      estimatedWaterDepthRangeM: '0.3–0.6 m',
      timeToImpactMins: 45,
      confidence: 'HIGH',
      nearbyCriticalInfrastructure: [
        'Maharajas College Metro Station',
        'Ernakulam General Hospital (1.1km)',
      ],
      recommendedAction: 'Clear coastal storm drain outlets; deploy tractor-mounted mobile pumps.',
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
