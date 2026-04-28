export function getIgnoredPenalty(name: string, game: any) {
  const ignored = game.ignoredCounts?.[name] ?? 0;

  if (ignored >= 5) return 0.6;
  if (ignored >= 3) return 0.75;
  if (ignored >= 1) return 0.9;

  return 1;
}

export function getTrustModifier(name: string, game: any) {
  const trust = game.trust?.[name] ?? 0;

  if (trust >= 4) return 1.25;
  if (trust >= 2) return 1.1;
  if (trust <= -3) return 0.75;
  if (trust <= -1) return 0.9;

  return 1;
}
