export function getDecisionHints(game: any) {
  const hints: Record<string, string> = {};

  if (!game) return hints;

  if (game.drift > 50) {
    hints.STABILIZE = "Drift is rising";
  }

  if (game.load > 80) {
    hints.REROUTE = "Load is high";
  }

  if (game.signalClarity > 70 || game.signal > 70) {
    hints.OBSERVE = "Signal is strong";
  }

  return hints;
}

export const getActionHints = getDecisionHints;
