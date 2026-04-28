export function buildAlternativePath({
  log,
  inflectionTurn,
}: {
  log: any[];
  inflectionTurn: number | null;
}) {
  if (!log || inflectionTurn == null) return null;

  const step = log.find((l) => l.turn === inflectionTurn);
  if (!step) return null;

  // simple heuristic (no full sim)
  const betterAction =
    step.drift > 50 ? "STABILIZE" :
    step.load > 85 ? "REROUTE" :
    step.signal < 60 ? "OBSERVE" :
    null;

  if (!betterAction || betterAction === step.action) return null;

  return {
    turn: inflectionTurn,
    recommended: betterAction,
    reason:
      betterAction === "STABILIZE"
        ? "Drift was compounding"
        : betterAction === "REROUTE"
        ? "Load exceeded safe capacity"
        : "Signal was unreliable",
  };
}
