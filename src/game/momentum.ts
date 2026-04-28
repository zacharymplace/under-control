export function detectMomentum(log: any[]) {
  if (!log || log.length < 3) return null;

  let trend = 0;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1].after;
    const curr = log[i].after;

    const delta =
      (curr.integrity - prev.integrity) -
      (curr.load - prev.load) -
      (curr.drift - prev.drift);

    trend += delta;
  }

  if (trend > 10) return "Improving";
  if (trend < -10) return "Degrading";
  return "Flat";
}
