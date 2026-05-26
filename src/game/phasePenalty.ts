import { getSystemPhase } from "./phase";
import { getDominantNeed } from "./dominantNeed";

type PhasePenaltyGameState = {
  turn?: number;
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  signal?: number;
};

export function getPhasePenalty(action: string, game: PhasePenaltyGameState) {
  const phase = getSystemPhase(game);
  const need = getDominantNeed(game);

  if (!need) return 1;

  if (phase === "late") {
    if (action !== need) return 0.6;
    return 1.1;
  }

  if (phase === "mid") {
    if (action !== need) return 0.8;
    return 1.05;
  }

  return 1;
}
