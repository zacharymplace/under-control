export type Trust = Record<string, number>;

export const initialTrust: Trust = {
  ELENA: 0,
  MARA: 0,
  ISHAAN: 0,
};

export function updateTrust(
  trust: Trust,
  personas: any[],
  chosenAction: string,
  outcome: "GOOD" | "BAD" | "NEUTRAL"
) {
  const next = { ...trust };

  personas.forEach((persona) => {
    if (persona.action !== chosenAction) return;

    if (outcome === "GOOD") next[persona.name] += 1;
    if (outcome === "BAD") next[persona.name] -= 1;
  });

  return next;
}
