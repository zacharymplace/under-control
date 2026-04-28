export function getPressureDistortion(action: string, game: any) {
  const pressure = game.pressure;
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const signal = game.signalClarity ?? game.signal ?? 0;

  if (pressure !== "CRITICAL") return 1;

  // Under critical pressure, the system amplifies tempting but imperfect reads.
  if (load >= 90 && action === "REROUTE") return 1.18;
  if (drift >= 55 && action === "STABILIZE") return 1.18;
  if (signal >= 80 && action === "OBSERVE") return 1.1;

  // Actions that do not match the visible pressure get slightly suppressed.
  return 0.92;
}

export function getPressureDistortionNote(action: string, game: any) {
  if (game.pressure !== "CRITICAL") return null;

  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const signal = game.signalClarity ?? game.signal ?? 0;

  if (load >= 90 && action === "REROUTE") {
    return "Critical load is making reroute feel more urgent.";
  }

  if (drift >= 55 && action === "STABILIZE") {
    return "Critical drift is making stabilization feel more urgent.";
  }

  if (signal >= 80 && action === "OBSERVE") {
    return "Strong signal is tempting further observation.";
  }

  return null;
}
