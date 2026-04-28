export function findCriticalTurn(log: any[]) {
  if (!log || log.length < 2) return null;

  let worstDelta = 0;
  let critical = null;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    const pressurePrev = prev.load + prev.drift - prev.integrity;
    const pressureCurr = curr.load + curr.drift - curr.integrity;

    const delta = pressureCurr - pressurePrev;

    if (delta > worstDelta) {
      worstDelta = delta;
      critical = curr.turn;
    }
  }

  return critical;
}
