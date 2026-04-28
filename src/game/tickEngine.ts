import { applyRecoveryObligationPenalty } from "./recoveryObligation";
import { getTimePressureMultiplier } from "./timePressure";
import { maybeMarkPointOfNoReturn } from "./pointOfNoReturn";

export function tickGame(game: any) {
  const multiplier = getTimePressureMultiplier(game);
  const next = { ...game };

  // Passive drift / pressure over time
  next.load = Math.min(100, (game.load ?? 0) + 2 * multiplier);
  next.drift = Math.min(100, (game.drift ?? 0) + 1 * multiplier);

  // Slight signal decay under pressure
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
