export type PersonaReaction = {
  mood: "CALM" | "ASSERTIVE" | "DEFENSIVE" | "DISENGAGED";
  note: string;
};

export function getPersonaReaction(name: string, game: any): PersonaReaction {
  const trust = game.trust?.[name] ?? 0;
  const ignored = game.ignoredCounts?.[name] ?? 0;

  if (ignored >= 6) {
    return {
      mood: "DISENGAGED",
      note: "Repeatedly ignored; influence is fading.",
    };
  }

  if (ignored >= 3 && trust >= 1) {
    return {
      mood: "ASSERTIVE",
      note: "Correct signals have been ignored.",
    };
  }

  if (trust <= -2) {
    return {
      mood: "DEFENSIVE",
      note: "Recent calls have been unreliable.",
    };
  }

  return {
    mood: "CALM",
    note: "Operating normally.",
  };
}

export function applyReactionTone(name: string, baseText: string, reaction: PersonaReaction) {
  if (reaction.mood === "ASSERTIVE") {
    if (name === "ELENA") return `${baseText} The signal should not be dismissed again.`;
    if (name === "MARA") return `${baseText} Structure needs priority now.`;
    if (name === "ISHAAN") return `${baseText} The downside is becoming harder to ignore.`;
  }

  if (reaction.mood === "DEFENSIVE") {
    return `${baseText} I am lowering confidence on this read.`;
  }

  if (reaction.mood === "DISENGAGED") {
    return `${baseText} My influence is limited because prior guidance was ignored.`;
  }

  return baseText;
}
