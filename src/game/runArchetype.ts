export function classifyRun(game: any) {
  const actions = game.actionHistory || [];
  if (!actions.length) return "Unclassified";

  const count = (action: string) =>
    actions.filter((a: string) => a === action).length;

  const reroute = count("REROUTE");
  const stabilize = count("STABILIZE");
  const observe = count("OBSERVE");

  if (reroute > stabilize && reroute > observe) return "Aggressive Operator";
  if (stabilize > reroute && stabilize > observe) return "Defensive Stabilizer";
  if (observe > reroute && observe > stabilize) return "Signal Seeker";

  return "Balanced Responder";
}
