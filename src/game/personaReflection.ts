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

    return {
      name: p.name,
      text: `${p.name} ${summary}`,
      trust: t,
      ignored,
    };
  });
}
