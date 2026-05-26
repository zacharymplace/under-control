type TimelinePhaseEntry = {
  after: {
    load?: number;
    drift?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function getPhase(entry: TimelinePhaseEntry) {
  const load = entry.after.load ?? 0;
  const drift = entry.after.drift ?? 0;

  if (load < 75 && drift < 35) return "STABLE";
  if (load < 90 && drift < 50) return "ESCALATING";
  return "CRITICAL";
}
