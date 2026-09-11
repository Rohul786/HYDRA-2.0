import { ExplainableRiskFactor, AlertLevel } from '@/types';

/**
 * Explainable Risk Score Breakdown
 *
 * Breaks down multi-factor hydrological and meteorological risk without
 * exposing complicated ML equations, giving actionable clarity to citizens and municipal teams.
 */

export function getExplainableRiskFactors(
  rainfallIntensity: number,
  drainageStressPct: number,
  elevationM: number,
  imperviousPct: number
): {
  factors: ExplainableRiskFactor[];
  overallRisk: AlertLevel;
  summary: string;
} {
  const factors: ExplainableRiskFactor[] = [];

  // 1. Rainfall intensity
  const rainLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
    rainfallIntensity >= 65 ? 'CRITICAL' : rainfallIntensity >= 35 ? 'HIGH' : rainfallIntensity >= 15 ? 'MODERATE' : 'LOW';
  factors.push({
    icon: '🌧️',
    label: 'Rainfall intensity',
    value: `${rainfallIntensity} mm/h (${rainLevel})`,
    level: rainLevel,
    description: rainfallIntensity >= 65 ? 'Extreme convective cloudburst-tier precipitation rate' : rainfallIntensity >= 35 ? 'Heavy monsoonal downpour saturating ground' : 'Light to moderate rain rate',
  });

  // 2. Storm movement
  factors.push({
    icon: '📡',
    label: 'Storm cell trajectory',
    value: rainfallIntensity >= 30 ? 'Advancing toward your basin' : 'Stable atmospheric drift',
    level: rainfallIntensity >= 30 ? 'HIGH' : 'LOW',
    description: 'Doppler velocity vectors indicate localized moisture convergence',
  });

  // 3. Current rainfall trend
  factors.push({
    icon: '💧',
    label: 'Precipitation trend',
    value: rainfallIntensity >= 40 ? 'Increasing (+12 mm/h trend)' : 'Steady',
    level: rainfallIntensity >= 40 ? 'HIGH' : 'MODERATE',
    description: 'Rapid moisture flux into lower atmospheric boundary layer',
  });

  // 4. Drainage stress
  const drainLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
    drainageStressPct >= 130 ? 'CRITICAL' : drainageStressPct >= 100 ? 'HIGH' : drainageStressPct >= 75 ? 'MODERATE' : 'LOW';
  factors.push({
    icon: '🚰',
    label: 'Drainage network stress',
    value: `${drainageStressPct}% (${drainLevel})`,
    level: drainLevel,
    description: drainageStressPct >= 100 ? 'Water inflow exceeds underground pipe conveyance capacity' : 'Drainage operating within nominal gravity capacity',
  });

  // 5. Urbanization
  const urbLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
    imperviousPct >= 80 ? 'HIGH' : imperviousPct >= 50 ? 'MODERATE' : 'LOW';
  factors.push({
    icon: '🏙️',
    label: 'Urban imperviousness',
    value: `${imperviousPct}% Concrete/Asphalt`,
    level: urbLevel,
    description: 'High concrete coverage restricts natural rainwater soil infiltration',
  });

  // 6. Micro-Elevation
  const elevLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
    elevationM <= 6 ? 'HIGH' : elevationM <= 12 ? 'MODERATE' : 'LOW';
  factors.push({
    icon: '⛰️',
    label: 'Terrain elevation (DEM)',
    value: `${elevationM.toFixed(1)}m MSL (${elevLevel === 'HIGH' ? 'Low-lying depression' : 'Elevated ridge'})`,
    level: elevLevel,
    description: elevationM <= 6 ? 'Natural depression susceptible to street-level pooling' : 'Adequate gravitational runoff gradient',
  });

  // Overall risk computation
  let overallRisk: AlertLevel = 'MONITOR';
  if (rainLevel === 'CRITICAL' || drainLevel === 'CRITICAL') {
    overallRisk = 'CRITICAL';
  } else if (rainLevel === 'HIGH' || drainLevel === 'HIGH') {
    overallRisk = 'PRE_ALERT';
  } else if (rainLevel === 'MODERATE' || drainLevel === 'MODERATE') {
    overallRisk = 'WATCH';
  }

  const summary =
    overallRisk === 'CRITICAL'
      ? 'Critical waterlogging hazard: High precipitation combined with surcharging drains and low elevation.'
      : overallRisk === 'PRE_ALERT'
      ? 'Elevated flood risk: Rain intensity is outpacing storm drain clearance in low-lying corridors.'
      : overallRisk === 'WATCH'
      ? 'Advisory watch: Conditions may develop into street waterlogging if rain continues.'
      : 'Normal conditions: Drainage network operating within safe conveyance margins.';

  return {
    factors,
    overallRisk,
    summary,
  };
}
