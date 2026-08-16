export type Phase = "early" | "mid" | "late";

type PhaseGameState = {
  turn?: number;
  load?: number;
  drift?: number;
  [key: string]: unknown;
};

export function getSystemPhase(game: PhaseGameState): Phase {
  const turn = game.turn ?? 1;
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;

  if (turn >= 10 || load >= 90 || drift >= 65) {
    return "late";
  }

  if (turn >= 5 || load >= 70 || drift >= 45) {
    return "mid";
  }

  return "early";
}
