import { getDominantNeed } from "./dominantNeed";

type WrongCommitmentGameState = {
  actionHistory?: string[];
  state?: string;
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  signal?: number;
  [key: string]: unknown;
};

export function getWrongCommitmentInsight(game: WrongCommitmentGameState) {
  const need = getDominantNeed(game);
  const history = game.actionHistory || [];

  if (!need || history.length < 4) return null;

  const last3 = history.slice(-3);
  const committed = last3[0];

  if (last3.every((action) => action === committed) && committed !== need) {
    if (game.state === "STABILIZED") {
      return `You initially committed to ${committed}, but adapted toward ${need} as pressure increased.`;
    }

    return `You committed to ${committed}, but the system required ${need}.`;
  }

  return null;
}
