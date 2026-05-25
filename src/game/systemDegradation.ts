type IgnoredCounts = Record<string, number | null | undefined>;

type SystemDegradationGameState = {
  ignoredCounts?: IgnoredCounts;
  signalClarity?: number;
  signal?: number;
  drift: number;
  [key: string]: unknown;
};

export function applyIgnoredSystemPenalty<T extends SystemDegradationGameState>(game: T) {
  const ignored = game.ignoredCounts || {};

  const totalIgnored = Object.values(ignored).reduce<number>(
    (sum, value) => sum + Number(value ?? 0),
    0
  );

  if (totalIgnored === 0) return game;

  const penaltyFactor = Math.min(0.25, totalIgnored * 0.02);

  return {
    ...game,
    signalClarity: Math.max(0, (game.signalClarity ?? game.signal ?? 0) * (1 - penaltyFactor)),
    drift: game.drift + Math.round(totalIgnored * 0.5),
  };
}
