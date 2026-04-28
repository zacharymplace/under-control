export function applyConsensusDrift(advisors: any[], game: any) {
  const drift = game.drift ?? 0;
  const signal = game.signal ?? game.signalClarity ?? 1;

  // only activate under meaningful degradation
  if (drift < 60 || signal > 0.6) return advisors;

  return advisors.map((a) => {
    const action = a.suggests || a.action || a.suggestion;

    // introduce bias under high drift
    if (Math.random() < 0.25) {
      return {
        ...a,
        suggests: action === "STABILIZE" ? "OBSERVE" : "STABILIZE",
      };
    }

    return a;
  });
}
