export function getLockedActions(game: any): string[] {
  const history = game.actionHistory || [];
  const tendency = game.playerTendency;

  if (!tendency || history.length < 6) return [];

  const locks: string[] = [];

  // over-observe lock
  if (tendency.dominantStyle === "OBSERVE" && tendency.tendencies.OBSERVE > 0.6) {
    locks.push("OBSERVE");
  }

  // over-reroute lock
  if (tendency.dominantStyle === "REROUTE" && tendency.tendencies.REROUTE > 0.6) {
    locks.push("REROUTE");
  }

  // over-stabilize lock
  if (tendency.dominantStyle === "STABILIZE" && tendency.tendencies.STABILIZE > 0.65) {
    locks.push("STABILIZE");
  }

  return locks;
}
