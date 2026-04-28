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
  outcome: "GOOD" | "BAD" | "NEUTRAL"
) {
  const next = { ...trust };

  personas.forEach((p) => {
    const followed = p.action === chosenAction;

    if (followed) {
      if (outcome === "GOOD") next[p.name] = clamp((next[p.name] ?? 0) + 1);
      if (outcome === "BAD") next[p.name] = clamp((next[p.name] ?? 0) - 1);
    }

    if (!followed && outcome === "BAD" && p.confidence === "HIGH") {
      next[p.name] = clamp((next[p.name] ?? 0) - 0.5);
    }
  });

  return next;
}
