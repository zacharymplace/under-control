import { getSystemPhase } from "./phase";
import { getDominantNeed } from "./dominantNeed";

export function getPhasePenalty(action: string, game: any) {
  const phase = getSystemPhase(game);
  const need = getDominantNeed(game);

  if (!need) return 1;

  // Late phase: wrong action is heavily punished
  if (phase === "late") {
    if (action !== need) return 0.6;
    return 1.1; // reward correct late recovery
  }

  // Mid phase: mild shaping
  if (phase === "mid") {
    if (action !== need) return 0.8;
    return 1.05;
  }

  // Early phase: flexibility allowed
  return 1;
}
