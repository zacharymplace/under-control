type InevitabilitySnapshot = {
  drift?: number;
  load?: number;
  integrity?: number;
};

type InevitabilityLogEntry = {
  turn?: number;
  after: InevitabilitySnapshot;
};

export function findInevitabilityPoint(log: InevitabilityLogEntry[]) {
  if (!log || log.length < 3) return null;

  for (let i = 0; i < log.length; i++) {
    const entry = log[i];
    const next = log[i + 1];
    const after = entry.after;

    const drift = after.drift ?? 0;
    const load = after.load ?? 0;
    const integrity = after.integrity ?? 100;

    const driftSevere = drift >= 60;
    const loadSevere = load >= 95;
    const integrityWeak = integrity <= 55;
    const nextWorse =
      next &&
      ((next.after.drift ?? 0) > drift ||
        (next.after.load ?? 0) > load ||
        (next.after.integrity ?? 100) < integrity);

    if ((driftSevere && loadSevere) || (driftSevere && integrityWeak && nextWorse)) {
      return {
        turn: entry.turn,
        title: "Recovery window effectively closed",
        detail:
          "System instability exceeded the level that normal corrective actions could reliably reverse.",
      };
    }
  }

  return null;
}
