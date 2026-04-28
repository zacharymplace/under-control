export function buildCriticalDecision({
  personas,
  turn,
}: {
  personas: any[];
  turn: number | null;
}) {
  if (!turn || !personas) return null;

  return personas.map((p) => ({
    name: p.name,
    suggested: p.action,
    confidence: p.confidence,
    trust: p.trust ?? 0,
  }));
}
