import { getDominantNeed } from "./dominantNeed";
import { getCommitmentScore } from "./commitment";

export function getAdvisorCommitmentNote(name: string, game: any) {
  const need = getDominantNeed(game);
  const score = getCommitmentScore(game);

  if (!need || score >= 1) return null;

  const key = name.toUpperCase();

  if (key === "ELENA") {
    return "The read is correct. You are not following through.";
  }

  if (key === "MARA") {
    return "Structure requires sustained correction. You are interrupting it.";
  }

  if (key === "ISHAAN") {
    return "Partial correction increases risk. Incomplete stabilization is unstable.";
  }

  return null;
}
