export function findInflection(log: any[]) {
  if (!log || log.length < 2) return null;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    const loadJump = curr.after.load - prev.after.load;
    const driftJump = curr.after.drift - prev.after.drift;

    if (prev.after.load > 80 && driftJump > 10) {
      return {
        turn: curr.turn,
        type: "Missed Stabilization",
        insight: "High load combined with rising drift required stabilization.",
        recommendation: "Stabilize before continuing the prior action pattern.",
      };
    }

    if (prev.after.signalClarity < 60 && loadJump > 8) {
      return {
        turn: curr.turn,
        type: "Premature Action",
        insight: "The system was still unclear while pressure accelerated.",
        recommendation: "Observe earlier, then act before load reaches capacity.",
      };
    }
  }

  return null;
}
