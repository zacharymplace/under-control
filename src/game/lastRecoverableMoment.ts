type RecoverableMomentSnapshot = {
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
};

type RecoverableMomentLogEntry = {
  turn?: number;
  after: RecoverableMomentSnapshot;
};

export function findLastRecoverableMoment(log: RecoverableMomentLogEntry[]) {
  if (!log || log.length < 3) return null;

  let candidate = null;

  for (const entry of log) {
    const after = entry.after;

    const load = after.load ?? 0;
    const drift = after.drift ?? 0;
    const integrity = after.integrity ?? 100;
    const signalClarity = after.signalClarity ?? 100;

    const stillRecoverable =
      load < 95 &&
      drift < 60 &&
      integrity > 55;

    const needsCorrection =
      load >= 80 || drift >= 45 || integrity <= 65;

    if (stillRecoverable && needsCorrection) {
      let recommendedAction = "STABILIZE";

      if (load >= 85 && drift < 55) recommendedAction = "REROUTE";
      if (drift >= 45) recommendedAction = "STABILIZE";
      if (signalClarity < 60) recommendedAction = "OBSERVE";

      candidate = {
        turn: entry.turn,
        recommendedAction,
        title: `Turn ${entry.turn} — Last recoverable moment`,
        detail:
          `${recommendedAction} here had the best chance to prevent the later failure pattern.`,
      };
    }
  }

  return candidate;
}
