import { Trust } from "./trust";

export function buildPersonaReflection({
  trust,
  ignoredCounts,
  personas,
  log,
}: {
  trust: Trust;
  ignoredCounts: Record<string, number>;
  personas: any[];
  log: any[];
}) {
  return personas.map((p) => {
    const t = trust[p.name] ?? 0;
    const ignored = ignoredCounts[p.name] ?? 0;

    const early = log.slice(0, 3);
    const late = log.slice(-3);

    const earlyUsed = early.some(l => l.action === p.suggestedAction);
    const lateUsed = late.some(l => l.action === p.suggestedAction);

    let text = "";

    // Strong signal cases
    if (t >= 3 && ignored <= 1) {
      text = `${p.name} was consistently reliable and correctly followed.`;
    }

    // Trusted but misapplied
    else if (t >= 2 && lateUsed && !earlyUsed) {
      text = `${p.name} was correct late, but not leveraged early enough to prevent escalation.`;
    }

    // Ignored good signal
    else if (t >= 2 && ignored >= 2) {
      text = `${p.name} was often correct but ignored during key moments.`;
    }

    // Over-trusted weak signal
    else if (t <= -1 && earlyUsed) {
      text = `${p.name} influenced early decisions despite weak alignment with outcomes.`;
    }

    // Neutral
    else {
      text = `${p.name} had mixed impact depending on timing and context.`;
    }

    // Add behavioral modifier
    if (ignored >= 3) {
      text += " Frequently ignored.";
    }

    return {
      name: p.name,
      text,
      trust: t,
      ignored,
    };
  });
}
