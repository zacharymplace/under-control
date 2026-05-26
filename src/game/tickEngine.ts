import { applyRecoveryObligationPenalty } from "./recoveryObligation";
import { getTimePressureMultiplier } from "./timePressure";
import { maybeMarkPointOfNoReturn, type PointOfNoReturn } from "./pointOfNoReturn";

type TickGameState = {
  load?: number;
  drift?: number;
  signalClarity?: number;
  signal?: number;
  turn?: number;
  pressure?: string;
  recoveryProgress?: number;
  pointOfNoReturn?: PointOfNoReturn | null;
  [key: string]: unknown;
};

export function tickGame(game: TickGameState) {
  const multiplier = getTimePressureMultiplier(game);
  const next: TickGameState = { ...game };

  next.load = Math.min(100, (game.load ?? 0) + 2 * multiplier);
  next.drift = Math.min(100, (game.drift ?? 0) + 1 * multiplier);

  if ((next.load ?? 0) > 70) {
    next.signalClarity = Math.max(0, (game.signalClarity ?? game.signal ?? 100) - 1);
  }

  next.turn = (game.turn ?? 1) + 1;

  const marked = maybeMarkPointOfNoReturn(next);
  const withPointOfNoReturn = marked
    ? { ...next, pointOfNoReturn: marked }
    : next;

  return applyRecoveryObligationPenalty(withPointOfNoReturn);
}
