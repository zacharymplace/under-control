type InflectionSnapshot = {
  load?: number;
  drift?: number;
  signalClarity?: number;
};

type InflectionLogEntry = {
  turn?: number;
  after: InflectionSnapshot;
};

type InflectionCandidate = {
  turn?: number;
  severity: number;
  type: string;
  insight: string;
  recommendation: string;
};

export function findInflection(log: InflectionLogEntry[]) {
  if (!log || log.length < 2) return null;

  const candidates: InflectionCandidate[] = [];

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    const loadJump = (curr.after.load ?? 0) - (prev.after.load ?? 0);
    const driftJump = (curr.after.drift ?? 0) - (prev.after.drift ?? 0);

    if ((prev.after.load ?? 0) > 80 && driftJump > 10) {
      candidates.push({
        turn: curr.turn,
        severity: (prev.after.load ?? 0) + driftJump,
        type: "Missed Stabilization",
        insight:
          "Load and drift crossed into an unstable range, but no stabilizing correction landed in time.",
        recommendation: "Stabilize before continuing the current action pattern.",
      });
    }

    if ((prev.after.signalClarity ?? 0) < 60 && loadJump > 8) {
      candidates.push({
        turn: curr.turn,
        severity: loadJump * 2,
        type: "Premature Action",
        insight:
          "The system was still unclear while pressure accelerated.",
        recommendation: "Observe earlier, then act before load reaches capacity.",
      });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.severity - a.severity);
  return candidates[0];
}
