export type Trust = Record<string, number>;

export const initialTrust: Trust = {
  ELENA: 0,
  MARA: 0,
  ISHAAN: 0,
};

function clampTrust(value: number) {
  return Math.max(-5, Math.min(5, value));
}

export function updateTrust(
  trust: Trust,
  personas: any[],
  chosenAction: string,
  outcome: "GOOD" | "BAD" | "NEUTRAL"
) {
  const next = { ...trust };

  personas.forEach((persona) => {
    if (persona.action !== chosenAction) return;

    if (outcome === "GOOD") {
      next[persona.name] = clampTrust((next[persona.name] ?? 0) + 1);
    }

    if (outcome === "BAD") {
      next[persona.name] = clampTrust((next[persona.name] ?? 0) - 1);
    }
  });

  return next;
}
