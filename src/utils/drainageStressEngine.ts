import { DrainageStressMetric } from '@/types';

/**
 * Drainage Capacity & Waterlogging Risk Engine
 *
 * Calculates:
 * Drainage Stress (%) = (Expected Inflow Volume / Conveyance Capacity) * 100%
 * Excess Volume (m³) = max(0, Inflow Volume - Capacity)
 *
 * Classifications:
 * - Normal: < 75%
 * - Moderate: 75% – 100%
 * - High: 100% – 130%
 * - Critical: > 130% (Severe hydraulic surcharge onto city streets)
 */

export interface DrainageInfrastructureConfig {
  baseCapacityM3: number; // Volumetric drainage capacity per 1h storm window
  pumpsTotalCount: number;
  pumpCapacityLps: number;
  chokeFraction: number; // e.g. 0.15 = 15% silted/blocked
  tidalLockFactor: number; // 0.0 to 0.4 capacity reduction during high tide
}

export const METRO_DRAINAGE_CAPACITIES: Record<string, DrainageInfrastructureConfig> = {
  mumbai: {
    baseCapacityM3: 52000, // BKC/Mithi stormwater trunk line capacity
    pumpsTotalCount: 6,
    pumpCapacityLps: 4500, // Irla / Love Grove class dewatering pumps
    chokeFraction: 0.18,
    tidalLockFactor: 0.25, // Coastal outfall flapper gates restricted during high tide
  },
  delhi: {
    baseCapacityM3: 58000, // Barapullah / Najafgarh trunk line
    pumpsTotalCount: 8,
    pumpCapacityLps: 3800,
    chokeFraction: 0.22, // Heavy silting
    tidalLockFactor: 0.0, // Inland non-tidal
  },
  chennai: {
    baseCapacityM3: 48000, // Buckingham Canal / Velachery channels
    pumpsTotalCount: 5,
    pumpCapacityLps: 3200,
    chokeFraction: 0.2,
    tidalLockFactor: 0.2,
  },
};

export function calculateDrainageStress(
  runoffVolumeM3: number,
  metroCity: string,
  tidalState = 'normal',
  pumpsOffline = 1,
  isSimulated = false
): DrainageStressMetric {
  const infra = METRO_DRAINAGE_CAPACITIES[metroCity] || METRO_DRAINAGE_CAPACITIES.mumbai;

  const pumpsOperating = Math.max(0, infra.pumpsTotalCount - pumpsOffline);
  const activePumpBoostM3 = (pumpsOperating * infra.pumpCapacityLps * 3600) / 1000; // 1-hour pump throughput

  // High tide reduces effective gravity outfall
  const tidePenalty = tidalState === 'high_tide' ? infra.tidalLockFactor : tidalState === 'low_tide' ? -0.05 : 0.0;

  // Effective net drainage capacity in 1 hour
  const netGravityCapacityM3 = infra.baseCapacityM3 * (1 - infra.chokeFraction) * (1 - tidePenalty);
  const totalCapacityM3 = Math.round(netGravityCapacityM3 + activePumpBoostM3 * 0.4);

  // Hydraulic Stress %
  const stressPct = Math.round((runoffVolumeM3 / Math.max(1000, totalCapacityM3)) * 100);
  const potentialExcessM3 = Math.max(0, runoffVolumeM3 - totalCapacityM3);

  let classification: 'Normal' | 'Moderate' | 'High' | 'Critical' = 'Normal';
  if (stressPct >= 130) {
    classification = 'Critical';
  } else if (stressPct >= 100) {
    classification = 'High';
  } else if (stressPct >= 75) {
    classification = 'Moderate';
  }

  // Convert m3/h to L/s for telemetry
  const inflowLps = Math.round((runoffVolumeM3 * 1000) / 3600);
  const capacityLps = Math.round((totalCapacityM3 * 1000) / 3600);

  return {
    inflowLps,
    capacityLps,
    stressPct,
    potentialExcessM3,
    classification,
    pumpsOperatingCount: pumpsOperating,
    pumpsTotalCount: infra.pumpsTotalCount,
    isSimulated,
  };
}
