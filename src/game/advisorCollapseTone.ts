import { getDecisionWindow } from "./decisionWindow";

type AdvisorCollapseToneGameState = {
  pointOfNoReturn?: unknown;
  pressure?: string;
  load?: number;
  drift?: number;
  turn?: number;
};

export function getAdvisorCollapseTone(
  name: string,
  game: AdvisorCollapseToneGameState
) {
  const window = getDecisionWindow(game);
  if (window.state !== "COLLAPSED" && !game.pointOfNoReturn) return null;

  const key = name.toUpperCase();

  if (key === "ELENA") {
    return "The signal is no longer advisory. It is confirming loss of control.";
  }

  if (key === "MARA") {
    return "This is no longer stabilization. This is damage containment.";
  }

  if (key === "ISHAAN") {
    return "Risk has already converted into consequence.";
  }

  return "The advisory role has shifted from guidance to containment.";
}
