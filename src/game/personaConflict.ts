export type PersonaConflict = {
  level: "NONE" | "TENSION" | "CONFLICT";
  title: string;
  lines: string[];
};

type PersonaConflictAdvisor = {
  name?: string;
  role?: string;
  suggests?: string | null;
  action?: string | null;
  suggestion?: string | null;
  mood?: string | null;
  behaviorNote?: string | null;
};

type PersonaConflictGameState = {
  pressure?: string;
  load?: number;
  drift?: number;
};

export function buildPersonaConflict(
  personas: PersonaConflictAdvisor[],
  game: PersonaConflictGameState
): PersonaConflict | null {
  const suggestions = personas
    .map((persona) => ({
      name: (persona.name || "").toUpperCase(),
      role: persona.role || "Advisor",
      suggests: persona.suggests || persona.action || persona.suggestion,
      mood: persona.mood,
      behaviorNote: persona.behaviorNote,
    }))
    .filter((persona) => persona.suggests);

  const unique = new Set(suggestions.map((persona) => persona.suggests));

  if (unique.size <= 1) return null;

  const critical =
    game.pressure === "CRITICAL" || (game.load ?? 0) >= 90 || (game.drift ?? 0) >= 50;
  const level = unique.size >= 3 || critical ? "CONFLICT" : "TENSION";

  const lines = suggestions.map((persona) => {
    if (persona.name === "ELENA") {
      return `ELENA challenges the read: “Signal supports ${persona.suggests}, but this may be getting misread under pressure.”`;
    }

    if (persona.name === "MARA") {
      return `MARA pushes structure: “The system cannot absorb more instability. ${persona.suggests} is the safer control path.”`;
    }

    if (persona.name === "ISHAAN") {
      return `ISHAAN flags downside: “The risk profile is moving faster than the team consensus. ${persona.suggests} should be prioritized.”`;
    }

    return `${persona.name} argues for ${persona.suggests}.`;
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
