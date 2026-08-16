type PlayerTendency = {
  dominantStyle?: string;
  tendencies?: Partial<Record<"OBSERVE" | "REROUTE" | "STABILIZE", number>>;
};

type LockInGameState = {
  actionHistory?: string[];
  playerTendency?: PlayerTendency | null;
  [key: string]: unknown;
};

export function getLockedActions(game: LockInGameState): string[] {
  const history = game.actionHistory || [];
  const tendency = game.playerTendency;

  if (!tendency || history.length < 6) return [];

  const locks: string[] = [];
  const tendencies = tendency.tendencies || {};

  if (tendency.dominantStyle === "OBSERVE" && (tendencies.OBSERVE ?? 0) > 0.6) {
    locks.push("OBSERVE");
  }

  if (tendency.dominantStyle === "REROUTE" && (tendencies.REROUTE ?? 0) > 0.6) {
    locks.push("REROUTE");
  }

  if (tendency.dominantStyle === "STABILIZE" && (tendencies.STABILIZE ?? 0) > 0.65) {
    locks.push("STABILIZE");
  }

  return locks;
}
