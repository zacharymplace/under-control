export function getTrajectoryPenalty(game: any) {
  const history = game.actionHistory || [];
  if (history.length < 3) return 1;

  const last3 = history.slice(-3);

  const uniqueCount = new Set(last3).size;
  const rerouteCount = last3.filter((a: string) => a === "REROUTE").length;
  const observeCount = last3.filter((a: string) => a === "OBSERVE").length;
  const stabilizeCount = last3.filter((a: string) => a === "STABILIZE").length;

  let penalty = 1;

  const oscillating = uniqueCount >= 3;
  const rerouteSpam = rerouteCount >= 2 && (game.drift ?? 0) >= 40;
  const observeDelay = observeCount >= 2 && ((game.load ?? 0) >= 75 || (game.drift ?? 0) >= 45);
  const overStabilizing = stabilizeCount >= 2 && (game.load ?? 0) >= 85;

  if (oscillating) penalty *= 0.82;
  if (rerouteSpam) penalty *= 0.78;
  if (observeDelay) penalty *= 0.8;
  if (overStabilizing) penalty *= 0.85;

  return Number(Math.max(0.55, penalty).toFixed(2));
}

export function getTrajectoryRiskLabel(game: any) {
  const penalty = getTrajectoryPenalty(game);

  if (penalty <= 0.65) return "Severe trajectory risk";
  if (penalty <= 0.8) return "Unstable trajectory";
  if (penalty < 1) return "Trajectory drag";

  return "Coherent trajectory";
}

export function getTrajectoryInsight(game: any) {
  const history = game.actionHistory || [];
  if (history.length < 3) return null;

  const last3 = history.slice(-3);
  const uniqueCount = new Set(last3).size;
  const rerouteCount = last3.filter((a: string) => a === "REROUTE").length;
  const observeCount = last3.filter((a: string) => a === "OBSERVE").length;
  const stabilizeCount = last3.filter((a: string) => a === "STABILIZE").length;

  if (uniqueCount >= 3) {
    return "Strategy oscillation is increasing recovery risk.";
  }

  if (rerouteCount >= 2 && (game.drift ?? 0) >= 40) {
    return "Repeated reroutes are relieving load while compounding hidden instability.";
  }

  if (observeCount >= 2 && ((game.load ?? 0) >= 75 || (game.drift ?? 0) >= 45)) {
    return "Repeated observation is improving signal while the system continues degrading.";
  }

  if (stabilizeCount >= 2 && (game.load ?? 0) >= 85) {
    return "Repeated stabilization is protecting structure while load pressure remains unresolved.";
  }

  return null;
}
