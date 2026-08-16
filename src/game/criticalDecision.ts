type CriticalDecisionPersona = {
  name?: string;
  action?: string;
  confidence?: number | string;
  trust?: number;
};

export function buildCriticalDecision({
  personas,
  turn,
}: {
  personas: CriticalDecisionPersona[];
  turn: number | null;
}) {
  if (!turn || !personas) return null;

  return personas.map((persona) => ({
    name: persona.name,
    suggested: persona.action,
    confidence: persona.confidence,
    trust: persona.trust ?? 0,
  }));
}
