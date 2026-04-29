import { getDominantNeed } from "./dominantNeed";

export function isCorrectDecision(action: string, game: any) {
  const need = getDominantNeed(game);

  if (!need) return false;

  // strict correctness
  if (action === need) return true;

  // partial correctness (early phase flexibility)
  if (game.turn < 5 && action !== need) return true;

  return false;
}
