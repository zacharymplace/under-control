export function findLastRecoverableMoment(log: any[]) {
  if (!log || log.length < 3) return null;

  let candidate = null;

  for (const entry of log) {
    const after = entry.after;

    const stillRecoverable =
      after.load < 95 &&
      after.drift < 60 &&
      after.integrity > 55;

    const needsCorrection =
      after.load >= 80 || after.drift >= 45 || after.integrity <= 65;

    if (stillRecoverable && needsCorrection) {
      let recommendedAction = "STABILIZE";

      if (after.load >= 85 && after.drift < 55) recommendedAction = "REROUTE";
      if (after.drift >= 45) recommendedAction = "STABILIZE";
      if (after.signalClarity < 60) recommendedAction = "OBSERVE";

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
