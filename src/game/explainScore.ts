type ScoreExplanationGameState = {
  drift?: number;
  load?: number;
  signalClarity?: number;
  signal?: number;
};

export function explainScore(action: string, game: ScoreExplanationGameState) {
  const reasons: string[] = [];

  const signal = game.signalClarity ?? game.signal ?? 0;

  if ((game.drift ?? 0) > 50 && action === "STABILIZE") {
    reasons.push("High drift favors stabilization");
  }

  if ((game.load ?? 0) > 80 && action === "REROUTE") {
    reasons.push("High load favors reroute");
  }

  if (signal < 55 && action === "OBSERVE") {
    reasons.push("Low signal favors observation");
  }

  if (reasons.length === 0) {
    reasons.push("No strong signal advantage");
  }

  return reasons;
}
