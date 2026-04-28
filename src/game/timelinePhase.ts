export function getPhase(entry: any) {
  const { load, drift } = entry.after;

  if (load < 75 && drift < 35) return "STABLE";
  if (load < 90 && drift < 50) return "ESCALATING";
  return "CRITICAL";
}
