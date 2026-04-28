export function buildCounterfactualReplay(game: any, inflection: any) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const turn = inflection?.turn ?? null;
  const step =
    turn != null ? log.find((entry: any) => entry.turn === turn) : log[log.length - 1];

  if (!step) return null;

  let betterAction: "STABILIZE" | "REROUTE" | "OBSERVE" | null = null;

  if (step.before.drift >= 45) betterAction = "STABILIZE";
  else if (step.before.load >= 85) betterAction = "REROUTE";
  else if (step.before.signalClarity < 60) betterAction = "OBSERVE";

  if (!betterAction || betterAction === step.action) return null;

  const projected = projectOneTurn(step.before, betterAction);

  return {
    turn: step.turn,
    actualAction: step.action,
    betterAction,
    before: step.before,
    actual: step.after,
    projected,
    insight:
      betterAction === "STABILIZE"
        ? "Stabilizing would have reduced drift pressure before it compounded."
        : betterAction === "REROUTE"
        ? "Rerouting would have created load capacity before saturation."
        : "Observing would have improved signal before committing to a risky action.",
  };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function projectOneTurn(before: any, action: string) {
  const next = { ...before };

  if (action === "STABILIZE") {
    next.load = clamp(next.load + 8);
    next.integrity = clamp(next.integrity + 8);
    next.drift = clamp(next.drift - 6);
  }

  if (action === "REROUTE") {
    next.load = clamp(next.load - 12);
    next.integrity = clamp(next.integrity - 6);
    next.drift = clamp(next.drift + 12);
  }

  if (action === "OBSERVE") {
    next.load = clamp(next.load + 8);
    next.integrity = clamp(next.integrity - 1);
    next.signalClarity = clamp(next.signalClarity + 12);
    next.drift = clamp(next.drift + 3);
  }

  return next;
}
