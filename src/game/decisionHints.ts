export function getActionHints(game: any) {
  const hints: Record<string, string> = {};

  // REROUTE risk
  if (game.drift > 30) {
    hints["REROUTE"] = "High instability risk";
  } else if (game.load > 70) {
    hints["REROUTE"] = "Effective short-term";
  }

  // OBSERVE risk
  if (game.load > 75) {
    hints["OBSERVE"] = "Load may spike";
  } else {
    hints["OBSERVE"] = "Improves clarity";
  }

  // STABILIZE risk
  if (game.load > 80) {
    hints["STABILIZE"] = "May push load over limit";
  } else if (game.integrity < 50) {
    hints["STABILIZE"] = "Critical recovery";
  }

  return hints;
}
