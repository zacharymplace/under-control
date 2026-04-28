import { getDecisionWindow } from "./decisionWindow";
import { getAdvisorConsensus } from "./advisorConsensus";

export function maybeForceAction(action: string, game: any, advisors: any[]) {
  const window = getDecisionWindow(game);
  if (window.state !== "COLLAPSED") return { action, forced: false };

  const collapseTurn = game.pointOfNoReturn?.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);

  const { dominant, strength } = getAdvisorConsensus(advisors);

  if (turnsSince < 3 || strength < 0.75 || !dominant) {
    return { action, forced: false };
  }

  return {
    action: dominant,
    forced: true,
    reason: "System executed dominant action under collapse conditions.",
  };
}
