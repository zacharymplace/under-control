import { Trust } from "./trust";

export function buildPersonaReflection({
  trust,
  ignoredCounts,
  personas,
}: {
  trust: Trust;
  ignoredCounts: Record<string, number>;
  personas: any[];
}) {
  return personas.map((p) => {
    const t = trust[p.name] ?? 0;
    const ignored = ignoredCounts[p.name] ?? 0;
    const mood = p.mood || "CALM";
    const temperament = p.temperament || "ADVISOR";

    let summary = "";

    if (t >= 3) {
      summary = "was reliable and aligned with outcomes.";
    } else if (t <= -2) {
      summary = "was often incorrect or misleading.";
    } else {
      summary = "had mixed impact on decisions.";
    }

    if (ignored >= 3) {
      summary += " Frequently ignored.";
    }

    if (mood === "ASSERTIVE") {
      summary += " Became more forceful due to being deprioritized.";
    }

    if (mood === "DEFENSIVE") {
      summary += " Became more cautious after poor trust outcomes.";
    }

    if (mood === "ERRATIC") {
      summary += " Became less reliable under high drift.";
    }

    return {
      name: p.name,
      text: `${p.name} (${temperament}) ${summary}`,
      trust: t,
      ignored,
      mood,
    };
  });
}
