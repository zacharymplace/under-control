export type Trust = Record<string, number>;

export const initialTrust: Trust = {
  ELENA: 0,
  MARA: 0,
  ISHAAN: 0,
};

function clamp(value: number) {
  return Math.max(-5, Math.min(5, value));
}

export function updateTrust(
  trust: Trust,
  personas: any[],
  chosenAction: string,
  evaluatePersona: (persona: any) => "GOOD" | "BAD" | "NEUTRAL"
) {
  const next = { ...trust };

  personas.forEach((persona) => {
    if (persona.action !== chosenAction) return;

    const outcome = evaluatePersona(persona);

    if (outcome === "GOOD") {
      next[persona.name] = clamp((next[persona.name] ?? 0) + 1);
    }

    if (outcome === "BAD") {
      next[persona.name] = clamp((next[persona.name] ?? 0) - 1);
    }
  });

  return next;
}
