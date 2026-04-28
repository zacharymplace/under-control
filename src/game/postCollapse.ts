export function getPostCollapseEffectiveness(action: string, game: any) {
  if (!game.pointOfNoReturn) return 1;

  if (action === "STABILIZE") return 0.55;
  if (action === "REROUTE") return 0.6;
  if (action === "OBSERVE") return 0.45;

  return 1;
}

export function getPostCollapseNote(action: string, game: any) {
  if (!game.pointOfNoReturn) return null;

  if (action === "STABILIZE") {
    return "Post-collapse: stabilization is only partially effective.";
  }

  if (action === "REROUTE") {
    return "Post-collapse: reroute relieves pressure, but recovery margin is gone.";
  }

  if (action === "OBSERVE") {
    return "Post-collapse: observation is too late to restore control.";
  }

  return null;
}
