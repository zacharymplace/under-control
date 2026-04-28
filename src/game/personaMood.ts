export type PersonaMood = "CALM" | "ASSERTIVE" | "DEFENSIVE" | "ERRATIC";

function pickStable(items: string[], key: string) {
  const sum = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return items[sum % items.length];
}

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
  name,
  turn,
}: {
  baseText: string;
  mood: PersonaMood;
  action: string;
  name: string;
  turn: number;
}) {
  const key = `${name}-${mood}-${action}-${turn}`;

  const byPersona: Record<string, Record<PersonaMood, string[]>> = {
    ELENA: {
      CALM: ["The signal supports this read.", "That is the cleanest interpretation of the data."],
      ASSERTIVE: ["This is being overlooked in the signal.", "The signal is clear enough to act on this."],
      DEFENSIVE: ["My read may be conservative, but the signal still points here.", "I am discounting my own confidence, but this remains the safest read."],
      ERRATIC: ["The signal is unstable; I do not fully trust the picture.", "The readings are moving under us."],
    },
    MARA: {
      CALM: ["System integrity is the concern.", "The structure can still be protected."],
      ASSERTIVE: ["Structural risk is being ignored.", "We are underreacting to infrastructure stress."],
      DEFENSIVE: ["I may be overcorrecting, but preserving structure matters here.", "I am taking the safer infrastructure read."],
      ERRATIC: ["The system is behaving unevenly under load.", "The structure is sending mixed signals."],
    },
    ISHAAN: {
      CALM: ["Risk exposure is rising.", "The downside profile is manageable if addressed now."],
      ASSERTIVE: ["Downside risk is accelerating.", "This is where small delays become expensive."],
      DEFENSIVE: ["I may be overweighting downside risk, but the exposure is real.", "The cautious read is warranted here."],
      ERRATIC: ["The risk profile is unstable.", "The downside is moving faster than the system admits."],
    },
  };

  const variants = byPersona[name]?.[mood] ?? ["This needs attention."];

  return `${baseText} ${pickStable(variants, key)}`;
}

export function moodInfluence(mood: PersonaMood) {
  if (mood === "ASSERTIVE") return 1.25;
  if (mood === "DEFENSIVE") return 0.85;
  if (mood === "ERRATIC") return 0.65;
  return 1;
}
