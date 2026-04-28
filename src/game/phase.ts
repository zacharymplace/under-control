export type Phase = "early" | "mid" | "late";

export function getSystemPhase(game: any): Phase {
  const turn = game.turn ?? 1;
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;

  // late = danger zone
  if (turn >= 10 || load >= 90 || drift >= 65) {
    return "late";
  }

  // mid = developing pressure
  if (turn >= 5 || load >= 70 || drift >= 45) {
    return "mid";
  }

  return "early";
}
