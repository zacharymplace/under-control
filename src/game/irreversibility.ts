import { getDominantNeed } from "./dominantNeed";

export function getPointOfNoReturn(game: any) {
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;
  const turn = game.turn ?? 1;

  if (load >= 95 && drift >= 55) {
    return "Load and drift have crossed a coupled failure threshold.";
  }

  if (drift >= 70) {
    return "Drift has exceeded recovery capacity.";
  }

  if (load >= 100 && turn >= 8) {
    return "Load saturation has persisted too long.";
  }

  if (integrity <= 35) {
    return "Structural integrity has fallen below recoverable range.";
  }

  return null;
}

export function isPastPointOfNoReturn(game: any) {
  return Boolean(getPointOfNoReturn(game));
}

export function getLateCorrectionPenalty(action: string, game: any) {
  const need = getDominantNeed(game);
  const turn = game.turn ?? 1;

  if (!need || action !== need) return 1;

  if (turn >= 12) return 0.65;
  if (turn >= 9) return 0.8;

  return 1;
}

export function getMissedCommitmentWindow(game: any) {
  const need = getDominantNeed(game);
  const history = game.actionHistory || [];

  if (!need || history.length < 5) return null;

  const earlyWindow = history.slice(0, 5);
  const correctEarly = earlyWindow.filter((a: string) => a === need).length;

  if (correctEarly <= 1) {
    return `Early commitment window was missed: ${need}.`;
  }

  return null;
}
