export function getWeightBreakdown(persona: any, credibility: any) {
  const key = String(persona.id || persona.name || "").toUpperCase();

  return {
    confidence: persona.confidence ?? 1,
    credibility: credibility?.[key] ?? 1,
    weight: Number(
      ((persona.confidence ?? 1) * (credibility?.[key] ?? 1)).toFixed(2)
    ),
  };
}
