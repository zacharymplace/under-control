export const initialIgnoredCounts: Record<string, number> = {
  ELENA: 0,
  MARA: 0,
  ISHAAN: 0,
};

export function updateIgnoredCounts(
  ignoredCounts: Record<string, number>,
  personas: any[],
  chosenAction: string
) {
  const next = { ...ignoredCounts };

  personas.forEach((persona) => {
    if (persona.action === chosenAction) {
      next[persona.name] = Math.max(0, (next[persona.name] ?? 0) - 1);
    } else {
      next[persona.name] = (next[persona.name] ?? 0) + 1;
    }
  });

  return next;
}
