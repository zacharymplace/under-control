type ConsensusDriftAdvisor = {
  suggests?: string | null;
  action?: string | null;
  suggestion?: string | null;
  [key: string]: unknown;
};

type ConsensusDriftGameState = {
  drift?: number;
  signal?: number;
  signalClarity?: number;
};

export function applyConsensusDrift<T extends ConsensusDriftAdvisor>(
  advisors: T[],
  game: ConsensusDriftGameState
): T[] {
  const drift = game.drift ?? 0;
  const signal = game.signal ?? game.signalClarity ?? 1;

  // only activate under meaningful degradation
  if (drift < 60 || signal > 0.6) return advisors;

  return advisors.map((advisor) => {
    const action = advisor.suggests || advisor.action || advisor.suggestion;

    // introduce bias under high drift
    if (Math.random() < 0.25) {
      return {
        ...advisor,
        suggests: action === "STABILIZE" ? "OBSERVE" : "STABILIZE",
      };
    }

    return advisor;
  });
}
