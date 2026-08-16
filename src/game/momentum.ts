type MomentumSnapshot = {
  integrity?: number;
  load?: number;
  drift?: number;
};

type MomentumLogEntry = {
  after: MomentumSnapshot;
};

export function detectMomentum(log: MomentumLogEntry[]) {
  if (!log || log.length < 3) return null;

  let trend = 0;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1].after;
    const curr = log[i].after;

    const delta =
      ((curr.integrity ?? 0) - (prev.integrity ?? 0)) -
      ((curr.load ?? 0) - (prev.load ?? 0)) -
      ((curr.drift ?? 0) - (prev.drift ?? 0));

    trend += delta;
  }

  if (trend > 10) return "Improving";
  if (trend < -10) return "Degrading";
  return "Flat";
}
