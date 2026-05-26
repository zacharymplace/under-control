type AlternativePathLogEntry = {
  turn?: number;
  action?: string;
  drift?: number;
  load?: number;
  signal?: number;
};

export function buildAlternativePath({
  log,
  inflectionTurn,
}: {
  log: AlternativePathLogEntry[];
  inflectionTurn: number | null;
}) {
  if (!log || inflectionTurn == null) return null;

  const step = log.find((entry) => entry.turn === inflectionTurn);
  if (!step) return null;

  const betterAction =
    (step.drift ?? 0) > 50 ? "STABILIZE" :
    (step.load ?? 0) > 85 ? "REROUTE" :
    (step.signal ?? 100) < 60 ? "OBSERVE" :
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
