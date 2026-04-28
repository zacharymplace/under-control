export function buildPersonaReflection({
  trust = {},
  ignoredCounts = {},
  personas = [],
}: any) {
  return personas.map((p: any) => {
    const name = p.name;
    const t = trust[name] ?? 0;
    const ignored = ignoredCounts[name] ?? 0;
    const role = p.role || "Advisor";
    const temperament = p.temperament || "Adaptive";

    let text = `${name} had mixed impact depending on timing and context.`;

    if (name === "ELENA") {
      text =
        t < 0
          ? "ELENA's signal read was noisy; treating clarity as stable created timing risk."
          : "ELENA helped clarify the operating picture, but signal alone did not resolve pressure.";
    }

    if (name === "MARA") {
      text =
        ignored >= 3
          ? "MARA identified structural risk, but repeated disregard let instability compound."
          : "MARA's structural read was useful, but protection needed better timing.";
    }

    if (name === "ISHAAN") {
      text =
        t >= 2
          ? "ISHAAN's risk read aligned with the failure path."
          : "ISHAAN framed the downside, but the risk signal needed stronger action discipline.";
    }

    if (ignored >= 3 && !text.toLowerCase().includes("ignored") && !text.toLowerCase().includes("disregard")) {
      text += " Frequently ignored.";
    }

    return {
      name,
      text: `${name} (${role} · ${temperament}) — ${text}`,
      trust: t,
      ignored,
    };
  });
}
