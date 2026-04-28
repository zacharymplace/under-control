export function isStabilizationComplete(game: any) {
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;

  return drift <= 40 && integrity >= 85;
}

export function getIncompleteRecoveryInsight(game: any) {
  const history = game.actionHistory || [];

  if (history.length < 4) return null;

  const recent = history.slice(-4);
  const stabilizeCount = recent.filter((a: string) => a === "STABILIZE").length;

  if (stabilizeCount >= 2 && !isStabilizationComplete(game)) {
    return "Stabilization was started but not completed.";
  }

  return null;
}
