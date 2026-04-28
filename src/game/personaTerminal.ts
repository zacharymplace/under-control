export function buildPersonaTerminalComments({
  personas,
  trust,
  ignoredCounts,
  moodMap,
  game,
}: {
  personas: any[];
  trust: Record<string, number>;
  ignoredCounts: Record<string, number>;
  moodMap: Record<string, string>;
  game: any;
}) {
  return personas.map((p) => {
    const t = trust[p.name] ?? 0;
    const ignored = ignoredCounts[p.name] ?? 0;
    const mood = moodMap[p.name] ?? "CALM";

    let text = "";

    // High trust, ignored → frustration
    if (t >= 2 && ignored >= 2) {
      text = "I was flagging this earlier. Acting sooner would have changed the trajectory.";
    }

    // Low trust → doubt
    else if (t <= -1) {
      text = "The read wasn’t clean enough to justify the decisions made.";
    }

    // Structural warning
    else if (p.name === "MARA" && game.integrity < 70) {
      text = "Structure weakened over time. Stabilizing earlier would have kept recovery viable.";
    }

    // Risk warning
    else if (p.name === "ISHAAN" && game.drift > 40) {
      text = "Instability compounded faster than it could be corrected.";
    }

    // Analytical
    else if (p.name === "ELENA") {
      text = "Signal clarity didn’t translate into safe timing.";
    }

    else {
      text = "The system moved out of a recoverable range before correction.";
    }

    // Mood modifier
    if (mood === "ASSERTIVE") {
      text = text.replace(".", ". You pushed past safer thresholds.");
    }

    if (mood === "DEFENSIVE") {
      text = "Given the uncertainty, " + text.toLowerCase();
    }

    return {
      name: p.name,
      text,
      mood,
      trust: t,
    };
  });
}
