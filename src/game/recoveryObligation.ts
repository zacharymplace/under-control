export function getRecoveryObligation(game: any) {
  const recovery = game.recoveryProgress ?? 0;
  const load = game.load ?? 0;

  if (recovery >= 75 && load >= 70) {
    return "RELEASE_LOAD";
  }

  return null;
}

export function applyRecoveryObligationPenalty(game: any) {
  const obligation = getRecoveryObligation(game);

  if (!obligation) return game;

  if (obligation === "RELEASE_LOAD") {
    return {
      ...game,
      drift: Math.min(100, (game.drift ?? 0) + 2),
      load: Math.min(100, (game.load ?? 0) + 3),
    };
  }

  return game;
}
