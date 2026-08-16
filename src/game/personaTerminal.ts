type PersonaTerminalPersona = {
  name: string;
};

type PersonaTerminalGameState = {
  integrity?: number;
  drift?: number;
};

export function buildPersonaTerminalComments({
  personas,
  trust,
  ignoredCounts,
  moodMap,
  game,
}: {
  personas: PersonaTerminalPersona[];
  trust: Record<string, number>;
  ignoredCounts: Record<string, number>;
  moodMap: Record<string, string>;
  game: PersonaTerminalGameState;
}) {
  return personas.map((persona) => {
    const t = trust[persona.name] ?? 0;
    const ignored = ignoredCounts[persona.name] ?? 0;
    const mood = moodMap[persona.name] ?? "CALM";

    let text = "";

    if (t >= 2 && ignored >= 2) {
      text = "I was flagging this earlier. Acting sooner would have changed the trajectory.";
    } else if (t <= -1) {
      text = "The read wasn’t clean enough to justify the decisions made.";
    } else if (persona.name === "MARA" && (game.integrity ?? 100) < 70) {
      text = "Structure weakened over time. Stabilizing earlier would have kept recovery viable.";
    } else if (persona.name === "ISHAAN" && (game.drift ?? 0) > 40) {
      text = "Instability compounded faster than it could be corrected.";
    } else if (persona.name === "ELENA") {
      text = "Signal clarity didn’t translate into safe timing.";
    } else {
      text = "The system moved out of a recoverable range before correction.";
    }

    if (mood === "ASSERTIVE") {
      text = text.replace(".", ". You pushed past safer thresholds.");
    }

    if (mood === "DEFENSIVE") {
      text = "Given the uncertainty, " + text.toLowerCase();
    }

    return {
      name: persona.name,
      text,
      mood,
      trust: t,
    };
  });
}
