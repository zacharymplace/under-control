type RecoveryObligationGameState = {
  recoveryProgress?: number;
  load?: number;
  drift?: number;
  [key: string]: unknown;
};

export function getRecoveryObligation(game: RecoveryObligationGameState) {
  const recovery = game.recoveryProgress ?? 0;
  const load = game.load ?? 0;

  if (recovery >= 75 && load >= 70) {
    return "RELEASE_LOAD";
  }

  return null;
}

export function applyRecoveryObligationPenalty<T extends RecoveryObligationGameState>(
  game: T
) {
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
