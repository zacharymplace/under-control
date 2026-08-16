type PersonaReflectionPersona = {
  name: string;
  role?: string;
  temperament?: string;
};

type PersonaReflectionInput = {
  trust?: Record<string, number | undefined>;
  ignoredCounts?: Record<string, number | undefined>;
  personas?: PersonaReflectionPersona[];
};

export function buildPersonaReflection({
  trust = {},
  ignoredCounts = {},
  personas = [],
}: PersonaReflectionInput) {
  return personas.map((persona) => {
    const name = persona.name;
    const t = trust[name] ?? 0;
    const ignored = ignoredCounts[name] ?? 0;
    const role = persona.role || "Advisor";
    const temperament = persona.temperament || "Adaptive";

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

    if (
      ignored >= 3 &&
      !text.toLowerCase().includes("ignored") &&
      !text.toLowerCase().includes("disregard")
    ) {
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
