export type Mood = "CONFIDENT" | "FRUSTRATED" | "DISENGAGED" | "NEUTRAL";
export type PersonaMood = "CALM" | "ASSERTIVE" | "DEFENSIVE" | "ERRATIC";

type PersonaMoodGameState = {
  drift?: number;
};

export function getMood(trust: number, ignored: number): Mood {
  if (trust >= 3 && ignored <= 1) return "CONFIDENT";
  if (trust <= -2 && ignored >= 3) return "FRUSTRATED";
  if (ignored >= 4) return "DISENGAGED";
  return "NEUTRAL";
}

export function derivePersonaMood({
  trust,
  ignored,
  game,
}: {
  trust: number;
  ignored: number;
  game: PersonaMoodGameState;
}): PersonaMood {
  if ((game?.drift ?? 0) >= 65) return "ERRATIC";
  if (trust <= -2) return "DEFENSIVE";
  if (ignored >= 4) return "ASSERTIVE";
  return "CALM";
}

export function applyMoodToText({
  baseText,
  mood,
  name,
}: {
  baseText: string;
  mood: PersonaMood;
  action?: string;
  name?: string;
  turn?: number;
}) {
  if (mood === "ASSERTIVE") {
    if (name === "ELENA") return `${baseText} This is being overlooked in the signal.`;
    if (name === "MARA") return `${baseText} Structural risk is being ignored.`;
    if (name === "ISHAAN") return `${baseText} Downside risk is accelerating.`;
    return `${baseText} This needs attention.`;
  }

  if (mood === "DEFENSIVE") {
    if (name === "ELENA") return `${baseText} I do not fully trust the picture.`;
    if (name === "MARA") return `${baseText} The structure is sending mixed signals.`;
    if (name === "ISHAAN") return `${baseText} The risk profile is unstable.`;
    return `${baseText} Confidence is reduced.`;
  }

  if (mood === "ERRATIC") {
    if (name === "ELENA") return `${baseText} The readings are moving under us.`;
    if (name === "MARA") return `${baseText} The system is behaving unevenly under load.`;
    if (name === "ISHAAN") return `${baseText} The downside is moving faster than the system admits.`;
    return `${baseText} The system state is unstable.`;
  }

  return baseText;
}

export function moodInfluence(mood: PersonaMood) {
  if (mood === "ASSERTIVE") return 1.25;
  if (mood === "DEFENSIVE") return 0.85;
  if (mood === "ERRATIC") return 0.65;
  return 1;
}
