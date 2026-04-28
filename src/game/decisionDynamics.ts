export function getRepeatPenalty(action: string, history: string[]) {
  if (!history.length) return 1;

  const last = history[history.length - 1];
  if (last !== action) return 1;

  let repeatCount = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === action) repeatCount++;
    else break;
  }

  // diminishing returns curve
  return Math.max(0.6, 1 - repeatCount * 0.15);
}

export function getIgnoredPenalty(ignored: number) {
  // sigmoid-style decay
  const k = 1.2;
  const x0 = 3;
  return 1 / (1 + Math.exp(k * (ignored - x0)));
}
