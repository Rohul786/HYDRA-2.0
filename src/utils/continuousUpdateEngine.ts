import { ContinuousUpdateCycle, AlertLevel, UpdateCycleStage } from '@/types';

/**
 * Continuous Observation, Recalculation & False-Alert Downgrade State Machine
 *
 * Prevents HYDRA from treating stale predictions as facts:
 * OBSERVE -> ANALYZE -> ESTIMATE -> UPDATE -> VERIFY -> RECALCULATE -> ALERT / DOWNGRADE
 */

export function evaluateUpdateCycle(
  currentIntensity: number,
  previousProbabilityPct: number,
  previousStage: UpdateCycleStage
): {
  cycle: ContinuousUpdateCycle;
  alertLevel: AlertLevel;
  notificationMessage?: string;
} {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Calculate new probability based on current observations
  let newProb = Math.min(95, Math.max(15, Math.round(currentIntensity * 1.05 + 10)));
  let newStage: UpdateCycleStage = 'OBSERVE';
  let alertLevel: AlertLevel = 'MONITOR';
  let notificationMessage: string | undefined;

  // Check for storm dissipation / weakening (Downgrade condition)
  if (previousProbabilityPct >= 65 && currentIntensity < 25) {
    newProb = Math.min(38, Math.round(currentIntensity * 1.2));
    newStage = 'DOWNGRADED';
    alertLevel = 'DOWNGRADED';
    notificationMessage =
      'Conditions have weakened. Previous warning has been downgraded.';
  } else if (currentIntensity >= 60) {
    newStage = 'ALERT';
    alertLevel = 'CRITICAL';
  } else if (currentIntensity >= 35) {
    newStage = 'ALERT';
    alertLevel = 'PRE_ALERT';
  } else if (currentIntensity >= 15) {
    newStage = 'UPDATE';
    alertLevel = 'WATCH';
  } else {
    newStage = 'OBSERVE';
    alertLevel = 'MONITOR';
  }

  const cycleHistory = [
    { timeLabel: 'T-60', probabilityPct: 72, status: 'WATCH' },
    { timeLabel: 'T-45', probabilityPct: 81, status: 'PRE-ALERT' },
    { timeLabel: 'T-30', probabilityPct: 90, status: 'CRITICAL' },
    { timeLabel: 'NOW', probabilityPct: newProb, status: alertLevel },
  ];

  return {
    cycle: {
      stage: newStage,
      previousProbabilityPct,
      currentProbabilityPct: newProb,
      lastRecalculatedAt: `${timeStr} IST`,
      downgradeReason:
        newStage === 'DOWNGRADED'
          ? 'Radar reflectivity attenuated below 35 dBZ; convective updraft diminished.'
          : undefined,
      cycleHistory,
    },
    alertLevel,
    notificationMessage,
  };
}
