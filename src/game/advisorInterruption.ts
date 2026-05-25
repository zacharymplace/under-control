import { getDecisionWindow } from "./decisionWindow";
import { getAdvisorConsensus } from "./advisorConsensus";


export function maybeInterruptAction(action: string, game: any, advisors: any[]) {
  const window = getDecisionWindow(game);
  if (window.state !== "COLLAPSED") return { action, interrupted: false };

  const collapseTurn = game.pointOfNoReturn?.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);

  if (turnsSince < 2) return { action, interrupted: false };

  const { strength } = getAdvisorConsensus(advisors, game.credibility || {});

  // base probability grows with time
  let probability = 0.1 + turnsSince * 0.05;

  // amplify with consensus
  probability += strength * 0.25;

  probability = Math.min(0.6, probability);

  if (Math.random() > probability) {
    return { action, interrupted: false };
  }

  const { dominant: override } = getAdvisorConsensus(advisors, game.credibility || {});
  if (!override || override === action) {
    return { action, interrupted: false };
  }

  return {
    action: override,
    interrupted: true,
    reason: "Advisors overrode your decision under collapse pressure.",
  };
}
