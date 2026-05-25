export type DominantNeed = "STABILIZE" | "REROUTE" | "OBSERVE" | null;

type DominantNeedGameState = {
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  signal?: number;
};

export function getDominantNeed(game: DominantNeedGameState): DominantNeed {
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;
  const signal = game.signalClarity ?? game.signal ?? 100;

  if (drift >= 55 || integrity <= 55) return "STABILIZE";
  if (load >= 85) return "REROUTE";
  if (signal < 55) return "OBSERVE";

  return null;
}

export function getDominantNeedLabel(game: DominantNeedGameState) {
  const need = getDominantNeed(game);

  if (need === "STABILIZE") return "Primary need: stabilize instability";
  if (need === "REROUTE") return "Primary need: release load pressure";
  if (need === "OBSERVE") return "Primary need: improve signal clarity";

  return "Primary need: balanced control";
}
