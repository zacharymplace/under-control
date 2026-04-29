import { isStabilizationComplete } from "./recoveryCompletion";
import { getCommitmentLabel } from "./commitment";

export function getRecoveryProgress(game: any) {
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;

  const driftScore = Math.max(0, Math.min(100, 100 - drift));
  const integrityScore = Math.max(0, Math.min(100, integrity));

  return Math.round((driftScore * 0.6 + integrityScore * 0.4));
}

export function getRecoveryStatus(game: any) {
  if (isStabilizationComplete(game)) return "Recovered";
  const progress = getRecoveryProgress(game);

  if (progress >= 75) return "Near recovery";
  if (progress >= 55) return "Partial recovery";
  if (progress >= 35) return "Unstable recovery";

  return "Recovery failing";
}

export function getCommitmentStatus(game: any) {
  return getCommitmentLabel(game);
}

export function getAdvisorTrustTrajectory(game: any) {
  const memory = game.advisorMemory || {};
  const entries = Object.values(memory) as any[];

  if (!entries.length) return "Unformed";

  const trustTotal = entries.reduce((sum, m) => sum + (m.trustDelta ?? 0), 0);
  const ignoredTotal = entries.reduce((sum, m) => sum + (m.ignoredCount ?? 0), 0);

  if (ignoredTotal >= 10 || trustTotal <= -6) return "Collapsing";
  if (ignoredTotal >= 5 || trustTotal < 0) return "Degrading";
  if (trustTotal >= 5) return "Reinforcing";

  return "Stable";
}
