import { getDominantNeed } from "./dominantNeed";

type NeedNeglectGameState = {
  actionHistory?: string[];
  state?: string;
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  signal?: number;
};

export function getNeedNeglectCount(game: NeedNeglectGameState) {
  const need = getDominantNeed(game);
  const history = game.actionHistory || [];

  if (!need || history.length === 0) return 0;

  let count = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === need) break;
    count++;
  }

  return count;
}

export function getNeedNeglectPenalty(game: NeedNeglectGameState) {
  const count = getNeedNeglectCount(game);

  if (count >= 4) return 0.45;
  if (count >= 3) return 0.6;
  if (count >= 2) return 0.75;

  return 1;
}

export function getNeedNeglectInsight(game: NeedNeglectGameState) {
  const need = getDominantNeed(game);
  const count = getNeedNeglectCount(game);

  if (!need || count < 2) return null;

  if (game.state === "STABILIZED") {
    return `Primary need was not always prioritized, but control was restored: ${need}.`;
  }

  return `Primary need ignored for ${count} turns: ${need}.`;
}
