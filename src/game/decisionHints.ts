type DecisionHintGameState = {
  drift?: number;
  load?: number;
  signalClarity?: number;
  signal?: number;
};

export function getDecisionHints(game: DecisionHintGameState | null | undefined) {
  const hints: Record<string, string> = {};

  if (!game) return hints;

  if ((game.drift ?? 0) > 50) {
    hints.STABILIZE = "Drift is rising";
  }

  if ((game.load ?? 0) > 80) {
    hints.REROUTE = "Load is high";
  }

  if ((game.signalClarity ?? 0) > 70 || (game.signal ?? 0) > 70) {
    hints.OBSERVE = "Signal is strong";
  }

  return hints;
}

export const getActionHints = getDecisionHints;
