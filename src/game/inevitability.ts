export function findInevitabilityPoint(log: any[]) {
  if (!log || log.length < 3) return null;

  for (let i = 0; i < log.length; i++) {
    const entry = log[i];
    const next = log[i + 1];
    const after = entry.after;

    const driftSevere = after.drift >= 60;
    const loadSevere = after.load >= 95;
    const integrityWeak = after.integrity <= 55;
    const nextWorse =
      next &&
      (next.after.drift > after.drift ||
        next.after.load > after.load ||
        next.after.integrity < after.integrity);

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
