export type PersonaConflict = {
  level: "NONE" | "TENSION" | "CONFLICT";
  title: string;
  lines: string[];
};

export function buildPersonaConflict(personas: any[], game: any): PersonaConflict | null {
  const suggestions = personas
    .map((p) => ({
      name: (p.name || "").toUpperCase(),
      role: p.role || "Advisor",
      suggests: p.suggests || p.action || p.suggestion,
      mood: p.mood,
      behaviorNote: p.behaviorNote,
    }))
    .filter((p) => p.suggests);

  const unique = new Set(suggestions.map((p) => p.suggests));

  if (unique.size <= 1) return null;

  const critical = game.pressure === "CRITICAL" || game.load >= 90 || game.drift >= 50;
  const level = unique.size >= 3 || critical ? "CONFLICT" : "TENSION";

  const lines = suggestions.map((p) => {
    if (p.name === "ELENA") {
      return `ELENA challenges the read: “Signal supports ${p.suggests}, but this may be getting misread under pressure.”`;
    }

    if (p.name === "MARA") {
      return `MARA pushes structure: “The system cannot absorb more instability. ${p.suggests} is the safer control path.”`;
    }

    if (p.name === "ISHAAN") {
      return `ISHAAN flags downside: “The risk profile is moving faster than the team consensus. ${p.suggests} should be prioritized.”`;
    }

    return `${p.name} argues for ${p.suggests}.`;
  });

  return {
    level,
    title:
      level === "CONFLICT"
        ? "Team conflict is affecting the decision window"
        : "Team tension is emerging",
    lines,
  };
}
