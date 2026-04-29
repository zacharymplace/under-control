export function smoothConfidence({
  previous = 0.1,
  intensity = 0,
  persistence = 0,
}: {
  previous?: number;
  intensity: number;
  persistence?: number;
}) {
  const intensityComponent = Math.max(0, intensity - 0.65) * 2.2;
  const persistenceComponent = Math.min(0.25, persistence * 0.03);

  const target = Math.min(0.95, 0.1 + intensityComponent + persistenceComponent);

  // Smooth ramp instead of jump.
  const next = previous * 0.7 + target * 0.3;

  return Number(next.toFixed(2));
}
