import { RunoffEstimate } from '@/types';

/**
 * Configurable Urban Hydrological Runoff Engine
 *
 * Implements Rational Runoff Volume:
 * Volume (m³) = (Rainfall (mm) / 1000) * Catchment Area (m²) * Composite Runoff Coefficient (C)
 *
 * Factors:
 * - Roads & Asphalt: C = 0.90
 * - Dense Buildings: C = 0.85
 * - Urban Open Land & Soil: C = 0.35
 * - Green Parks & Permeable Surfaces: C = 0.18
 */

export interface CatchmentCharacteristics {
  catchmentAreaHa: number; // in hectares (1 ha = 10,000 m2)
  imperviousPct: number; // 0 to 100
  greenPct: number; // 0 to 100
  soilInfiltrationRateMmHr: number; // e.g. 5 mm/hr
  slopePct: number;
}

export const DEFAULT_METRO_CATCHMENTS: Record<string, CatchmentCharacteristics> = {
  mumbai: {
    catchmentAreaHa: 100, // 1 km2 sample urban basin (e.g. BKC/Mithi corridor)
    imperviousPct: 82,
    greenPct: 18,
    soilInfiltrationRateMmHr: 4.5,
    slopePct: 1.2,
  },
  delhi: {
    catchmentAreaHa: 120, // Connaught Place / Barapullah basin
    imperviousPct: 78,
    greenPct: 22,
    soilInfiltrationRateMmHr: 8.0,
    slopePct: 0.8,
  },
  chennai: {
    catchmentAreaHa: 95, // Velachery / Adyar basin
    imperviousPct: 75,
    greenPct: 25,
    soilInfiltrationRateMmHr: 6.0,
    slopePct: 0.5,
  },
  bengaluru: {
    catchmentAreaHa: 110, // Bellandur / Koramangala Valley basin
    imperviousPct: 79,
    greenPct: 21,
    soilInfiltrationRateMmHr: 5.5,
    slopePct: 1.8,
  },
  kolkata: {
    catchmentAreaHa: 105, // Central Kolkata / Circular Canal basin
    imperviousPct: 84,
    greenPct: 16,
    soilInfiltrationRateMmHr: 3.8,
    slopePct: 0.4,
  },
  hyderabad: {
    catchmentAreaHa: 115, // Musi River / Hussain Sagar basin
    imperviousPct: 76,
    greenPct: 24,
    soilInfiltrationRateMmHr: 6.2,
    slopePct: 1.5,
  },
  kochi: {
    catchmentAreaHa: 85, // Periyar / Vembanad backwater coastal basin
    imperviousPct: 71,
    greenPct: 29,
    soilInfiltrationRateMmHr: 4.0,
    slopePct: 0.3,
  },
};

export function estimateUrbanRunoff(
  rainfallMm: number,
  metroCity: string,
  isSimulated = false,
  customCatchment?: Partial<CatchmentCharacteristics>
): RunoffEstimate {
  const baseCatchment = DEFAULT_METRO_CATCHMENTS[metroCity] || DEFAULT_METRO_CATCHMENTS.mumbai;
  const catchment: CatchmentCharacteristics = { ...baseCatchment, ...customCatchment };

  const areaM2 = catchment.catchmentAreaHa * 10000;
  const imperviousRatio = catchment.imperviousPct / 100;
  const greenRatio = catchment.greenPct / 100;

  // Composite Runoff Coefficient (C)
  // Asphalt/roofs ~ 0.88, permeable green areas ~ 0.22, adjusted for terrain slope
  const slopeAdjustment = Math.min(0.08, (catchment.slopePct / 5) * 0.05);
  const compositeC = Math.min(
    0.95,
    Math.max(0.2, imperviousRatio * 0.88 + greenRatio * 0.22 + slopeAdjustment)
  );

  // Infiltration loss from gross rainfall
  const effectiveRainfallMm = Math.max(0, rainfallMm - catchment.soilInfiltrationRateMmHr * 0.5);

  // Volumetric Runoff (m3) = (Rainfall in meters) * Area in m2 * C
  const runoffVolumeM3 = Math.round((effectiveRainfallMm / 1000) * areaM2 * compositeC);

  return {
    rainfallMm: Math.round(rainfallMm),
    runoffVolumeM3,
    catchmentAreaHa: catchment.catchmentAreaHa,
    runoffCoefficient: Number(compositeC.toFixed(2)),
    imperviousAreaPct: catchment.imperviousPct,
    isSimulated,
    formulaDescription: `V = (${effectiveRainfallMm.toFixed(1)}mm / 1000) × ${areaM2.toLocaleString()}m² × ${compositeC.toFixed(2)} [${catchment.imperviousPct}% impervious]`,
  };
}
