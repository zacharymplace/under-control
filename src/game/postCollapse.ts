export function getPostCollapseEffectiveness(action: string, game: any) {
  if (!game.pointOfNoReturn) return 1;

  const collapseTurn = game.pointOfNoReturn.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);

  // base effectiveness by action
  let base = 1;
  if (action === "STABILIZE") base = 0.6;
  else if (action === "REROUTE") base = 0.65;
  else if (action === "OBSERVE") base = 0.5;

  // decay: 10% per turn after collapse, floored at 0.25
  const decay = Math.max(0.25, 1 - 0.1 * turnsSince);

  return base * decay;
}

export function getPostCollapseNote(action: string, game: any) {
  if (!game.pointOfNoReturn) return null;

  const collapseTurn = game.pointOfNoReturn.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);

  if (turnsSince >= 3) {
    return "Post-collapse: recovery capacity is rapidly diminishing.";
  }

  if (action === "STABILIZE") {
    return "Post-collapse: stabilization is only partially effective.";
  }

  if (action === "REROUTE") {
    return "Post-collapse: reroute relieves pressure, but margin is limited.";
  }

  if (action === "OBSERVE") {
    return "Post-collapse: observation is too late to restore control.";
  }

  return null;
}
