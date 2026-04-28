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
    const domain = p.role || p.defaultActionBias || "Advisor";
    const temperament = p.temperament || "Advisor";

    const early = log.slice(0, 3);
    const late = log.slice(-3);

    const suggested = p.action || p.suggestedAction;
    const earlyUsed = early.some((entry: any) => entry.action === suggested);
    const lateUsed = late.some((entry: any) => entry.action === suggested);

    let text = "";

    if (p.name === "ELENA") {
      if (t >= 2 && ignored >= 2) {
        text =
          "ELENA read the signal correctly, but her guidance was not prioritized during the decision window.";
      } else if (t <= -1) {
        text =
          "ELENA’s signal read was noisy; treating clarity as stable created timing risk.";
      } else {
        text =
          "ELENA helped clarify the operating picture, but signal alone did not resolve system pressure.";
      }
    } else if (p.name === "MARA") {
      if (t >= 2 && ignored >= 2) {
        text =
          "MARA identified structural risk early, but repeated disregard let instability compound.";
      } else if (lateUsed && !earlyUsed) {
        text =
          "MARA was engaged late; structure improved, but not early enough to prevent escalation.";
      } else {
        text =
          "MARA’s structural read was useful, but structure protection needed better timing against load.";
      }
    } else if (p.name === "ISHAAN") {
      if (t >= 2 && ignored >= 2) {
        text =
          "ISHAAN flagged downside risk, but escalation was not acted on soon enough.";
      } else if (t >= 2) {
        text =
          "ISHAAN’s risk read aligned with the failure path and helped expose the downside pattern.";
      } else {
        text =
          "ISHAAN framed the downside, but the risk signal needed stronger action discipline.";
      }
    } else if (t >= 3 && ignored <= 1) {
      text = `${p.name} was consistently reliable and correctly followed.`;
    } else if (t >= 2 && ignored >= 2) {
      text = `${p.name} was often correct but ignored during key moments.`;
    } else if (t <= -1 && earlyUsed) {
      text = `${p.name} influenced early decisions despite weak alignment with outcomes.`;
    } else {
      text = `${p.name} had mixed impact depending on timing and context.`;
    }

    if (ignored >= 3 && !text.includes("ignored") && !text.includes("disregard")) {
      text += " Frequently ignored.";
    }

    return {
      name: p.name,
      text: `${p.name} (${domain} · ${temperament}) — ${text}`,
      trust: t,
      ignored,
    };
  });
}
