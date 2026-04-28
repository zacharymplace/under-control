export type PersonaMood = "CALM" | "ASSERTIVE" | "DEFENSIVE" | "ERRATIC";

export function derivePersonaMood({
  trust,
  ignored,
  game,
}: {
  trust: number;
  ignored: number;
  game: any;
}): PersonaMood {
  if (game.drift >= 65) return "ERRATIC";
  if (trust <= -2) return "DEFENSIVE";
  if (ignored >= 4) return "ASSERTIVE";
  return "CALM";
}

export function applyMoodToText({
  baseText,
  mood,
  action,
}: {
  baseText: string;
  mood: PersonaMood;
  action: string;
}) {
  if (mood === "ASSERTIVE") {
    return `${baseText} I am going to keep pressing this until it is addressed.`;
  }

  if (mood === "DEFENSIVE") {
    return `${baseText} I may be overcorrecting, but this is the safer read.`;
  }

  if (mood === "ERRATIC") {
    return `${baseText} Something is moving underneath this. I do not fully trust the state.`;
  }

  return baseText;
}

export function moodInfluence(mood: PersonaMood) {
  if (mood === "ASSERTIVE") return 1.25;
  if (mood === "DEFENSIVE") return 0.85;
  if (mood === "ERRATIC") return 0.65;
  return 1;
}
