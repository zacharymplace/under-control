type ConfidenceInput = number | string | null | undefined;

export function normalizeConfidence(value: ConfidenceInput) {
  if (typeof value === "number") return Math.max(0, Math.min(1, value));

  const text = String(value || "").toUpperCase();

  if (text === "HIGH") return 0.9;
  if (text === "MEDIUM") return 0.65;
  if (text === "NEUTRAL") return 0.5;
  if (text === "LOW") return 0.3;

  return 0.5;
}

export function computeEffectiveWeight({
  confidence,
  credibility,
  trust,
}: {
  confidence?: ConfidenceInput;
  credibility?: number;
  trust?: number;
}) {
  const c = normalizeConfidence(confidence);
  const cr = credibility ?? 0.5;
  const t = trust ?? 1;

  return Math.max(0.05, Math.min(1, c * cr * t));
}
