type WeightBreakdownPersona = {
  name?: string;
  confidence?: number;
  [key: string]: unknown;
};

type WeightBreakdownCredibility = Record<string, number | undefined>;

export function getWeightBreakdown(
  persona: WeightBreakdownPersona,
  credibility: WeightBreakdownCredibility | null | undefined
) {
  const key = String(persona.id || persona.name || "").toUpperCase();

  return {
    confidence: persona.confidence ?? 1,
    credibility: credibility?.[key] ?? 1,
    weight: Number(
      ((persona.confidence ?? 1) * (credibility?.[key] ?? 1)).toFixed(2)
    ),
  };
}
