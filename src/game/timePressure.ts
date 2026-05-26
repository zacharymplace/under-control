type TimePressureGameState = {
  load?: number;
  pressure?: string;
  [key: string]: unknown;
};

export function getTimePressureMultiplier(game: TimePressureGameState) {
  const load = game.load ?? 0;
  const pressure = game.pressure ?? "LOW";

  if (pressure === "CRITICAL" || load >= 90) return 1.6;
  if (pressure === "HIGH" || load >= 75) return 1.3;
  if (pressure === "MEDIUM") return 1.1;

  return 1.0;
}
