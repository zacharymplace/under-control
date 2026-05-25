type CriticalTurnEntry = {
  turn?: number | null;
  load?: number;
  drift?: number;
  integrity?: number;
};

export function findCriticalTurn(log: CriticalTurnEntry[]) {
  if (!log || log.length < 2) return null;

  let worstDelta = 0;
  let critical = null;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    const pressurePrev =
      (prev.load ?? 0) + (prev.drift ?? 0) - (prev.integrity ?? 0);
    const pressureCurr =
      (curr.load ?? 0) + (curr.drift ?? 0) - (curr.integrity ?? 0);

    const delta = pressureCurr - pressurePrev;

    if (delta > worstDelta) {
      worstDelta = delta;
      critical = curr.turn ?? null;
    }
  }

  return critical;
}
