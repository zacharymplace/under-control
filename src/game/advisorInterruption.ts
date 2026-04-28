import { getDecisionWindow } from "./decisionWindow";

function pickDominantAction(advisors: any[]) {
  const counts: Record<string, number> = {};

  for (const a of advisors) {
    const action = a.suggests || a.action || a.suggestion;
    if (!action) continue;
    counts[action] = (counts[action] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

export function maybeInterruptAction(action: string, game: any, advisors: any[]) {
  const window = getDecisionWindow(game);
  if (window.state !== "COLLAPSED") return { action, interrupted: false };

  const collapseTurn = game.pointOfNoReturn?.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);

  if (turnsSince < 2) return { action, interrupted: false };

  const probability = Math.min(0.35, 0.15 + turnsSince * 0.05);

  if (Math.random() > probability) {
    return { action, interrupted: false };
  }

  const override = pickDominantAction(advisors);
  if (!override || override === action) {
    return { action, interrupted: false };
  }

  return {
    action: override,
    interrupted: true,
    reason: "Advisors overrode your decision under collapse pressure.",
  };
}
