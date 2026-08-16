import { isStabilizationComplete } from "./recoveryCompletion";
import { getCommitmentLabel } from "./commitment";

type AdvisorMemorySummary = {
  trustDelta?: number;
  ignoredCount?: number;
};

type RunLegibilityGameState = {
  drift?: number;
  integrity?: number;
  load?: number;
  signal?: number;
  signalClarity?: number;
  actionHistory?: string[];
  advisorMemory?: Record<string, AdvisorMemorySummary | undefined>;
};

export function getRecoveryProgress(game: RunLegibilityGameState) {
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;

  const driftScore = Math.max(0, Math.min(100, 100 - drift));
  const integrityScore = Math.max(0, Math.min(100, integrity));

  return Math.round(driftScore * 0.6 + integrityScore * 0.4);
}

export function getRecoveryStatus(game: RunLegibilityGameState) {
  if (isStabilizationComplete(game)) return "Recovered";
  const progress = getRecoveryProgress(game);

  if (progress >= 75) return "Near recovery";
  if (progress >= 55) return "Partial recovery";
  if (progress >= 35) return "Unstable recovery";

  return "Recovery failing";
}

export function getCommitmentStatus(game: RunLegibilityGameState) {
  return getCommitmentLabel(game);
}

export function getAdvisorTrustTrajectory(game: RunLegibilityGameState) {
  const memory = game.advisorMemory || {};
  const entries = Object.values(memory).filter(
    (entry): entry is AdvisorMemorySummary => Boolean(entry)
  );

  if (!entries.length) return "Unformed";

  const trustTotal = entries.reduce(
    (sum, memoryEntry) => sum + (memoryEntry.trustDelta ?? 0),
    0
  );
  const ignoredTotal = entries.reduce(
    (sum, memoryEntry) => sum + (memoryEntry.ignoredCount ?? 0),
    0
  );

  if (ignoredTotal >= 10 || trustTotal <= -6) return "Collapsing";
  if (ignoredTotal >= 5 || trustTotal < 0) return "Degrading";
  if (trustTotal >= 5) return "Reinforcing";

  return "Stable";
}
