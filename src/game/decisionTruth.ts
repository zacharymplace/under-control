import { getDominantNeed } from "./dominantNeed";

type DecisionTruthGameState = {
  turn?: number;
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  signal?: number;
};

export function isCorrectDecision(action: string, game: DecisionTruthGameState) {
  const need = getDominantNeed(game);

  if (!need) return false;

  if (action === need) return true;

  if ((game.turn ?? 1) < 5 && action !== need) return true;

  return false;
}
