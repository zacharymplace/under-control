import { getDecisionWindow } from "./decisionWindow";
import { getAdvisorConsensus } from "./advisorConsensus";

export function getCollapseCertaintyLevel(game: any) {
  const window = getDecisionWindow(game);

  if (!game.pointOfNoReturn && window.state !== "COLLAPSED") {
    return "none";
  }

  const collapseTurn = game.pointOfNoReturn?.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);

  if (turnsSince >= 4) return "absolute";
  if (turnsSince >= 2) return "firm";

  return "concerned";
}

export function getAdvisorCertaintyTone(name: string, game: any) {
  const level = getCollapseCertaintyLevel(game);
  const { strength } = getAdvisorConsensus(game.personas || []);
  if (level === "none") return null;

  const key = name.toUpperCase();

  if (key === "ELENA") {
    if (level === "concerned") return "The signal is deteriorating. The decision window is closing.";
    if (level === "firm") return "The signal is no longer advisory. It is confirming loss of control.";
    return "The signal confirms collapse. Recovery is no longer the active problem.";
  }

  if (key === "MARA") {
    if (level === "concerned") return "The system is losing correction margin.";
    if (level === "firm") return "This is no longer stabilization. This is damage containment.";
    return "Recovery margin is exhausted. Structure can only limit the damage now.";
  }

  if (key === "ISHAAN") {
    if (level === "concerned") return "Risk is accelerating faster than the response.";
    if (level === "firm") return "Risk has already converted into consequence.";
    return "The downside case is no longer theoretical. It is unfolding.";
  }

  return null;
}
