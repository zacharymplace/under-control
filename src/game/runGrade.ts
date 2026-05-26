type RunGradeGameState = {
  state?: string;
  turn?: number;
  load?: number;
  drift?: number;
  integrity?: number;
  [key: string]: unknown;
};

export function getRunGrade(game: RunGradeGameState) {
  const state = game.state;
  const turn = game.turn ?? 1;
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;

  if (state === "STABILIZED") {
    if (turn <= 10 && drift < 35 && integrity >= 75) return "Controlled Recovery";
    if (integrity >= 60) return "Stabilized Under Pressure";
    return "Costly Stabilization";
  }

  if (state === "FAILED") {
    if (turn >= 10) return "Late Collapse";
    return "System Collapse";
  }

  if (load >= 90 || drift >= 65 || integrity <= 40) return "Near Failure";
  if (load >= 75 || drift >= 45 || integrity <= 60) return "Unstable Control";

  return "In Control";
}
